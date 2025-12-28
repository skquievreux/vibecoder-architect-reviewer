
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const prisma = new PrismaClient();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Config that ALLOWS major updates (removes the ignore block)
// and specifically groups next/react for the major upgrade
const migrationConfig = `
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    groups:
      next-major-upgrade:
        patterns:
          - "next"
          - "react"
          - "react-dom"
          - "eslint-config-next"
    # Note: We intentionally REMOVED the "ignore major" block here 
    # to allow the Next.js 16 (major) update to come through.
`;

const DEPENDABOT_PATH = '.github/dependabot.yml';
const COMMIT_MSG = 'chore: allow major updates for Next.js migration';

async function main() {
    console.log("🚀 Enabling Next.js 16 Migration for v15 projects...");

    if (!GITHUB_TOKEN) process.exit(1);

    // Find Next.js 15 Repos
    const next15Repos = await prisma.technology.findMany({
        where: {
            name: { in: ['Next.js', 'next', 'NextJS'] },
            version: { startsWith: '15' } // loose matching
        },
        include: { repository: true }
    });

    console.log(`📋 Found ${next15Repos.length} repositories on Next.js 15.x`);

    for (const tech of next15Repos) {
        const repo = tech.repository;
        if (!repo.nameWithOwner) continue;

        console.log(`\n🔄 Updating ${repo.nameWithOwner} (Current: ${tech.version})...`);

        try {
            // Update Dependabot Config
            const url = `https://api.github.com/repos/${repo.nameWithOwner}/contents/${DEPENDABOT_PATH}`;

            // Get current SHA to update file
            const getRes = await fetch(url, { headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` } });

            if (getRes.ok) {
                const currentData = await getRes.json();
                const sha = currentData.sha;

                const contentEncoded = Buffer.from(migrationConfig).toString('base64');
                const updateRes = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: COMMIT_MSG,
                        content: contentEncoded,
                        sha: sha,
                        branch: repo.defaultBranch || 'main'
                    })
                });

                if (updateRes.ok) {
                    console.log(`   ✅ Config updated to allow Major Updates.`);
                } else {
                    console.error(`   ❌ Failed to update: ${updateRes.status}`);
                }
            } else {
                console.error(`   ⚠️  Dependabot config not found (run basic setup first?)`);
            }

        } catch (e: any) {
            console.error(`   ❌ Error: ${e.message}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
