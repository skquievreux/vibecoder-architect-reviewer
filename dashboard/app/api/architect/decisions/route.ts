import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const decisions = await prisma.architectureDecision.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(decisions);
    } catch (error) {
        console.error('Error fetching decisions:', error);
        return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, status, context, decision, consequences, tags } = body;

        if (!title || !decision) {
            return NextResponse.json({ error: 'Title and Decision are required' }, { status: 400 });
        }

        const newDecision = await prisma.architectureDecision.create({
            data: {
                title,
                status: status || 'PROPOSED',
                context: context || '',
                decision,
                consequences: consequences || '',
                tags: tags || '[]', // JSON string
            }
        });

        return NextResponse.json(newDecision);
    } catch (error) {
        console.error('Error creating decision:', error);
        return NextResponse.json({ error: 'Failed to create decision' }, { status: 500 });
    }
}
