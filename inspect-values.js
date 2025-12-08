
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const canvases = await prisma.businessCanvas.findMany({
            take: 5
        });

        console.log("Checking Value Propositions:");
        canvases.forEach(c => {
            console.log(`ID: ${c.id}`);
            console.log(`Value Prop Raw: ${c.valueProposition}`);
            try {
                const parsed = JSON.parse(c.valueProposition);
                console.log(`Parsed Type: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    console.log(`First Element Type: ${typeof parsed[0]}`);
                    console.log(`First Element:`, parsed[0]);
                }
            } catch (e) {
                console.log(`Parse Error: ${e.message}`);
            }
            console.log('---');
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
