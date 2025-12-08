import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const groups = await prisma.businessCanvas.groupBy({
        by: ['consolidationGroup'],
        _count: { repositoryId: true },
        where: { consolidationGroup: { not: null } }
    });

    console.log(`Found ${groups.length} consolidation groups.`);

    for (const group of groups) {
        if (!group.consolidationGroup) continue;

        console.log(`\nGroup ID: ${group.consolidationGroup} (Size: ${group._count.repositoryId})`);

        const members = await prisma.businessCanvas.findMany({
            where: { consolidationGroup: group.consolidationGroup },
            include: { repository: true }
        });

        members.forEach(m => console.log(` - ${m.repository.name}`));
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
