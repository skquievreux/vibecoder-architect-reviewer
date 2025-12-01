
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const canvases = await prisma.businessCanvas.findMany();
        let errors = 0;
        canvases.forEach(c => {
            try {
                if (c.valueProposition) JSON.parse(c.valueProposition);
                if (c.customerSegments) JSON.parse(c.customerSegments);
                if (c.revenueStreams) JSON.parse(c.revenueStreams);
                if (c.costStructure) JSON.parse(c.costStructure);
            } catch (e) {
                console.error(`Invalid JSON in canvas ${c.id}:`, e.message);
                errors++;
            }
        });
        console.log(`Checked ${canvases.length} canvases. Found ${errors} errors.`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
