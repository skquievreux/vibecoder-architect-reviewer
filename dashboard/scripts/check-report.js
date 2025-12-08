const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const report = await prisma.aIReport.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (report) {
        console.log(`Latest Report ID: ${report.id}`);
        console.log(`Created At: ${report.createdAt}`);
        console.log(`Content Length: ${report.content.length}`);
    } else {
        console.log("No reports found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
