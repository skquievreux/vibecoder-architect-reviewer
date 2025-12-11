
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const prisma = new PrismaClient();
require('dotenv').config();

const DELAY_MS = 1000; // 1 second delay between requests to avoid rate limits

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('Starting bulk description sync...');

    const repos = await prisma.repository.findMany({
        where: {
            description: {
                not: '' // Only sync if we have a description
            }
        }
    });

    console.log(`Found ${repos.length} repositories with descriptions.`);

    let successCount = 0;
    let failureCount = 0;

    for (const repo of repos) {
        if (!repo.description) continue;

        console.log(`Syncing ${repo.nameWithOwner}...`);

        try {
            const response = await fetch(`https://api.github.com/repos/${repo.nameWithOwner}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    description: repo.description
                })
            });

            if (response.ok) {
                console.log(`✅ Updated ${repo.name}`);
                successCount++;
            } else {
                console.error(`❌ Failed to update ${repo.name}: ${response.status} ${response.statusText}`);
                failureCount++;
            }
        } catch (error) {
            console.error(`❌ Error updating ${repo.name}:`, error.message);
            failureCount++;
        }

        await sleep(DELAY_MS);
    }

    console.log('------------------------------------------------');
    console.log(`Sync complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failureCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
