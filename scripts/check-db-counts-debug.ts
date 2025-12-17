
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const deploymentCount = await prisma.deployment.count();
    console.log(`Total Deployments: ${deploymentCount}`);

    const reposWithHomepage = await prisma.repository.count({
        where: { homepageUrl: { not: null } }
    });
    console.log(`Repos with homepageUrl: ${reposWithHomepage}`);

    const sampleDeployments = await prisma.deployment.findMany({ take: 5 });
    console.log('Sample Deployments:', sampleDeployments);

    const sampleRepos = await prisma.repository.findMany({
        where: { homepageUrl: { not: null } },
        take: 3,
        select: { name: true, homepageUrl: true, url: true }
    });
    console.log('Sample Repos with Homepage:', sampleRepos);
}

main().finally(() => prisma.$disconnect());
