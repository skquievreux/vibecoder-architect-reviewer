
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.repository.count();
    const withCanvas = await prisma.businessCanvas.count();

    console.log(`Total Repositories in Database: ${count}`);
    console.log(`Repositories with Business Canvas (Enhanced Data): ${withCanvas}`);

    // List a few that definitely don't have enhanced data yet to prove the point
    const unenhanced = await prisma.repository.findMany({
        where: {
            businessCanvas: {
                is: null
            }
        },
        take: 5,
        select: { name: true }
    });

    if (unenhanced.length > 0) {
        console.log("Examples of unenhanced repos:", unenhanced.map(r => r.name).join(", "));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
