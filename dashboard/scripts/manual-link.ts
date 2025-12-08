import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const repo = await prisma.repository.findFirst({
        where: { name: { equals: 'ACID-MONK-GENERATOR' } } // Exact match based on previous check
    });
    const lemon = await prisma.provider.findUnique({ where: { slug: 'lemon-squeezy' } });

    if (repo && lemon) {
        await prisma.repository.update({
            where: { id: repo.id },
            data: {
                providers: {
                    connect: { id: lemon.id }
                }
            }
        });
        console.log(`Linked ${lemon.name} to ${repo.name}`);
    } else {
        console.log('Repo or Provider not found');
    }
}
main().finally(() => prisma.$disconnect());
