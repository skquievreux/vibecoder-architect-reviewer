import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Resetting incorrect DNS assignments...');

    // Get repositories with deployments
    const repos = await prisma.repository.findMany({
        where: {
            deployments: {
                some: {
                    provider: 'vercel'
                }
            }
        },
        include: {
            deployments: true
        }
    });

    console.log(`Found ${repos.length} repositories with deployments.`);

    for (const repo of repos) {
        const deployment = repo.deployments.find(d => d.url && d.url.includes('vercel.app'));
        
        if (!deployment || !deployment.url) {
            continue;
        }

        console.log(`\n📁 ${repo.name}`);
        console.log(`   Vercel URL: ${deployment.url}`);
        console.log(`   Current Custom URL: ${repo.customUrl || 'none'}`);

        // Extract the specific Vercel subdomain
        const vercelSubdomain = deployment.url.replace(/^https?:\/\//, '').replace(/\.vercel\.app.*$/, '');
        
        // Clear incorrect assignments first
        if (repo.customUrl) {
            console.log(`   🧹 Clearing incorrect customUrl: ${repo.customUrl}`);
            await prisma.repository.update({
                where: { id: repo.id },
                data: { customUrl: null }
            });
        }
    }

    console.log('\n✅ Cleared all incorrect DNS assignments.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });