
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCanvas() {
    try {
        const count = await prisma.businessCanvas.count();
        console.log(`Total BusinessCanvas records: ${count}`);

        const reposWithCanvas = await prisma.repository.findMany({
            include: {
                businessCanvas: true
            },
            take: 5
        });

        console.log("Sample Repositories with Canvas:");
        reposWithCanvas.forEach(r => {
            console.log(`Repo: ${r.name} (ID: ${r.id})`);
            console.log(`Canvas: ${r.businessCanvas ? 'Present' : 'MISSING'}`);
            if (r.businessCanvas) {
                console.log(`  - Value Prop: ${r.businessCanvas.valueProposition ? 'Has Data' : 'Empty'}`);
            }
        });

    } catch (e) {
        console.error("Error checking canvas:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkCanvas();
