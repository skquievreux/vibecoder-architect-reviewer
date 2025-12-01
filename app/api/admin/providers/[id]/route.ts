import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const provider = await prisma.provider.update({
            where: { id },
            data: {
                slug: body.slug,
                name: body.name,
                description: body.description,
                category: body.category,
                website: body.website,
                tags: body.tags,
                capabilities: body.capabilities,
                pricingModel: body.pricingModel,
            }
        });
        return NextResponse.json(provider);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.provider.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
    }
}
