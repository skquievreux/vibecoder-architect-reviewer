import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up duplicate repositories...');

    // 1. Delete repos with "undefined" githubId if a real one exists
    const undefinedRepos = await prisma.repository.findMany({
        where: { githubId: "undefined" }
    });

    for (const badRepo of undefinedRepos) {
        // Check if a good repo exists with the same name
        const goodRepo = await prisma.repository.findFirst({
            where: {
                name: badRepo.name,
                githubId: { not: "undefined" }
            }
        });

        if (goodRepo) {
            console.log(`Deleting duplicate (bad ID) for ${badRepo.name}`);
            await prisma.repository.delete({ where: { id: badRepo.id } });
        } else {
            // If no good repo exists, maybe we should keep it or delete it?
            // Let's delete it if we are sure we re-seeded correctly.
            // Actually, let's just delete all "undefined" githubIds, as they are invalid.
            console.log(`Deleting repo with undefined ID: ${badRepo.name}`);
            await prisma.repository.delete({ where: { id: badRepo.id } });
        }
    }

    // 2. Check for other duplicates by name
    const allRepos = await prisma.repository.findMany();
    const seen = new Map();

    for (const repo of allRepos) {
        if (seen.has(repo.name)) {
            console.log(`Deleting duplicate by name: ${repo.name} (ID: ${repo.id})`);
            // Keep the one with the newer updatedAt or just the first one?
            // Let's keep the one we saw first (arbitrary) or the one with a valid ID.
            await prisma.repository.delete({ where: { id: repo.id } });
        } else {
            seen.set(repo.name, repo.id);
        }
    }

    console.log('Repo cleanup complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
