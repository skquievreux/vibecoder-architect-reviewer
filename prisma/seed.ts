import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const jsonPath = path.join(process.cwd(), 'analysis_results.json');

    if (!fs.existsSync(jsonPath)) {
        console.error('Analysis results not found at', jsonPath);
        return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    console.log(`Seeding ${data.length} repositories...`);

    for (const item of data) {
        const repoData = item.repo;

        // Check for new repo
        const existing = await prisma.repository.findUnique({
            where: { githubId: String(repoData.id) }
        });

        if (!existing) {
            await prisma.syncLog.create({
                data: {
                    status: 'INFO',
                    message: `New Repository Discovered: ${repoData.name}`,
                    details: `URL: ${repoData.url}`
                }
            });
        }

        // Upsert Repository
        const repo = await prisma.repository.upsert({
            where: { githubId: String(repoData.id) }, // Assuming we map github id to string
            update: {
                name: repoData.name,
                fullName: repoData.nameWithOwner || repoData.fullName, // Handle both cases
                nameWithOwner: repoData.nameWithOwner || repoData.fullName,
                url: repoData.url,
                description: repoData.description || '',
                isPrivate: repoData.isPrivate,
                updatedAt: new Date(repoData.updatedAt),
                pushedAt: repoData.pushedAt ? new Date(repoData.pushedAt) : null,
                language: repoData.languages?.[0]?.node?.name || null,
                defaultBranch: repoData.defaultBranchRef?.name || 'main',
            },
            create: {
                githubId: String(repoData.id),
                name: repoData.name,
                fullName: repoData.nameWithOwner || repoData.fullName,
                nameWithOwner: repoData.nameWithOwner || repoData.fullName,
                url: repoData.url,
                description: repoData.description || '',
                isPrivate: repoData.isPrivate,
                createdAt: repoData.createdAt ? new Date(repoData.createdAt) : new Date(),
                updatedAt: new Date(repoData.updatedAt),
                pushedAt: repoData.pushedAt ? new Date(repoData.pushedAt) : null,
                language: repoData.languages?.[0]?.node?.name || null,
                defaultBranch: repoData.defaultBranchRef?.name || 'main',
            },
        });

        // Technologies
        // Clear existing first to avoid duplicates on re-seed (simple approach)
        await prisma.technology.deleteMany({ where: { repositoryId: repo.id } });

        for (const tech of item.technologies) {
            await prisma.technology.create({
                data: {
                    repositoryId: repo.id,
                    name: tech.name,
                    category: tech.category,
                    version: tech.version,
                },
            });
        }

        // Interfaces
        await prisma.interface.deleteMany({ where: { repositoryId: repo.id } });
        for (const iface of item.interfaces) {
            let details = null;
            if (iface.details) {
                if (typeof iface.details === 'string') {
                    // Try to fix double stringified or invalid json
                    try { details = JSON.stringify(JSON.parse(iface.details)) }
                    catch { details = JSON.stringify({ raw: iface.details }) }
                } else {
                    details = JSON.stringify(iface.details);
                }
            }

            await prisma.interface.create({
                data: {
                    repositoryId: repo.id,
                    type: iface.type,
                    direction: iface.direction,
                    details: details,
                },
            });
        }

        // Business Canvas
        if (item.businessCanvas) {
            const canvas = item.businessCanvas;
            await prisma.businessCanvas.upsert({
                where: { repositoryId: repo.id },
                create: {
                    repositoryId: repo.id,
                    valueProposition: canvas.valueProposition,
                    customerSegments: canvas.customerSegments,
                    revenueStreams: canvas.revenueStreams,
                    costStructure: canvas.costStructure,
                    marketSize: canvas.marketSize || '',
                    monetizationPotential: canvas.monetizationPotential || '',
                    estimatedARR: canvas.estimatedARR ? canvas.estimatedARR : null,
                    updatedAt: canvas.updatedAt ? new Date(canvas.updatedAt) : new Date(),
                },
                update: {
                    valueProposition: canvas.valueProposition,
                    customerSegments: canvas.customerSegments,
                    revenueStreams: canvas.revenueStreams,
                    costStructure: canvas.costStructure,
                    marketSize: canvas.marketSize || '',
                    monetizationPotential: canvas.monetizationPotential || '',
                    estimatedARR: canvas.estimatedARR ? canvas.estimatedARR : null,
                    updatedAt: canvas.updatedAt ? new Date(canvas.updatedAt) : new Date(),
                }
            });
        }

        console.log('Seeding complete.');
    }

    main()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
