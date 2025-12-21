import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentDeployments() {
    console.log('🔍 Aktuelle Deployments in der Datenbank:');
    
    const repos = await prisma.repository.findMany({
        where: { deployments: { some: {} } },
        include: { deployments: true }
    });
    
    console.log(`${repos.length} Repositories mit Deployments:`);
    
    repos.forEach(repo => {
        console.log(`\n📁 ${repo.name}`);
        console.log(`   ID: ${repo.id}`);
        console.log(`   Custom URL: ${repo.customUrl || 'none'}`);
        repo.deployments.forEach((dep, i) => {
            console.log(`   Deployment ${i+1}: ${dep.provider} -> ${dep.url} (${dep.status || 'no status'})`);
        });
    });
    
    await prisma.$disconnect();
}

checkCurrentDeployments().catch(console.error);