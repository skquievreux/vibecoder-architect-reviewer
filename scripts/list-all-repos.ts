import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📋 Alle Repositories:');
    
    const repos = await prisma.repository.findMany({
        include: { deployments: true },
        orderBy: { name: 'asc' }
    });

    repos.forEach((repo, index) => {
        const deployment = repo.deployments.find(d => d.url?.includes('vercel.app'));
        console.log(`\n${index + 1}. 📁 ${repo.name}`);
        console.log(`   Vercel URL: ${deployment?.url || 'none'}`);
        console.log(`   Custom URL: ${repo.customUrl || 'none'}`);
    });

    await prisma.$disconnect();
}

main().catch(console.error);