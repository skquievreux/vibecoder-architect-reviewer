const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Vercel Domain Sync...\n");

    // 1. Get API Token from environment
    const apiToken = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;

    if (!apiToken) {
        console.error("ERRORS:");
        console.error("❌ VERCEL_API_TOKEN not found.");
        console.error("\nPlease set VERCEL_API_TOKEN in .env.local:");
        console.error("VERCEL_API_TOKEN=\"your_vercel_token_here\"\n");
        console.error("Get your token from: https://vercel.com/account/tokens");
        return;
    }

    console.log("✅ Vercel API token found\n");

    const HEADERS = {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
    };

    try {
        // 2. Fetch Projects
        console.log("Fetching Vercel projects...");
        const projectsRes = await fetch('https://api.vercel.com/v9/projects?limit=100', { headers: HEADERS });

        if (!projectsRes.ok) {
            console.error(`❌ Failed to fetch projects: ${projectsRes.status} ${projectsRes.statusText}`);
            const err = await projectsRes.text();
            console.error(err);
            return;
        }

        const projectsData = await projectsRes.json();
        const projects = projectsData.projects;
        console.log(`Found ${projects.length} projects on Vercel.`);

        // 3. Process each project
        for (const project of projects) {
            // Find matching repo in DB
            // Vercel project name usually matches repo name, but not always.
            // We check for exact match first.
            let repo = await prisma.repository.findFirst({
                where: { name: project.name }
            });

            // If not found, try to find by link (if Vercel provides repo link info, usually in 'link' field)
            if (!repo && project.link && project.link.type === 'github') {
                const repoName = project.link.repo; // e.g. "user/repo"
                const nameOnly = repoName.split('/')[1];
                repo = await prisma.repository.findFirst({
                    where: { name: nameOnly }
                });
            }

            if (!repo) {
                // console.log(`  - Skipped: No matching DB repo for Vercel project '${project.name}'`);
                continue;
            }

            // Fetch Domains for this project
            const domainsRes = await fetch(`https://api.vercel.com/v9/projects/${project.id}/domains`, { headers: HEADERS });
            const domainsData = await domainsRes.json();

            if (domainsData.domains && domainsData.domains.length > 0) {
                // Filter for custom domains (not .vercel.app)
                const customDomains = domainsData.domains.filter(d => !d.name.endsWith('.vercel.app'));

                if (customDomains.length > 0) {
                    const primaryDomain = customDomains[0].name;
                    const fullUrl = `https://${primaryDomain}`;

                    console.log(`  🔗 Linking ${repo.name} -> ${fullUrl}`);

                    await prisma.repository.update({
                        where: { id: repo.id },
                        data: { customUrl: fullUrl }
                    });
                }
            }
        }

        console.log("✅ Sync Complete.");

    } catch (e) {
        console.error("Sync Error:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
