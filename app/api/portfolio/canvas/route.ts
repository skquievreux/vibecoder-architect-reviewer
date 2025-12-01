
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { repositoryId, valueProposition, customerSegments, revenueStreams, costStructure } = body;

        if (!repositoryId) {
            return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
        }

        // Upsert the canvas
        const canvas = await prisma.businessCanvas.upsert({
            where: { repositoryId },
            update: {
                valueProposition: JSON.stringify(valueProposition),
                customerSegments: JSON.stringify(customerSegments),
                revenueStreams: JSON.stringify(revenueStreams),
                costStructure: JSON.stringify(costStructure),
                updatedAt: new Date()
            },
            create: {
                repositoryId,
                valueProposition: JSON.stringify(valueProposition),
                customerSegments: JSON.stringify(customerSegments),
                revenueStreams: JSON.stringify(revenueStreams),
                costStructure: JSON.stringify(costStructure)
            }
        });

        return NextResponse.json({ canvas });
    } catch (error) {
        console.error('Failed to update canvas:', error);
        return NextResponse.json({ error: 'Failed to update canvas', details: String(error) }, { status: 500 });
    }
}
