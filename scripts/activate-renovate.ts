
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

// Renovate Configuration
// Optimized for security updates and grouping React ecosystem
const renovateConfig = {
    "$schema": "https://docs.renovatebot.com/renovate-schema.json",
    "extends": [
        "config:best-practices",
        ":dependencyDashboard",
        ":semanticCommits",
        ":prHourlyLimitNone"
    ],
    "labels": ["dependencies", "renovate"],
    "packageRules": [
        {
            "matchPackageNames": ["react", "react-dom", "next"],
            "groupName": "React Ecosystem",
            "labels": ["security", "react-upgrade"],
            "enabled": true
        },
        {
            "matchUpdateTypes": ["minor", "patch", "pin", "digest"],
            "automerge": true,
            "automergeType": "pr"
        }
    ],
    "vulnerabilityAlerts": {
        "enabled": true,
        "labels": ["security"]
    },
    "osvVulnerabilityAlerts": true,
    "rangeStrategy": "bump"
};

const CONFIG_FILENAME = 'renovate.json';
const COMMIT_MESSAGE = 'chore: configure renovate bot for security updates';

async function main() {
    console.log("🤖 Starting Renovate Bot Activation (Config Deployment)...");

    if (!GITHUB_TOKEN) {
        console.error("❌ GITHUB_TOKEN is missing in .env");
        process.exit(1);
    }

    // 1. Get all repositories from DB
    const repos = await prisma.repository.findMany({
        where: {
            NOT: {
                url: { startsWith: 'local://' } // Should be clean now, but just in case
            }
        }
    });

    console.log(`📋 Found ${repos.length} repositories to check.`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const repo of repos) {
        // repo.nameWithOwner is like "owner/repo"
        if (!repo.nameWithOwner) {
            console.warn(`⚠️  Skipping ${repo.name} - no nameWithOwner`);
            continue;
        }

        console.log(`\n🔍 Checking ${repo.nameWithOwner}...`);

        try {
            // Check if file exists
            const fileUrl = `https://api.github.com/repos/${repo.nameWithOwner}/contents/${CONFIG_FILENAME}`;

            const checkRes = await fetch(fileUrl, {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (checkRes.ok) {
                console.log(`   ✅ ${CONFIG_FILENAME} already exists.`);
                skipCount++;
                continue;
            }

            if (checkRes.status === 404) {
                console.log(`   📝 Creating ${CONFIG_FILENAME}...`);

                // Create file
                const contentEncoded = Buffer.from(JSON.stringify(renovateConfig, null, 2)).toString('base64');
                const createRes = await fetch(fileUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: COMMIT_MESSAGE,
                        content: contentEncoded,
                        branch: repo.defaultBranch || 'main' // Try to use default branch if known, else main
                    })
                });

                if (createRes.ok) {
                    console.log(`   ✨ Successfully activated Renovate on ${repo.nameWithOwner}`);
                    successCount++;
                } else {
                    const err = await createRes.json();
                    console.error(`   ❌ Failed to create file: ${createRes.status}`, err.message);
                    errorCount++;
                }
            } else {
                console.error(`   ❌ Error checking file: ${checkRes.status}`);
                errorCount++;
            }

        } catch (e: any) {
            console.error(`   ❌ Exception: ${e.message}`);
            errorCount++;
        }
    }

    console.log(`\n📊 Activation Summary:`);
    console.log(`   Activated (Config Created): ${successCount}`);
    console.log(`   Skipped (Already Active):   ${skipCount}`);
    console.log(`   Errors:                     ${errorCount}`);
    console.log(`\n👉 IMPORTANT: Ensure the "Renovate" GitHub App is installed on your account/organization for these configs to take effect!`);
    console.log(`   Install Link: https://github.com/apps/renovate`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
