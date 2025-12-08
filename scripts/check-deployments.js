const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.deployment.count();
    console.log(`Total Deployments in DB: ${count}`);

    const deployments = await prisma.deployment.findMany({
        take: 5,
        include: { repository: true }
    });
    console.log('Sample Deployments:', JSON.stringify(deployments, null, 2));

    const repos = await prisma.repository.count();
    console.log(`Total Repositories: ${repos}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
