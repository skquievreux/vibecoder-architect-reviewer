
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const repo = await prisma.repository.findFirst({
        where: { name: 'inspect-whisper' }
    });

    if (repo) {
        console.log(`Found repo: ${repo.name}`);
        console.log(`Current Description in DB: "${repo.description}"`);
    } else {
        console.log('Repo not found in DB');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
