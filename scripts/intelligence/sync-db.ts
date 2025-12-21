
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const ANALYZED_DIR = path.join(process.cwd(), 'data', 'intelligence', 'analyzed');
const SUMMARY_FILE = path.join(process.cwd(), 'docs', 'PORTFOLIO_SUMMARY.md');

async function main() {
    console.log("💾 Starting Intelligence Sync...");

    if (!fs.existsSync(ANALYZED_DIR)) {
        console.error("Analyzed directory not found. Run analyze.ts first.");
        return;
    }

    const files = fs.readdirSync(ANALYZED_DIR).filter(f => f.endsWith('.json'));
    let updatedCount = 0;
    let markdownContent = `# 🚀 Portfolio Intelligence Report\n\nGenerated on ${new Date().toLocaleDateString()}\n\n`;

    for (const file of files) {
        const raw = fs.readFileSync(path.join(ANALYZED_DIR, file), 'utf-8');
        const data = JSON.parse(raw);
        const { repositoryId, name, analysis } = data;

        if (!analysis) continue;

        console.log(`Syncing ${name}...`);

        // 1. Update DB
        await prisma.repository.update({
            where: { id: repositoryId },
            data: { description: analysis.description }
        });

        const canvasData = {
            valueProposition: JSON.stringify(analysis.businessCanvas.valueProposition),
            customerSegments: JSON.stringify(analysis.businessCanvas.customerSegments),
            revenueStreams: JSON.stringify(analysis.businessCanvas.revenueStreams),
            costStructure: JSON.stringify([{ "service": "Estimated", "amount": 0, "category": "General", "isTotal": true }])
        };

        await prisma.businessCanvas.upsert({
            where: { repositoryId: repositoryId },
            create: {
                repositoryId: repositoryId,
                ...canvasData
            },
            update: {
                ...canvasData,
                updatedAt: new Date()
            }
        });

        updatedCount++;

        // 2. Add to Markdown Summary
        markdownContent += `## ${name}\n`;
        markdownContent += `> ${analysis.description}\n\n`;
        markdownContent += `**Value Proposition:**\n${analysis.businessCanvas.valueProposition.map((v: string) => `- ${v}`).join('\n')}\n\n`;
        markdownContent += `**Target Customer:** ${analysis.businessCanvas.customerSegments.map((c: any) => c.name).join(', ')}\n`;
        markdownContent += `**Revenue Model:** ${analysis.businessCanvas.revenueStreams.map((r: any) => `${r.source} (${r.model})`).join(', ')}\n`;
        markdownContent += `\n---\n\n`;
    }

    // Write MD Summary
    fs.writeFileSync(SUMMARY_FILE, markdownContent);
    console.log(`\n📄 Generated Portfolio Summary at ${SUMMARY_FILE}`);
    console.log(`✨ Synced ${updatedCount} repositories to Database.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
