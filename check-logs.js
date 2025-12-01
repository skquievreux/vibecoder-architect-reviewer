
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // @ts-ignore
        const logs = await prisma.syncLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        console.log(JSON.stringify(logs, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
