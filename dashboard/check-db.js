
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const repoCount = await prisma.repository.count();
        const capCount = await prisma.capability.count();
        console.log(`Repositories: ${repoCount}`);
        console.log(`Capabilities: ${capCount}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
