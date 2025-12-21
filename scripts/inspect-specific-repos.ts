
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetRepos = ['Karbendrop', 'vibecoder-architect-reviewer', 'ACID-MONK-GENERATOR'];

    console.log("Inspecting specific repositories...");

    const repos = await prisma.repository.findMany({
        where: {
            name: {
                in: targetRepos,
                mode: 'insensitive' // Allow case differences e.g. Karbendrop vs karbendrop
            }
        },
        include: {
            businessCanvas: true,
            technologies: true,
            capabilities: true,
            tasks: true
        }
    });

    console.log(JSON.stringify(repos, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
