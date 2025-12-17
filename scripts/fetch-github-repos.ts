
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

async function fetchAllRepos() {
    console.log("🚀 Starting GitHub Repository Sync...");

    let allRepos: any[] = [];
    let page = 1;
    let hasNextPage = true;

    // Determine URL: User or Org?
    // If GITHUB_OWNER is set, try to see if it's an org or user. 
    // Safest is to list "my" repos if the token belongs to the user, or org repos if explicit.
    // Let's use /user/repos if we want everything the user has access to, or /orgs/OWNER/repos if filtered.
    // Users often want "all my repos".

    const baseUrl = GITHUB_OWNER
        ? `https://api.github.com/users/${GITHUB_OWNER}/repos` // or orgs, but users endpoint works for both usually if type=all
        : `https://api.github.com/user/repos`;

    console.log(`📡 Fetching repositories from GitHub...`);

    while (hasNextPage) {
        const url = `${baseUrl}?per_page=100&type=all&page=${page}`;
        try {
            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
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
        // Skip archived if desired? User wanted "missing", assume active usually.
        // Let's keep them but maybe mark them. Our DB schema might not have archived flag on Repository model directly?
        // Let's check schema/types.
        // Assuming minimal fields for now.

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
                description: githubRepo.description || undefined, // Don't overwrite with null if we have better local?
                isPrivate: githubRepo.private,
                updatedAt: new Date(githubRepo.updated_at),
                pushedAt: new Date(githubRepo.pushed_at),
                // We map 'language' to primary language if needed, but schema uses relation usually
            };

            if (existing) {
                // Update basic info
                await prisma.repository.update({
                    where: { id: existing.id },
                    data: {
                        ...data,
                        description: existing.description || data.description // Preserve existing description if GitHub is empty
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
}

fetchAllRepos()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
