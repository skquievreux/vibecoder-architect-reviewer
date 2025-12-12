const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const repos = await prisma.repository.count();
        const canvases = await prisma.businessCanvas.count();
        const techs = await prisma.technology.count();
        const deployments = await prisma.deployment.count();
        const adrs = await prisma.architectureDecision.count();
        const reports = await prisma.aIReport.count();
        const providers = await prisma.provider.count();
        const connections = await prisma.repoConnection.count();
        const interfaces = await prisma.interface.count();

        console.log(`Repositories: ${repos}`);
        console.log(`Business Canvases: ${canvases}`);
        console.log(`Technologies: ${techs}`);
        console.log(`Deployments: ${deployments}`);
        console.log(`ADRs: ${adrs}`);
        console.log(`AI Reports: ${reports}`);
        console.log(`Providers: ${providers}`);
        console.log(`Connections: ${connections}`);
        console.log(`Interfaces: ${interfaces}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
