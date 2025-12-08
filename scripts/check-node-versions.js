const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Node.js versions...");

    const repos = await prisma.repository.findMany({
        include: { technologies: true }
    });

    let unknownCount = 0;
    let knownCount = 0;

    for (const repo of repos) {
        const nodeTech = repo.technologies.find(t => t.name === 'Node.js');
        if (nodeTech && nodeTech.version) {
            knownCount++;
        } else {
            // console.log(`[${repo.name}] Node.js: Unknown`);
            unknownCount++;
        }

        const tailwindTech = repo.technologies.find(t => t.name === 'Tailwind CSS');
        if (tailwindTech) {
            console.log(`[${repo.name}] Tailwind: ${tailwindTech.version}`);
        }
    }

    console.log(`\nSummary:`);
    console.log(`Known Versions: ${knownCount}`);
    console.log(`Unknown Versions: ${unknownCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
