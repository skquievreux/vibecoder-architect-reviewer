
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const repos = await prisma.repository.findMany({
        where: { customUrl: { not: null } },
        select: { name: true, customUrl: true, deployments: { select: { url: true } } }
    });
    console.log('Linked Repositories:', repos);
}

main().finally(() => prisma.$disconnect());
