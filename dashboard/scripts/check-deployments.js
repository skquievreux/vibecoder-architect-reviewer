
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking failed deployments...");
    // Find all deployments with typical failure statuses
    const failures = await prisma.deployment.findMany({
        where: {
            status: { in: ['ERROR', 'FAILURE', 'FAILED', 'FAIL'] }
        },
        include: { repository: true }
    });

    if (failures.length === 0) {
        console.log("No failed deployments found in DB.");
    } else {
        failures.forEach(f => {
            console.log(`❌ ${f.repository.name}: ${f.status} (${f.url || 'No URL'})`);
        });
    }

    // Also check for Repos with "NO_PKG" or missing expected standard versions
    // This is "migration work"
    console.log("\nChecking Validation Gaps (Migration Work)...");
    const repos = await prisma.repository.findMany({
        include: { technologies: true }
    });

    repos.forEach(repo => {
        const node = repo.technologies.find(t => t.name === 'Node.js');
        const ts = repo.technologies.find(t => t.name === 'TypeScript');

        let issues = [];
        if (!node || (node.version && !node.version.includes('20'))) issues.push('Node != 20');
        if (!ts) issues.push('TS Missing');

        if (issues.length > 0) {
            console.log(`⚠️  ${repo.name}: ${issues.join(', ')}`);
        }
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
