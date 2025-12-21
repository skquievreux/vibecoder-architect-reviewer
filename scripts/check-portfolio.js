const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPortfolio() {
    const canvasCount = await prisma.businessCanvas.count();
    const reposWithCanvas = await prisma.repository.count({
        where: {
            businessCanvas: {
                isNot: null
            }
        }
    });

    console.log(`\n📊 Portfolio Intelligence Status:\n`);
    console.log(`Total Business Canvases: ${canvasCount}`);
    console.log(`Repositories with Canvas: ${reposWithCanvas}`);

    if (canvasCount > 0) {
        const sample = await prisma.businessCanvas.findMany({
            take: 5,
            include: {
                repository: {
                    select: {
                        name: true
                    }
                }
            }
        });

        console.log(`\n✅ Sample Business Canvases:\n`);
        sample.forEach(canvas => {
            console.log(`- ${canvas.repository.name}`);
            console.log(`  Value Prop: ${canvas.valueProposition?.substring(0, 80)}...`);
        });
    } else {
        console.log(`\n⚠️  No Business Canvases found. Run: npm run portfolio:refresh`);
    }

    await prisma.$disconnect();
}

checkPortfolio().catch(console.error);
