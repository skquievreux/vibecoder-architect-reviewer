const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('📝 Creating Standardization Tasks...');

    const repos = await prisma.repository.findMany();
    let createdCount = 0;

    for (const repo of repos) {
        // Skip if it's the reference or the pilot
        if (repo.name === 'youtube-landing-page' || repo.name === 'dashboard') continue;

        // Check if task already exists
        const existing = await prisma.repoTask.findFirst({
            where: {
                repositoryId: repo.id,
                title: 'Standardize API & Documentation'
            }
        });

        if (!existing) {
            await prisma.repoTask.create({
                data: {
                    repositoryId: repo.id,
                    title: 'Standardize API & Documentation',
                    description: 'Implement the "Golden Path" standard: 1. Generate `openapi.json` (OpenAPI 3.0). 2. Update `README.md` with standard structure. 3. Classify APIs as Public/Internal.',
                    priority: 'MEDIUM',
                    status: 'OPEN',
                    type: 'MAINTENANCE'
                }
            });
            createdCount++;
        }
    }

    console.log(`✅ Created ${createdCount} new tasks.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
