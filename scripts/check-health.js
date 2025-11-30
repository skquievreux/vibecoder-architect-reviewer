
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const repoCount = await prisma.repository.count();
    const taskCount = await prisma.repoTask.count();
    const descCount = await prisma.repository.count({
        where: {
            description: { not: '' }
        }
    });

    console.log(`System Status:`);
    console.log(`- Repositories: ${repoCount}`);
    console.log(`- Tasks: ${taskCount}`);
    console.log(`- Repos with Descriptions: ${descCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
