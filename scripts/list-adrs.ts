
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const adrs = await prisma.architectureDecision.findMany({
        orderBy: { title: 'asc' }
    });

    console.log("📋 Current ADRs:");
    adrs.forEach(a => console.log(` - [${a.status}] ${a.title}`));
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
