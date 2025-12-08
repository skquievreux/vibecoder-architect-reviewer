
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.repoTask.count();
    console.log(`Total tasks found: ${count}`);

    const tasks = await prisma.repoTask.findMany({
        take: 5,
        include: { repository: true }
    });
    console.log('Sample tasks:', JSON.stringify(tasks, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
