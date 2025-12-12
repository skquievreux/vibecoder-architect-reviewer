const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const repos = await prisma.repository.findMany({
        include: {
            capabilities: true,
            technologies: true
        }
    });

    const withoutCapabilities = repos.filter(r => r.capabilities.length === 0);

    console.log(`Repositories without capabilities: ${withoutCapabilities.length}/${repos.length}\n`);

    withoutCapabilities.forEach(repo => {
        const techs = repo.technologies.map(t => t.name).join(', ');
        console.log(`${repo.name}`);
        console.log(`  Technologies: ${techs || 'None'}`);
        console.log('');
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
