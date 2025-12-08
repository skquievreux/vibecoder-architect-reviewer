import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { analyzeChangelog } from '../lib/changelog-analyzer';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

// Helper to get API Key safely
function getApiKey() {
    const envPath = path.join(__dirname, '../.env');
    let fileKey = null;

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/PERPLEXITY_API_KEY=(.*)/) || envContent.match(/PERPLEXITY_API_TOKEN=(.*)/) || envContent.match(/OPENAI_API_KEY=(.*)/);
        if (match && match[1]) {
            fileKey = match[1].trim().replace(/["']/g, '');
        }
    }

    return fileKey || process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY;
}

async function main() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("Missing API Key (PERPLEXITY_API_KEY or OPENAI_API_KEY)");
        process.exit(1);
    }

    const GIT_ROOT = '/home/ladmin/Desktop/GIT';
    console.log(`Scanning repositories in ${GIT_ROOT}...`);

    // Get all directories in GIT_ROOT
    const entries = fs.readdirSync(GIT_ROOT, { withFileTypes: true });
    const repoDirs = entries
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

    console.log(`Found ${repoDirs.length} directories.`);

    for (const repoName of repoDirs) {
        const repoPath = path.join(GIT_ROOT, repoName);
        const changelogPath = path.join(repoPath, 'CHANGELOG.md');

        if (fs.existsSync(changelogPath)) {
            console.log(`\nAnalyzing CHANGELOG for ${repoName}...`);
            const content = fs.readFileSync(changelogPath, 'utf-8');
            // Take last 200 lines to avoid token limits
            const snippet = content.split('\n').slice(0, 200).join('\n');

            const analysis = await analyzeChangelog(snippet, apiKey);

            if (analysis) {
                console.log(`--- Analysis for ${repoName} ---`);
                console.log(JSON.stringify(analysis, null, 2));

                // Here we would implement the logic to save to DB
                // For now, just logging suggestions
                if (analysis.providers?.length > 0) {
                    console.log("Suggested Providers:", analysis.providers.map((p: any) => p.name).join(", "));
                }
            }
        } else {
            // console.log(`No CHANGELOG.md found for ${repoName}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
