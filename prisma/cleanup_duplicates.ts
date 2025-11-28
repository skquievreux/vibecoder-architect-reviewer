import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up duplicate Vercel deployments...');

    const deployments = await prisma.deployment.findMany({
        where: { provider: 'vercel' }
    });

    const seen = new Set();
    for (const d of deployments) {
        const key = `${d.repositoryId}-${d.url}`;
        if (seen.has(key)) {
            console.log(`Deleting duplicate: ${d.url}`);
            await prisma.deployment.delete({ where: { id: d.id } });
        } else {
            seen.add(key);
        }
    }

    console.log('Cleanup complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
