
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables robustly
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const prisma = new PrismaClient();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;

if (!GITHUB_TOKEN) {
    console.error("❌ Error: GITHUB_TOKEN not found.");
    process.exit(1);
}

// Helper to fetch raw content
async function fetchRawFile(fullName: string, defaultBranch: string, filePath: string, token: string | undefined): Promise<string | null> {
    const url = `https://raw.githubusercontent.com/${fullName}/${defaultBranch}/${filePath}`;
    try {
        const res = await fetch(url, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) return await res.text();
        return null;
    } catch {
        return null;
    }
}

// Helper to detect technology from package.json
function detectTech(pkgJson: any): any[] {
    const tech = [];
    if (pkgJson?.engines?.node) tech.push({ name: 'Node.js', version: pkgJson.engines.node, category: 'Runtime' });
    if (pkgJson?.dependencies?.react) tech.push({ name: 'React', version: pkgJson.dependencies.react, category: 'Framework' });
    if (pkgJson?.dependencies?.next) tech.push({ name: 'Next.js', version: pkgJson.dependencies.next, category: 'Framework' });
    if (pkgJson?.dependencies?.['@nestjs/core']) tech.push({ name: 'NestJS', version: pkgJson.dependencies['@nestjs/core'], category: 'Framework' });
    return tech;
}

// Export for direct usage in API routes (Vercel serverless friendly)
export async function syncGithubRepos() {
    console.log("🚀 Starting GitHub Repository Sync (Enriched)...");

    if (!GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN not found in environment.");
    }

    let allRepos: any[] = [];
    let page = 1;
    let hasNextPage = true;

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;

    // Use the authenticated user endpoint to ensure we get PRIVATE repositories too
    // The /users/:owner/repos endpoint ONLY returns public repos for users.
    const baseUrl = `https://api.github.com/user/repos`;

    // We add visibility=all to be explicit, though it's default for /user/repos
    // We add affiliation=owner,collaborator,organization_member to get everything
    const queryParams = `per_page=100&visibility=all&affiliation=owner,collaborator,organization_member`;

    while (hasNextPage) {
        // ... (fetching logic remains same)
        const url = `${baseUrl}?${queryParams}&page=${page}`;
        try {
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!res.ok) {
                console.error(`❌ Failed to fetch page ${page}: ${res.status} ${res.statusText}`);
                break;
            }

            const data = await res.json();
            if (data.length === 0) {
                hasNextPage = false;
            } else {
                allRepos = allRepos.concat(data);
                console.log(`   Page ${page}: Fetched ${data.length} repos`);
                page++;
            }
        } catch (error: any) {
            console.error(`❌ Error fetching page ${page}:`, error.message);
            hasNextPage = false;
        }
    }

    console.log(`✅ Total Repositories Fetched: ${allRepos.length}`);

    let created = 0;
    let updated = 0;

    for (const githubRepo of allRepos) {
        try {
            // Intelligent Enrichment: Fetch OpenAPI and package.json
            const defaultBranch = githubRepo.default_branch || 'main';
            let apiSpec = null;
            let pkgJson = null;

            // Try common OpenAPI locations
            const openApiPaths = ['openapi.json', 'public/openapi.json', 'docs/openapi.json', 'swagger.json'];
            for (const p of openApiPaths) {
                const content = await fetchRawFile(githubRepo.full_name, defaultBranch, p, token);
                if (content) {
                    apiSpec = content; // Keep stringified
                    break;
                }
            }

            // Fetch package.json for tech detection
            const pkgContent = await fetchRawFile(githubRepo.full_name, defaultBranch, 'package.json', token);
            if (pkgContent) {
                try {
                    pkgJson = JSON.parse(pkgContent);
                } catch { }
            }

            const existing = await prisma.repository.findFirst({
                where: {
                    OR: [
                        { name: githubRepo.name },
                        { url: githubRepo.html_url },
                        { nameWithOwner: githubRepo.full_name }
                    ]
                }
            });

            const data = {
                name: githubRepo.name,
                fullName: githubRepo.full_name,
                nameWithOwner: githubRepo.full_name,
                url: githubRepo.html_url,
                description: githubRepo.description || undefined,
                isPrivate: githubRepo.private,
                updatedAt: new Date(githubRepo.updated_at),
                pushedAt: new Date(githubRepo.pushed_at),
                apiSpec: apiSpec, // Save detected spec!
            };

            let repoId = existing?.id;

            if (existing) {
                await prisma.repository.update({
                    where: { id: existing.id },
                    data: {
                        ...data,
                        description: existing.description || data.description
                    }
                });
                updated++;
            } else {
                const newRepo = await prisma.repository.create({
                    data: {
                        ...data,
                        description: data.description || "No description",
                    }
                });
                repoId = newRepo.id;
                created++;
            }

            // Sync Technologies if package.json found
            if (pkgJson && repoId) {
                const techs = detectTech(pkgJson);
                for (const t of techs) {
                    const techExists = await prisma.technology.findFirst({
                        where: { repositoryId: repoId, name: t.name }
                    });

                    if (techExists) {
                        // Update version if it changed
                        if (techExists.version !== t.version) {
                            await prisma.technology.update({
                                where: { id: techExists.id },
                                data: { version: t.version, category: t.category } // Update category too just in case
                            });
                            console.log(`      Updated ${t.name} from ${techExists.version} to ${t.version}`);
                        }
                    } else {
                        await prisma.technology.create({
                            data: {
                                repositoryId: repoId,
                                name: t.name,
                                version: t.version,
                                category: t.category
                            }
                        });
                        console.log(`      Added ${t.name} ${t.version}`);
                    }
                }
            }

        } catch (e: any) {
            console.error(`❌ Failed to sync ${githubRepo.name}: ${e.message}`);
        }
    }

    console.log("\n📊 Sync Summary:");
    console.log(`   New Repos: ${created}`);
    console.log(`   Updated:   ${updated}`);

    return { created, updated, total: allRepos.length };
}

// Only execute if running directly as a script (CLI)
// In ES modules / TSX, checking if file is main module is slightly different
import { fileURLToPath } from 'url';

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
    syncGithubRepos()
        .catch(console.error)
        .finally(async () => await prisma.$disconnect());
}
