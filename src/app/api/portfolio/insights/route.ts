import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Revenue Opportunities
        const revenueOpportunities = await prisma.businessCanvas.findMany({
            where: {
                OR: [
                    { monetizationPotential: 'HIGH' },
                    { estimatedARR: { gt: 0 } }
                ]
            },
            include: { repository: true },
            orderBy: { estimatedARR: 'desc' },
            take: 10
        });

        // 2. Consolidation Clusters
        const clusters = await prisma.businessCanvas.groupBy({
            by: ['consolidationGroup'],
            _count: { repositoryId: true },
            where: { consolidationGroup: { not: null } },
            having: { repositoryId: { _count: { gt: 1 } } }
        });

        const clusterDetails = await Promise.all(clusters.map(async (c) => {
            const repos = await prisma.businessCanvas.findMany({
                where: { consolidationGroup: c.consolidationGroup },
                include: { repository: true }
            });
            return {
                groupId: c.consolidationGroup,
                size: c._count.repositoryId,
                repos: repos.map(r => r.repository.name)
            };
        }));

        // 3. Capability Matrix
        const capabilities = await prisma.capability.groupBy({
            by: ['name', 'category'],
            _count: { repositoryId: true },
            orderBy: { _count: { repositoryId: 'desc' } },
            take: 20
        });

        return NextResponse.json({
            revenueOpportunities: revenueOpportunities.map(r => ({
                repoName: r.repository.name,
                arr: r.estimatedARR,
                potential: r.monetizationPotential,
                model: r.revenueStreams
            })),
            consolidationClusters: clusterDetails,
            capabilityMatrix: capabilities.map(c => ({
                name: c.name,
                category: c.category,
                count: c._count.repositoryId
            }))
        });

    } catch (error) {
        console.error('Insights Error:', error);
        return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
    }
}
