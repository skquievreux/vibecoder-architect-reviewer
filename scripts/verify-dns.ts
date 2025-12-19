import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Aktuelle DNS-Zuordnungen:');
    
    const repos = await prisma.repository.findMany({
        where: { 
            deployments: { 
                some: { provider: 'vercel' } 
            } 
        },
        include: { 
            deployments: true 
        }
    });

    repos.forEach(repo => {
        const deployment = repo.deployments.find(d => d.url?.includes('vercel.app'));
        console.log(`\n📁 ${repo.name}`);
        console.log(`   Vercel URL: ${deployment?.url || 'none'}`);
        console.log(`   Custom URL: ${repo.customUrl || 'none'}`);
        if (repo.customUrl) {
            console.log(`   ✅ Status: Verknüpft`);
        } else {
            console.log(`   ❌ Status: Nicht verknüpft`);
        }
    });

    await prisma.$disconnect();
}

main().catch(console.error);