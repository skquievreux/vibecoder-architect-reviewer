const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const GIT_ROOT = '/home/ladmin/Desktop/GIT';

async function main() {
    console.log('🚀 Starting Deployment Scan...');

    const repos = await prisma.repository.findMany();
    console.log(`Found ${repos.length} repositories in DB.`);

    let totalDeployments = 0;

    for (const repo of repos) {
        // Try to find the repo locally
        // The repo name in DB might match the folder name
        const repoPath = path.join(GIT_ROOT, repo.name);

        if (!fs.existsSync(repoPath)) {
            // Try searching recursively if not in root
            // For now, skip if not found directly
            // console.warn(`⚠️  Repo folder not found: ${repoPath}`);
            continue;
        }

        const deployments = [];

        // Check Vercel
        if (fs.existsSync(path.join(repoPath, 'vercel.json')) || fs.existsSync(path.join(repoPath, '.vercel'))) {
            deployments.push({ provider: 'Vercel', url: `https://${repo.name}.vercel.app`, status: 'Active' });
        }

        // Check Fly.io
        if (fs.existsSync(path.join(repoPath, 'fly.toml'))) {
            deployments.push({ provider: 'Fly.io', url: `https://${repo.name}.fly.dev`, status: 'Active' });
        }

        // Check Docker
        if (fs.existsSync(path.join(repoPath, 'Dockerfile')) || fs.existsSync(path.join(repoPath, 'docker-compose.yml'))) {
            deployments.push({ provider: 'Docker', url: '', status: 'Active' });
        }

        // Check Netlify
        if (fs.existsSync(path.join(repoPath, 'netlify.toml'))) {
            deployments.push({ provider: 'Netlify', url: `https://${repo.name}.netlify.app`, status: 'Active' });
        }

        if (deployments.length > 0) {
            console.log(`✅ ${repo.name}: Detected ${deployments.map(d => d.provider).join(', ')}`);

            // Clear existing
            await prisma.deployment.deleteMany({ where: { repositoryId: repo.id } });

            // Create new
            for (const dep of deployments) {
                await prisma.deployment.create({
                    data: {
                        repositoryId: repo.id,
                        provider: dep.provider,
                        url: dep.url,
                        status: dep.status,
                        lastDeployedAt: new Date()
                    }
                });
            }
            totalDeployments += deployments.length;
        }
    }

    console.log(`\n🎉 Scan Complete. Total Deployments Detected: ${totalDeployments}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
