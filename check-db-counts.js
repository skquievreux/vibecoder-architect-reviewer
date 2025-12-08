
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const repoCount = await prisma.repository.count();
    const canvasCount = await prisma.businessCanvas.count();
    const technologyCount = await prisma.technology.count();
    const deploymentCount = await prisma.deployment.count();

    console.log(`Repositories: ${repoCount}`);
    console.log(`Business Canvases: ${canvasCount}`);
    console.log(`Technologies: ${technologyCount}`);
    console.log(`Deployments: ${deploymentCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
