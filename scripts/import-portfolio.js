const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importPortfolioData() {
    console.log('🔄 Importing Portfolio Data...\n');

    try {
        // Read portfolio.json
        const portfolioPath = path.join(__dirname, '..', 'portfolio.json');
        if (!fs.existsSync(portfolioPath)) {
            console.error('❌ portfolio.json not found');
            return;
        }

        const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));
        console.log('✅ Loaded portfolio.json\n');

        let imported = 0;
        let updated = 0;
        let skipped = 0;

        // Process all categories
        for (const category in portfolioData.portfolio) {
            for (const subcategory in portfolioData.portfolio[category]) {
                const projects = portfolioData.portfolio[category][subcategory];

                console.log(`📂 Processing ${category} / ${subcategory} (${projects.length} projects)`);

                for (const project of projects) {
                    try {
                        // Find repository by URL or name
                        const repo = await prisma.repository.findFirst({
                            where: {
                                OR: [
                                    { url: project.url },
                                    { name: project.repoName },
                                    { nameWithOwner: { contains: project.repoName } }
                                ]
                            }
                        });

                        if (!repo) {
                            console.log(`   ⚠️  Repository not found: ${project.repoName}`);
                            skipped++;
                            continue;
                        }

                        // Check if canvas exists
                        const existingCanvas = await prisma.businessCanvas.findUnique({
                            where: { repositoryId: repo.id }
                        });

                        if (project.canvas) {
                            const canvasData = {
                                valueProposition: project.canvas.valueProposition,
                                customerSegments: project.canvas.customerSegments,
                                revenueStreams: project.canvas.revenueStreams,
                                costStructure: project.canvas.costStructure,
                                updatedAt: new Date(project.canvas.updatedAt)
                            };

                            if (existingCanvas) {
                                await prisma.businessCanvas.update({
                                    where: { repositoryId: repo.id },
                                    data: canvasData
                                });
                                updated++;
                            } else {
                                await prisma.businessCanvas.create({
                                    data: {
                                        repositoryId: repo.id,
                                        ...canvasData
                                    }
                                });
                                imported++;
                            }
                        }
                    } catch (error) {
                        console.error(`   ❌ Error processing ${project.repoName}:`, error.message);
                    }
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Import Summary:');
        console.log('='.repeat(60));
        console.log(`✅ Imported: ${imported} new business canvases`);
        console.log(`🔄 Updated: ${updated} existing business canvases`);
        console.log(`⚠️  Skipped: ${skipped} (repository not found)`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

importPortfolioData()
    .then(() => {
        console.log('\n✅ Portfolio data import complete!\n');
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
