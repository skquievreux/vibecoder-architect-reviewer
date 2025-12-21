
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// This script will:
// 1. Fetch ALL 72 repositories from the database.
// 2. Generate a JSON file `data/full_portfolio_export.json` containing the current state.
// 3. This JSON file can then be used by the AI to generate descriptions for the remaining repos.

const prisma = new PrismaClient();

async function main() {
    const repos = await prisma.repository.findMany({
        include: {
            businessCanvas: true,
            technologies: {
                select: { name: true, category: true }
            }
        }
    });

    const exportData = repos.map(repo => ({
        name: repo.name,
        description: repo.description || "No description provided.",
        technologies: repo.technologies.map(t => t.name),
        hasBusinessCanvas: !!repo.businessCanvas,
        businessCanvas: repo.businessCanvas ? {
            valueProposition: repo.businessCanvas.valueProposition,
            customerSegments: repo.businessCanvas.customerSegments,
            revenueStreams: repo.businessCanvas.revenueStreams
        } : null
    }));

    const outputPath = path.join(process.cwd(), 'data', 'full_portfolio_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`Exported ${repos.length} repositories to ${outputPath}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
