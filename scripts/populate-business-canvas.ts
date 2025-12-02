import { PrismaClient } from '@prisma/client';
import { detectValueProp, detectCustomerSegments, detectRevenue, estimateCosts } from '../lib/business-canvas-analyzer';

const prisma = new PrismaClient();

async function main() {
    console.log('🎨 Starting Business Canvas Population...');

    const repos = await prisma.repository.findMany({
        include: {
            technologies: true,
            capabilities: true,
            businessCanvas: true
        }
    });

    console.log(`Found ${repos.length} repositories to analyze.`);

    for (const repo of repos) {
        console.log(`Analyzing ${repo.name}...`);

        // 1. Run Analysis
        const valueProp = detectValueProp(repo);
        const customers = detectCustomerSegments(repo.capabilities);
        const revenue = detectRevenue(repo.technologies);
        const costs = estimateCosts(repo.technologies);

        // 2. Update Database
        await prisma.businessCanvas.upsert({
            where: { repositoryId: repo.id },
            create: {
                repositoryId: repo.id,
                valueProposition: valueProp,
                customerSegments: customers.join(', '),
                revenueStreams: revenue.suggestedModel,
                costStructure: `$${costs}/mo`,
                estimatedARR: revenue.estimatedARR,
                monetizationPotential: revenue.monetizationPotential,
                marketSize: 'Unknown' // Placeholder for future expansion
            },
            update: {
                valueProposition: valueProp,
                customerSegments: customers.join(', '),
                revenueStreams: revenue.suggestedModel,
                costStructure: `$${costs}/mo`,
                estimatedARR: revenue.estimatedARR,
                monetizationPotential: revenue.monetizationPotential
            }
        });
    }

    console.log('✅ Business Canvas Population Complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
