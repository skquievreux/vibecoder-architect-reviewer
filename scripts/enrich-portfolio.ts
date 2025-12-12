import { PrismaClient } from '@prisma/client';
import { safeCompletion } from '../lib/ai/core';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Deep Portfolio Enrichment...");

    // 1. Get all repositories
    const repos = await prisma.repository.findMany({
        include: {
            technologies: true,
            capabilities: true
        },
        orderBy: { updatedAt: 'desc' }
    });

    console.log(`📡 Analyzing ${repos.length} repositories...`);

    let processed = 0;
    const batchSize = 5;

    // Process in batches
    for (let i = 0; i < repos.length; i += batchSize) {
        const batch = repos.slice(i, i + batchSize);
        console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1} (${i + 1}-${Math.min(i + batchSize, repos.length)})...`);

        await Promise.all(batch.map(async (repo) => {
            try {
                // Skip if recently updated and has good description (optional check, currently we force update or check simple criteria)
                // For "Deep Enrichment", we might want to check if we have Capability Categories or nice descriptions
                // Let's run it for everyone but skip if description looks very complete already
                const hasDetailedDesc = repo.description && repo.description.length > 50 && !repo.description.includes("No description");

                const techList = repo.technologies.map(t => t.name).join(', ');

                const prompt = `
                 Analyze the software repository "${repo.name}".
                 Technologies detected: ${techList}
                 Current Description: "${repo.description || ''}"

                 Please provide a JSON response with the following fields:
                 1. "description": A professional, german summary (max 2 sentences) describing WHAT it does and WHO it is for.
                 2. "category": One precise Category (e.g., "E-Commerce", "Internal Tool", "Boilerplate", "Portfolio", "AI Service", "Backend API").
                 3. "tags": An array of 3-5 strings representing technical or functional tags.
                 4. "business_value": A short phrase describing the business value (e.g. "Automates customer support").

                 Output JSON ONLY. No markdown formatting.
                 `;

                const completion = await safeCompletion({
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "You are a senior software architect analyzing a portfolio. You respond in valid JSON only." },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 300,
                });

                const content = completion.choices[0].message.content || "{}";
                // Strip markdown code blocks if present
                const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();

                let data;
                try {
                    data = JSON.parse(cleanJson);
                } catch (e) {
                    console.warn(`⚠️ Failed to parse JSON for ${repo.name}, using raw text fallback.`);
                    // Simple fallback if JSON fails
                    data = { description: cleanJson.substring(0, 200), category: 'Uncategorized', tags: [] };
                }

                if (data.description) {
                    // Update Repository
                    await prisma.repository.update({
                        where: { id: repo.id },
                        data: {
                            description: data.description,
                            // We could store category/tags in a JSON field if we had one, 
                            // or just map them to capabilities/topics. 
                            // For now, let's append tags to description if needed or just keep description clean.
                            // Let's simply update the description to be high quality.
                        }
                    });

                    // Intelligent Capability/Tag Addition
                    // We add the "Category" as a Capability if it doesn't exist
                    if (data.category && data.category !== 'Uncategorized') {
                        const catName = data.category.toUpperCase().replace(/\s+/g, '_');
                        // Check if exists
                        const exists = repo.capabilities.some(c => c.name === catName);
                        if (!exists) {
                            await prisma.capability.create({
                                data: {
                                    name: catName,
                                    category: 'BUSINESS', // New business category
                                    source: 'ai_enrichment',
                                    repositoryId: repo.id
                                }
                            }).catch(() => { }); // Ignore unique constraint if race condition
                        }
                    }

                    console.log(`✅ Enriched ${repo.name}: ${data.category}`);
                }

            } catch (err: any) {
                console.error(`❌ Failed ${repo.name}: ${err.message}`);
            }
        }));


    }

    console.log("\n🎉 Deep Enrichment Complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
