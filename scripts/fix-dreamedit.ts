import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Adding missing deployment for DreamEdit...');
    
    const repo = await prisma.repository.findFirst({
        where: { name: 'DreamEdit' }
    });

    if (repo) {
        // Add a Vercel deployment
        const deployment = await prisma.deployment.create({
            data: {
                repositoryId: repo.id,
                provider: 'vercel',
                url: 'https://dreamedit.vercel.app',
                status: 'active'
            }
        });
        
        console.log('✅ Created deployment:', deployment.url);
        
        // Set custom URL to runitfast domain
        await prisma.repository.update({
            where: { id: repo.id },
            data: { customUrl: 'https://dreamedit.runitfast.xyz' }
        });
        
        console.log('✅ Updated customUrl to: https://dreamedit.runitfast.xyz');
        
    } else {
        console.log('❌ DreamEdit repository not found');
    }

    await prisma.$disconnect();
}

main().catch(console.error);