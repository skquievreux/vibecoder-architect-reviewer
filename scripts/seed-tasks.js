
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding default tasks...');

    const repos = await prisma.repository.findMany();
    console.log(`Found ${repos.length} repositories.`);

    let taskCount = 0;

    for (const repo of repos) {
        // Create a maintenance task
        await prisma.repoTask.create({
            data: {
                repositoryId: repo.id,
                title: 'Update Dependencies',
                status: 'OPEN',
                priority: 'MEDIUM',
                type: 'MAINTENANCE'
            }
        });
        taskCount++;

        // Create a security task for some repos
        if (Math.random() > 0.7) {
            await prisma.repoTask.create({
                data: {
                    repositoryId: repo.id,
                    title: 'Security Audit',
                    status: 'OPEN',
                    priority: 'HIGH',
                    type: 'SECURITY'
                }
            });
            taskCount++;
        }
    }

    console.log(`Successfully created ${taskCount} tasks.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
