
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting smart task seeding...');

    // 1. Load Analysis Results
    const jsonPath = path.join(process.cwd(), '..', 'analysis_results.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('Analysis results not found at', jsonPath);
        return;
    }
    const analysisData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`Loaded analysis for ${analysisData.length} repositories.`);

    // 2. Get latest AI Report for linking
    const latestReport = await prisma.aIReport.findFirst({
        orderBy: { createdAt: 'desc' }
    });
    const reportLink = latestReport ? `/report` : null;

    let taskCount = 0;

    for (const item of analysisData) {
        const repoData = item.repo;

        // Find the repo in DB
        const repo = await prisma.repository.findUnique({
            where: { githubId: String(repoData.id) }
        });

        if (!repo) {
            console.log(`Repo ${repoData.name} not found in DB, skipping.`);
            continue;
        }

        // --- Logic 1: React Upgrade ---
        const reactTech = item.technologies.find(t => t.name === 'React');
        if (reactTech && reactTech.version && !reactTech.version.includes('19')) {
            await prisma.repoTask.create({
                data: {
                    repositoryId: repo.id,
                    title: 'Upgrade to React 19',
                    description: `Current version is ${reactTech.version}. Upgrade to React 19 for better performance and server actions support.`,
                    reference: reportLink,
                    status: 'OPEN',
                    priority: 'HIGH',
                    type: 'MAINTENANCE'
                }
            });
            taskCount++;
        }

        // --- Logic 2: Sensitive Env Vars ---
        const sensitiveVars = ['API_KEY', 'SECRET', 'TOKEN', 'PASSWORD'];
        const foundSensitive = item.env_vars?.filter(v => sensitiveVars.some(s => v.includes(s)));

        if (foundSensitive && foundSensitive.length > 0) {
            await prisma.repoTask.create({
                data: {
                    repositoryId: repo.id,
                    title: 'Review Environment Variables',
                    description: `Potential sensitive variables detected: ${foundSensitive.slice(0, 3).join(', ')}... Ensure these are not committed.`,
                    reference: 'https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions',
                    status: 'OPEN',
                    priority: 'HIGH',
                    type: 'SECURITY'
                }
            });
            taskCount++;
        }

        // --- Logic 3: General Maintenance (if no other tasks) ---
        // We can add a generic one if needed, but let's keep it clean for now.
        // If the repo is very old (updated > 6 months ago), add a check task.
        const lastUpdate = new Date(repoData.updatedAt);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        if (lastUpdate < sixMonthsAgo) {
            await prisma.repoTask.create({
                data: {
                    repositoryId: repo.id,
                    title: 'Archive or Refresh',
                    description: `Repository hasn't been updated since ${lastUpdate.toLocaleDateString()}. Consider archiving if obsolete.`,
                    reference: reportLink,
                    status: 'OPEN',
                    priority: 'LOW',
                    type: 'MAINTENANCE'
                }
            });
            taskCount++;
        }
    }

    console.log(`✅ Smart seeding complete. Created ${taskCount} tasks.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
