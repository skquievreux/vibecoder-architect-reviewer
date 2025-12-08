const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Vercel Domain Sync...");

    // 1. Get API Token
    const envPath = path.join(process.cwd(), '.env');
    let apiToken = null;

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/VERCEL_API_TOKEN=(.*)/) || envContent.match(/VERCEL_TOKEN=(.*)/);
        if (match && match[1]) {
            apiToken = match[1].trim().replace(/["']/g, '');
        }
    }

    if (!apiToken) {
        console.error("❌ VERCEL_API_TOKEN not found.");
        return;
    }

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
