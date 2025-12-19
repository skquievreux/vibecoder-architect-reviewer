import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking DreamEdit repository data...');
    
    const repo = await prisma.repository.findFirst({
        where: { name: 'DreamEdit' },
        include: { 
            deployments: true,
            technologies: true,
            businessCanvas: true
        }
    });

    if (repo) {
        console.log('Repository gefunden:');
        console.log('  Name:', repo.name);
        console.log('  ID:', repo.id);
        console.log('  Custom URL:', repo.customUrl);
        console.log('  URL:', repo.url);
        console.log('  Deployments:', repo.deployments?.length || 0);
        console.log('  Technologies:', repo.technologies?.length || 0);
        console.log('  Business Canvas:', repo.businessCanvas ? 'Yes' : 'No');
        
        if (repo.deployments) {
            repo.deployments.forEach((dep, i) => {
                console.log(`  Deployment ${i + 1}: ${dep.provider} -> ${dep.url} (${dep.status})`);
            });
        }
    } else {
        console.log('❌ Repository nicht gefunden');
    }

    await prisma.$disconnect();
}

main().catch(console.error);