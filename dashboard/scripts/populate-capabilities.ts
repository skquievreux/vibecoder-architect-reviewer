import { PrismaClient } from '@prisma/client';
import { detectCapabilities } from '../lib/capabilities';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Capability Population...');

    const repos = await prisma.repository.findMany({
        include: { technologies: true }
    });

    console.log(`Found ${repos.length} repositories to analyze.`);

    let totalCaps = 0;

    for (const repo of repos) {
        // 1. Extract Tech Names
        const techNames = repo.technologies.map(t => t.name);

        // 2. Detect Capabilities
        const capabilities = detectCapabilities(techNames);

        if (capabilities.length > 0) {
            console.log(`Repo: ${repo.name} -> Found ${capabilities.length} capabilities`);

            // 3. Save to DB
            // First, clear existing auto-detected capabilities to avoid duplicates
            await prisma.capability.deleteMany({
                where: { repositoryId: repo.id }
            });

            for (const cap of capabilities) {
                await prisma.capability.create({
                    data: {
                        repositoryId: repo.id,
                        name: cap.name,
                        category: cap.category,
                        source: cap.source,
                        confidence: 1.0
                    }
                });
                totalCaps++;
            }
        }
    }

    console.log(`✅ Capability Population Complete! Added ${totalCaps} capabilities.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
