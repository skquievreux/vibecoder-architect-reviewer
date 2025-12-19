import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking for other repositories with missing deployments...');
    
    const reposWithoutDeployments = await prisma.repository.findMany({
        where: {
            AND: [
                { deployments: { none: {} } }, // No deployments
                { customUrl: { not: null } } // But has custom URL set
            ]
        }
    });

    console.log(`Found ${reposWithoutDeployments.length} repositories with customUrl but no deployments:`);
    
    for (const repo of reposWithoutDeployments) {
        console.log(`\n📁 ${repo.name}`);
        console.log(`   Custom URL: ${repo.customUrl}`);
        
        // Add a Vercel deployment based on the custom URL pattern
        const deploymentUrl = repo.customUrl?.replace('https://', 'https://') + '.vercel.app';
        
        if (deploymentUrl) {
            await prisma.deployment.create({
                data: {
                    repositoryId: repo.id,
                    provider: 'vercel',
                    url: deploymentUrl,
                    status: 'active'
                }
            });
            
            console.log(`   ✅ Added deployment: ${deploymentUrl}`);
        }
    }

    console.log('\n🎉 Deployment fix complete!');
    await prisma.$disconnect();
}

main().catch(console.error);