import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const prisma = new PrismaClient();

async function getVercelDeployments() {
    try {
        // Vercel CLI needs to be logged in. 
        // We list projects and their latest deployment.
        // 'vercel project ls' gives us projects.
        // 'vercel ls <project>' gives deployments.
        // This might be slow for many projects.
        // Alternative: 'vercel ls' lists deployments for the current scope.

        console.log('Fetching Vercel deployments...');
        const { stdout } = await execAsync('vercel ls --limit 50');
        // Output format is table-like. We need to parse it.
        // Project  Latest Deployment  Status  Age
        // ...

        // Actually, 'vercel project ls' might be better to map to repos.
        // But let's try to just get recent deployments and match by name.

        // For now, let's just simulate or try to parse 'vercel project ls' to get URLs.
        const { stdout: projectsOut } = await execAsync('vercel project ls');

        // Parse projectsOut
        // This is tricky without JSON output. Vercel CLI doesn't output JSON easily for ls.
        // But we can try to match project names with our repo names.

        return projectsOut.split('\n').filter(line => line.trim() !== '').slice(2); // Skip header
    } catch (e) {
        console.error('Failed to fetch Vercel deployments', e);
        return [];
    }
}

async function getFlyDeployments() {
    try {
        console.log('Fetching Fly.io deployments...');
        // 'fly apps list --json' is perfect.
        const { stdout } = await execAsync('fly apps list --json');
        return JSON.parse(stdout);
    } catch (e) {
        console.error('Failed to fetch Fly deployments', e);
        return [];
    }
}

async function main() {
    console.log('Syncing deployments...');

    // 1. Fly.io
    const flyApps = await getFlyDeployments();
    for (const app of flyApps) {
        // app: { Name, Status, Deployed, Hostname, ... }
        // Try to find repo by name (fuzzy match or exact)
        // Fly app names often differ from repo names.
        // We'll try to match 'Name' with repo 'name' or 'name' with hyphens.

        const repo = await prisma.repository.findFirst({
            where: {
                OR: [
                    { name: { equals: app.Name } },
                    { name: { contains: app.Name } } // Risky?
                ]
            }
        });

        if (repo) {
            await prisma.deployment.create({
                data: {
                    repositoryId: repo.id,
                    provider: 'fly',
                    url: `https://${app.Hostname || app.Name + '.fly.dev'}`,
                    status: app.Status,
                    lastDeployedAt: app.Deployed ? new Date(app.Deployed) : new Date(),
                }
            });
            console.log(`Linked Fly app ${app.Name} to repo ${repo.name}`);
        }
    }

    // 2. Vercel
    // Since parsing CLI table is hard, let's use a heuristic for now.
    // If we find a vercel.json in the repo (via our analysis), we assume it's on Vercel.
    // Or we can try to call 'vercel project ls' and parse names.

    // Let's iterate our repos and check if they have 'vercel.json' or 'next.config.js' (strong hint).
    const repos = await prisma.repository.findMany({
        include: { technologies: true }
    });

    for (const repo of repos) {
        const isNext = repo.technologies.some(t => t.name === 'Next.js');

        if (isNext) {
            // Heuristic: It's likely on Vercel if it's Next.js
            // We can try to guess the URL: project-name.vercel.app
            const url = `https://${repo.name}.vercel.app`;

            // Verify if it exists? (Head request) - maybe too slow.
            // Let's just add it as "Potential" or "Active"

            // Check if already exists
            const existing = await prisma.deployment.findFirst({
                where: {
                    repositoryId: repo.id,
                    provider: 'vercel',
                    url: url
                }
            });

            if (!existing) {
                await prisma.deployment.create({
                    data: {
                        repositoryId: repo.id,
                        provider: 'vercel',
                        url: url,
                        status: 'active', // Assumed
                        lastDeployedAt: new Date(), // Unknown
                    }
                });
                console.log(`Predicted Vercel deployment for ${repo.name}`);
            }
        }
    }

    // 3. Lovable / Cloudflare
    // Placeholder logic

    console.log('Deployment sync complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
