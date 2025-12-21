
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const mapPath = path.join(process.cwd(), 'data', 'portfolio-enhancement-map.json');
    console.log(`📖 Reading enhancement map from ${mapPath}...`);

    const rawData = fs.readFileSync(mapPath, 'utf-8');
    const enhancementMap = JSON.parse(rawData);

    console.log(`🚀 Starting Bulk Portfolio Enhancement for ${Object.keys(enhancementMap).length} projects...`);

    for (const [repoName, data] of Object.entries(enhancementMap)) {
        // Find repo (handle potential case sensitivity loosely if possible, but Prisma needs exact or filter)
        const repo = await prisma.repository.findFirst({
            where: { name: { equals: repoName, mode: 'insensitive' } }
        });

        if (!repo) {
            console.warn(`⚠️ Repository "${repoName}" not found in DB! Skipping.`);
            continue;
        }

        console.log(`Processing ${repo.name}...`);

        // Update Repository Description
        await prisma.repository.update({
            where: { id: repo.id },
            data: { description: data.description }
        });

        // Update or Create Business Canvas
        // Ensure all JSON fields are strings
        const canvasData = {
            valueProposition: typeof data.canvas.valueProposition === 'string' ? data.canvas.valueProposition : JSON.stringify(data.canvas.valueProposition),
            customerSegments: typeof data.canvas.customerSegments === 'string' ? data.canvas.customerSegments : JSON.stringify(data.canvas.customerSegments),
            revenueStreams: typeof data.canvas.revenueStreams === 'string' ? data.canvas.revenueStreams : JSON.stringify(data.canvas.revenueStreams),
            costStructure: JSON.stringify([{ "service": "Total Estimated", "amount": 0, "category": "Summary", "isTotal": true }]) // Default if missing
        };

        await prisma.businessCanvas.upsert({
            where: { repositoryId: repo.id },
            create: {
                repositoryId: repo.id,
                ...canvasData
            },
            update: {
                ...canvasData,
                updatedAt: new Date()
            }
        });
    }

    console.log("\n✨ Bulk Enhancement Complete! All projects now have professional descriptions and business data.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
