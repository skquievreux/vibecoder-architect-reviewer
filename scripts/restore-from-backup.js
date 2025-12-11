const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Connect to backup database
const backupDb = new PrismaClient({
    datasources: {
        db: {
            url: 'file:../dev-backup.db'
        }
    }
});

// Connect to current database
const currentDb = new PrismaClient();

async function restoreData() {
    console.log('🔄 Starting data restoration from backup...\n');

    try {
        // 1. Restore ADRs (Architecture Decision Records)
        console.log('📋 Restoring ADRs...');
        const adrs = await backupDb.architectureDecision.findMany();
        console.log(`Found ${adrs.length} ADRs in backup`);

        for (const adr of adrs) {
            await currentDb.architectureDecision.upsert({
                where: { title: adr.title },
                update: {
                    status: adr.status,
                    context: adr.context,
                    decision: adr.decision,
                    consequences: adr.consequences,
                    tags: adr.tags,
                    updatedAt: adr.updatedAt
                },
                create: {
                    title: adr.title,
                    status: adr.status,
                    context: adr.context,
                    decision: adr.decision,
                    consequences: adr.consequences,
                    tags: adr.tags,
                    createdAt: adr.createdAt,
                    updatedAt: adr.updatedAt
                }
            });
        }
        console.log(`✅ Restored ${adrs.length} ADRs\n`);

        // 2. Restore AI Reports
        console.log('📊 Restoring AI Reports...');
        const reports = await backupDb.aIReport.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log(`Found ${reports.length} AI Reports in backup`);

        for (const report of reports) {
            await currentDb.aIReport.create({
                data: {
                    content: report.content,
                    createdAt: report.createdAt
                }
            });
        }
        console.log(`✅ Restored ${reports.length} AI Reports\n`);

        // 3. Restore Portfolio data (from portfolio.json if it exists in backup)
        console.log('💼 Checking for Portfolio data...');
        // Portfolio data is typically in portfolio.json, we'll handle that separately

        // 4. Restore Providers
        console.log('🔌 Restoring Providers...');
        const providers = await backupDb.provider.findMany();
        console.log(`Found ${providers.length} Providers in backup`);

        for (const provider of providers) {
            await currentDb.provider.upsert({
                where: { slug: provider.slug },
                update: {
                    name: provider.name,
                    description: provider.description,
                    website: provider.website,
                    category: provider.category,
                    tags: provider.tags,
                    capabilities: provider.capabilities,
                    isApproved: provider.isApproved,
                    pricingModel: provider.pricingModel,
                    developerUrl: provider.developerUrl,
                    docsUrl: provider.docsUrl,
                    billingUrl: provider.billingUrl,
                    updatedAt: provider.updatedAt
                },
                create: {
                    slug: provider.slug,
                    name: provider.name,
                    description: provider.description,
                    website: provider.website,
                    category: provider.category,
                    tags: provider.tags,
                    capabilities: provider.capabilities,
                    isApproved: provider.isApproved,
                    pricingModel: provider.pricingModel,
                    developerUrl: provider.developerUrl,
                    docsUrl: provider.docsUrl,
                    billingUrl: provider.billingUrl,
                    createdAt: provider.createdAt,
                    updatedAt: provider.updatedAt
                }
            });
        }
        console.log(`✅ Restored ${providers.length} Providers\n`);

        // 5. Check for DNS/Deployment data
        console.log('🌐 Checking for DNS/Deployment data...');
        const deployments = await backupDb.deployment.findMany();
        console.log(`Found ${deployments.length} Deployments in backup`);

        // We need to match deployments to existing repositories
        for (const deployment of deployments) {
            // Try to find the repository by ID or name
            const repo = await currentDb.repository.findFirst({
                where: {
                    OR: [
                        { id: deployment.repositoryId },
                        { githubId: deployment.repositoryId }
                    ]
                }
            });

            if (repo) {
                await currentDb.deployment.upsert({
                    where: { id: deployment.id },
                    update: {
                        provider: deployment.provider,
                        url: deployment.url,
                        status: deployment.status,
                        lastDeployedAt: deployment.lastDeployedAt,
                        detectedAt: deployment.detectedAt
                    },
                    create: {
                        repositoryId: repo.id,
                        provider: deployment.provider,
                        url: deployment.url,
                        status: deployment.status,
                        lastDeployedAt: deployment.lastDeployedAt,
                        detectedAt: deployment.detectedAt
                    }
                });
            }
        }
        console.log(`✅ Restored ${deployments.length} Deployments\n`);

        // 6. Summary
        console.log('='.repeat(60));
        console.log('📊 Restoration Summary:');
        console.log('='.repeat(60));
        console.log(`✅ ADRs: ${adrs.length}`);
        console.log(`✅ AI Reports: ${reports.length}`);
        console.log(`✅ Providers: ${providers.length}`);
        console.log(`✅ Deployments: ${deployments.length}`);
        console.log('='.repeat(60));
        console.log('\n✅ Data restoration complete!\n');

    } catch (error) {
        console.error('❌ Error during restoration:', error);
        throw error;
    } finally {
        await backupDb.$disconnect();
        await currentDb.$disconnect();
    }
}

restoreData()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
