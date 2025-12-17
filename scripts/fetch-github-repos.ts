
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

// Export for direct usage in API routes (Vercel serverless friendly)
export async function syncGithubRepos() {
    console.log("🚀 Starting GitHub Repository Sync...");

    if (!GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN not found in environment.");
    }

    let allRepos: any[] = [];
    let page = 1;
    let hasNextPage = true;

    // Use environment directly for re-entry
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;

    const baseUrl = owner
        ? `https://api.github.com/users/${owner}/repos`
        : `https://api.github.com/user/repos`;

    console.log(`📡 Fetching repositories from GitHub...`);

    while (hasNextPage) {
        const url = `${baseUrl}?per_page=100&type=all&page=${page}`;
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
            };

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
                await prisma.repository.create({
                    data: {
                        ...data,
                        description: data.description || "No description",
                    }
                });
                created++;
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
