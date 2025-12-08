import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const canvases = await prisma.businessCanvas.findMany({
        take: 5,
        include: {
            repository: {
                include: { capabilities: true }
            }
        }
    });

    console.log(`Found ${await prisma.businessCanvas.count()} Business Canvas records.`);

    for (const canvas of canvases) {
        console.log('---');
        console.log(`Repo: ${canvas.repository.name}`);
        console.log(`Capabilities: ${canvas.repository.capabilities.map(c => c.name).join(', ')}`);
        console.log(`Value Prop: ${canvas.valueProposition}`);
        console.log(`Customer Segments: ${canvas.customerSegments}`);
        console.log(`Revenue Stream: ${canvas.revenueStreams}`);
        console.log(`Est. ARR: ${canvas.estimatedARR}`);
        console.log(`Potential: ${canvas.monetizationPotential}`);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
