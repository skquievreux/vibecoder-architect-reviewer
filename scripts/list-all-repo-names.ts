
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const repos = await prisma.repository.findMany({
        select: {
            name: true,
            description: true,
            url: true
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
