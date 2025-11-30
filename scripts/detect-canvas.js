const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Business Canvas Detection...");

    const repos = await prisma.repository.findMany({
        include: { technologies: true, interfaces: true, capabilities: true }
    });

    console.log(`Analyzing ${repos.length} repositories...`);

    for (const repo of repos) {
        const valueProp = [];
        const customers = [];
        const revenue = [];
        const costs = [];

        const text = (repo.description || '') + ' ' + (repo.name || '');
        const lowerText = text.toLowerCase();

        // 1. Value Proposition
        if (lowerText.includes('generate') || lowerText.includes('generator')) {
            if (lowerText.includes('image') || lowerText.includes('visual')) valueProp.push('AI Image Generation');
            if (lowerText.includes('video')) valueProp.push('AI Video Generation');
            if (lowerText.includes('music') || lowerText.includes('audio')) valueProp.push('AI Music Generation');
            if (lowerText.includes('text') || lowerText.includes('story')) valueProp.push('AI Storytelling');
        }
        if (lowerText.includes('transcribe') || lowerText.includes('whisper')) valueProp.push('Audio Transcription');
        if (lowerText.includes('portfolio') || lowerText.includes('website')) valueProp.push('Personal Branding');
        if (lowerText.includes('dashboard') || lowerText.includes('analytics')) valueProp.push('Data Visualization');

        // 2. Customer Segments
        if (lowerText.includes('music') || lowerText.includes('artist')) customers.push('Musicians');
        if (lowerText.includes('content') || lowerText.includes('creator')) customers.push('Content Creators');
        if (lowerText.includes('business') || lowerText.includes('enterprise')) customers.push('Enterprises');
        if (lowerText.includes('developer') || lowerText.includes('tool')) customers.push('Developers');

        // Default if empty but has AI capabilities
        if (customers.length === 0 && repo.capabilities.some(c => c.category === 'AI')) {
            customers.push('Early Adopters');
        }

        // 3. Revenue Streams
        const hasStripe = repo.technologies.some(t => t.name.toLowerCase().includes('stripe'));
        const hasPaypal = repo.technologies.some(t => t.name.toLowerCase().includes('paypal'));

        if (hasStripe) revenue.push('Stripe Payments');
        if (hasPaypal) revenue.push('PayPal');

        if (revenue.length === 0) {
            // Potential
            if (valueProp.some(v => v.includes('AI'))) revenue.push('Potential: Subscription Model');
            if (valueProp.some(v => v.includes('API'))) revenue.push('Potential: API Credits');
        }

        // 4. Cost Structure
        if (repo.technologies.some(t => t.name.toLowerCase().includes('supabase'))) costs.push('Supabase ($25/mo est.)');
        if (repo.technologies.some(t => t.name.toLowerCase().includes('vercel'))) costs.push('Vercel ($20/mo est.)');
        if (repo.technologies.some(t => t.name.toLowerCase().includes('openai'))) costs.push('OpenAI API (Usage based)');
        if (repo.technologies.some(t => t.name.toLowerCase().includes('replicate'))) costs.push('Replicate API (Usage based)');
        if (repo.technologies.some(t => t.name.toLowerCase().includes('aws'))) costs.push('AWS Infrastructure');

        // Save to DB
        if (valueProp.length > 0 || customers.length > 0 || revenue.length > 0 || costs.length > 0) {
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
    }

    console.log("🎉 Canvas Detection complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
