
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
} else if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const prisma = new PrismaClient();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Dependabot Configuration
// Optimized for React security updates
const dependabotConfig = `
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      react-dependencies:
        patterns:
          - "react"
          - "react-dom"
          - "next"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
`;

const RENOVATE_FILE = 'renovate.json';
const DEPENDABOT_PATH = '.github/dependabot.yml';
const COMMIT_MSG_REMOVE = 'chore: remove renovate config (switching to dependabot)';
const COMMIT_MSG_ADD = 'chore: enable dependabot for security updates';

async function main() {
    console.log("🛡️  Starting Switch to Dependabot...");

    if (!GITHUB_TOKEN) {
        console.error("❌ GITHUB_TOKEN is missing in .env");
        process.exit(1);
    }

    const repos = await prisma.repository.findMany({
        where: {
            NOT: {
                url: { startsWith: 'local://' }
            }
        }
    });

    console.log(`📋 Processing ${repos.length} repositories.`);

    let removedRenovate = 0;
    let addedDependabot = 0;
    let errors = 0;

    for (const repo of repos) {
        if (!repo.nameWithOwner) continue;
        console.log(`\n🔍 ${repo.nameWithOwner}...`);

        try {
            // 1. DELETE renovate.json if exists
            const renovateUrl = `https://api.github.com/repos/${repo.nameWithOwner}/contents/${RENOVATE_FILE}`;
            const renovateRes = await fetch(renovateUrl, {
                headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
            });

            if (renovateRes.ok) {
                const renovateData = await renovateRes.json();
                const sha = renovateData.sha;

                // Delete it
                const delRes = await fetch(renovateUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: COMMIT_MSG_REMOVE,
                        sha: sha,
                        branch: repo.defaultBranch || 'main'
                    })
                });

                if (delRes.ok) {
                    console.log(`   🗑️  Removed ${RENOVATE_FILE}`);
                    removedRenovate++;
                } else {
                    console.error(`   ❌ Failed to delete ${RENOVATE_FILE}: ${delRes.status}`);
                }
            } else {
                console.log(`   ℹ️  No ${RENOVATE_FILE} found.`);
            }

            // 2. CREATE .github/dependabot.yml
            const dependabotUrl = `https://api.github.com/repos/${repo.nameWithOwner}/contents/${DEPENDABOT_PATH}`;

            // Allow 404 (file doesn't exist yet)
            const depCheckRes = await fetch(dependabotUrl, {
                headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
            });

            if (depCheckRes.ok) {
                console.log(`   ✅ Dependabot config already exists.`);
            } else if (depCheckRes.status === 404) {
                const contentEncoded = Buffer.from(dependabotConfig).toString('base64');
                const createRes = await fetch(dependabotUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: COMMIT_MSG_ADD,
                        content: contentEncoded,
                        branch: repo.defaultBranch || 'main'
                    })
                });

                if (createRes.ok) {
                    console.log(`   ✨ Created .github/dependabot.yml`);
                    addedDependabot++;
                } else {
                    // Try creating .github folder implicitly? API handles it.
                    // But maybe branch issue?
                    console.error(`   ❌ Failed to create Dependabot config: ${createRes.status}`);
                    errors++;
                }
            }

        } catch (e: any) {
            console.error(`   ❌ Exception: ${e.message}`);
            errors++;
        }
    }

    console.log(`\n📊 Switch Summary:`);
    console.log(`   Renovate Configs Removed: ${removedRenovate}`);
    console.log(`   Dependabot Configs Added: ${addedDependabot}`);
    console.log(`   Errors:                   ${errors}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
