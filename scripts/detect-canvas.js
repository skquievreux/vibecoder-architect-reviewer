const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Business Canvas Detection...");

    const repos = await prisma.repository.findMany({
        include: { technologies: true, interfaces: true, capabilities: true }
    });

    console.log(`Analyzing ${repos.length} repositories...`);

    for (const repo of repos) {
        const text = (repo.description || '') + ' ' + (repo.name || '');
        const lowerText = text.toLowerCase();

        // --- 1. Customer Segments (Personas) ---
        const customers = [];

        // Musicians
        if (lowerText.includes('music') || lowerText.includes('audio') || lowerText.includes('sound') || lowerText.includes('song')) {
            customers.push({
                name: 'Musicians & Producers',
                confidence: 0.9,
                pain_points: ['High mastering costs', 'Complex distribution', 'Creative block'],
                willingness_to_pay: 'Medium ($10-30/mo)'
            });
        }

        // Podcasters
        if (lowerText.includes('podcast') || lowerText.includes('transcri') || lowerText.includes('speech')) {
            customers.push({
                name: 'Podcasters',
                confidence: 0.85,
                pain_points: ['Transcription costs', 'Editing time', 'Show notes creation'],
                willingness_to_pay: 'High ($20-100/mo)',
                market_size: 'Growing (5M+ podcasts)'
            });
        }

        // Content Creators
        if (lowerText.includes('video') || lowerText.includes('image') || lowerText.includes('visual') || lowerText.includes('social')) {
            customers.push({
                name: 'Content Creators',
                confidence: 0.8,
                pain_points: ['Consistent posting', 'Visual quality', 'Engagement'],
                willingness_to_pay: 'Medium ($15-50/mo)'
            });
        }

        // Developers
        if (lowerText.includes('api') || lowerText.includes('sdk') || lowerText.includes('library') || lowerText.includes('tool')) {
            customers.push({
                name: 'Developers',
                confidence: 0.9,
                pain_points: ['Integration time', 'Maintenance', 'Scalability'],
                willingness_to_pay: 'High (Usage based)'
            });
        }

        // Default
        if (customers.length === 0) {
            customers.push({
                name: 'Early Adopters',
                confidence: 0.4,
                pain_points: ['Seeking novelty'],
                willingness_to_pay: 'Low'
            });
        }

        // --- 2. Value Proposition ---
        const valueProp = [];
        if (lowerText.includes('generate')) valueProp.push('Automated Content Creation');
        if (lowerText.includes('transcribe')) valueProp.push('Fast, Accurate Transcription');
        if (lowerText.includes('analyze') || lowerText.includes('insight')) valueProp.push('Data-Driven Insights');
        if (lowerText.includes('manage') || lowerText.includes('organize')) valueProp.push('Streamlined Workflow');

        if (valueProp.length === 0) valueProp.push('Innovative Solution (Generic)');

        // --- 3. Cost Structure (Detailed) ---
        const costs = [];
        let totalCost = 0;

        // Infrastructure
        if (repo.technologies.some(t => t.name.toLowerCase().includes('supabase'))) {
            costs.push({ service: 'Supabase', amount: 25, category: 'Database', optimizable: true, note: 'Consolidate projects?' });
            totalCost += 25;
        }
        if (repo.technologies.some(t => t.name.toLowerCase().includes('vercel'))) {
            costs.push({ service: 'Vercel Pro', amount: 20, category: 'Hosting', note: 'Check if Pro is needed' });
            totalCost += 20;
        }

        // AI APIs
        if (repo.technologies.some(t => t.name.toLowerCase().includes('openai'))) {
            costs.push({ service: 'OpenAI API', amount: 15, category: 'AI Services', variable: true, note: 'Est. based on usage' });
            totalCost += 15;
        }
        if (repo.technologies.some(t => t.name.toLowerCase().includes('replicate'))) {
            costs.push({ service: 'Replicate', amount: 30, category: 'AI Services', variable: true, note: 'Image/Video gen is expensive' });
            totalCost += 30;
        }
        if (repo.technologies.some(t => t.name.toLowerCase().includes('anthropic'))) {
            costs.push({ service: 'Anthropic API', amount: 10, category: 'AI Services', variable: true });
            totalCost += 10;
        }

        // Storage
        if (repo.technologies.some(t => t.name.toLowerCase().includes('aws') || t.name.toLowerCase().includes('s3'))) {
            costs.push({ service: 'AWS S3', amount: 10, category: 'Storage', alternative: 'Cloudflare R2 (Cheaper)' });
            totalCost += 10;
        }

        costs.push({ service: 'Total Estimated', amount: totalCost, category: 'Summary', isTotal: true });


        // --- 4. Revenue Streams (Opportunities) ---
        const revenue = [];
        const hasStripe = repo.technologies.some(t => t.name.toLowerCase().includes('stripe'));

        if (hasStripe) {
            revenue.push({
                source: 'Active Revenue',
                model: 'Stripe Integration Detected',
                status: 'Active',
                confidence: 1.0
            });
        } else {
            // Opportunities
            if (customers.some(c => c.name.includes('Musicians'))) {
                revenue.push({
                    source: 'Subscription',
                    model: 'Pro Plan ($19/mo)',
                    potential_arr: 12000,
                    effort: 'Low (Add Stripe)',
                    impact: 'High'
                });
            }
            if (customers.some(c => c.name.includes('Podcasters'))) {
                revenue.push({
                    source: 'Usage-based',
                    model: 'Pay per minute ($0.10/min)',
                    potential_arr: 18000,
                    effort: 'Medium (Metering)',
                    impact: 'High'
                });
            }
            if (customers.some(c => c.name.includes('Developers'))) {
                revenue.push({
                    source: 'API Access',
                    model: 'Tiered API Keys',
                    potential_arr: 25000,
                    effort: 'High (API Gateway)',
                    impact: 'High'
                });
            }
            if (customers.some(c => c.name.includes('Content Creators'))) {
                revenue.push({
                    source: 'Freemium',
                    model: 'Free w/ Watermark -> Paid',
                    potential_arr: 5000,
                    effort: 'Medium',
                    impact: 'Medium'
                });
            }
        }

        // Save to DB
        await prisma.businessCanvas.upsert({
            where: { repositoryId: repo.id },
            update: {
                valueProposition: JSON.stringify(valueProp),
                customerSegments: JSON.stringify(customers),
                revenueStreams: JSON.stringify(revenue),
                costStructure: JSON.stringify(costs),
                updatedAt: new Date()
            },
            create: {
                repositoryId: repo.id,
                valueProposition: JSON.stringify(valueProp),
                customerSegments: JSON.stringify(customers),
                revenueStreams: JSON.stringify(revenue),
                costStructure: JSON.stringify(costs)
            }
        });
        console.log(`Canvas updated for ${repo.name}`);
    }

    console.log("🎉 Smart Canvas Detection complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
