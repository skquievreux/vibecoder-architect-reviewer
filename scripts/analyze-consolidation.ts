import { PrismaClient } from '@prisma/client';
import { calculateSimilarity } from '../lib/consolidation-analyzer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log('🧩 Starting Consolidation Analysis...');

    const repos = await prisma.repository.findMany({
        include: {
            technologies: true,
            capabilities: true,
            businessCanvas: true
        }
    });

    console.log(`Analyzing ${repos.length} repositories...`);

    // Reset existing groups
    await prisma.businessCanvas.updateMany({
        data: { consolidationGroup: null }
    });

    const visited = new Set<string>();
    let clustersFound = 0;

    for (let i = 0; i < repos.length; i++) {
        const repoA = repos[i];
        if (visited.has(repoA.id)) continue;

        const cluster = [repoA.id];

        for (let j = i + 1; j < repos.length; j++) {
            const repoB = repos[j];
            if (visited.has(repoB.id)) continue;

            const score = calculateSimilarity(repoA, repoB);

            // Threshold for clustering (0.7 = 70% similarity)
            if (score >= 0.7) {
                console.log(`Match found: ${repoA.name} <-> ${repoB.name} (Score: ${score.toFixed(2)})`);
                cluster.push(repoB.id);
                visited.add(repoB.id);
            }
        }

        if (cluster.length > 1) {
            const groupId = uuidv4();
            clustersFound++;
            console.log(`Creating Cluster ${clustersFound} with ${cluster.length} repos.`);

            await prisma.businessCanvas.updateMany({
                where: { repositoryId: { in: cluster } },
                data: { consolidationGroup: groupId }
            });
        }

        visited.add(repoA.id);
    }

    console.log(`✅ Consolidation Analysis Complete! Found ${clustersFound} clusters.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
