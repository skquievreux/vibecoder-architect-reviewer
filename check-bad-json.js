
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const canvases = await prisma.businessCanvas.findMany();
    let badCount = 0;

    for (const c of canvases) {
        try {
            JSON.parse(c.valueProposition || '[]');
        } catch (e) {
            console.log(`Bad VP in ${c.id}: ${c.valueProposition}`);
            badCount++;
        }
        try {
            JSON.parse(c.customerSegments || '[]');
        } catch (e) {
            console.log(`Bad CS in ${c.id}: ${c.customerSegments}`);
            badCount++;
        }
        // ... check others if needed
    }

    console.log(`Found ${badCount} bad records.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
