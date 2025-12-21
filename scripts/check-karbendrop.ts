
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const repo = await prisma.repository.findFirst({
        where: {
            OR: [
                { name: { contains: 'Karben', mode: 'insensitive' } },
                { name: { contains: 'Carbon', mode: 'insensitive' } }
            ]
        }
    });

    if (repo) {
        console.log(`Found Repo: ${repo.name} (${repo.id})`);
    } else {
        console.log("Karbendrop not found. Need to create or rename.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
