import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const capabilities = await prisma.capability.findMany({
            include: {
                repository: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        url: true,
                        businessCanvas: true
                    }
                }
            }
        });

        // Group by Category -> Capability -> Repos
        const portfolio: Record<string, Record<string, any[]>> = {};

        capabilities.forEach(cap => {
            const category = cap.category || 'Uncategorized';
            const name = cap.name;

            if (!portfolio[category]) portfolio[category] = {};
            if (!portfolio[category][name]) portfolio[category][name] = [];

            portfolio[category][name].push({
                id: cap.repository.id,
                repoName: cap.repository.name,
                description: cap.repository.description,
                url: cap.repository.url,
                source: cap.source,
                canvas: cap.repository.businessCanvas
            });
        });

        return NextResponse.json({ portfolio });
    } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        return NextResponse.json({ error: 'Failed to fetch portfolio', details: String(error) }, { status: 500 });
    }
}
