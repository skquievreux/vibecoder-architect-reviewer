const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma Connection...');
    try {
        // Check if aIReport exists on prisma instance
        if (!prisma.aIReport) {
            console.error('❌ prisma.aIReport is UNDEFINED. Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
            // Try other casing possibilities
            if (prisma.aiReport) console.log('Found prisma.aiReport instead');
            if (prisma.AIReport) console.log('Found prisma.AIReport instead');
            return;
        }

        const count = await prisma.aIReport.count();
        console.log(`✅ Connection successful. Found ${count} reports.`);

        const reports = await prisma.aIReport.findMany({ take: 1 });
        console.log('Sample report:', reports[0]);

    } catch (e) {
        console.error('❌ Database Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
