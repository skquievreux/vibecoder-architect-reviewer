
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const canvases = await prisma.businessCanvas.findMany();

        console.log("Searching for object-based Value Propositions...");
        canvases.forEach(c => {
            try {
                const parsed = JSON.parse(c.valueProposition || '[]');
                if (Array.isArray(parsed) && parsed.length > 0) {
                    if (typeof parsed[0] === 'object') {
                        console.log(`FOUND PROBLEM in ID: ${c.id}`);
                        console.log(`Content:`, JSON.stringify(parsed, null, 2));
                    }
                }
            } catch (e) {
                // ignore parse errors
            }
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
