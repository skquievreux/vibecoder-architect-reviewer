import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const decision = await prisma.architectureDecision.findUnique({
            where: { id }
        });

        if (!decision) {
            return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
        }

        return NextResponse.json(decision);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch decision' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const updatedDecision = await prisma.architectureDecision.update({
            where: { id },
            data: {
                title: body.title,
                status: body.status,
                context: body.context,
                decision: body.decision,
                consequences: body.consequences,
                tags: body.tags,
            }
        });

        return NextResponse.json(updatedDecision);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update decision' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.architectureDecision.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete decision' }, { status: 500 });
    }
}
