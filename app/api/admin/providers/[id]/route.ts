import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const provider = await prisma.provider.update({
            where: { id: params.id },
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.provider.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
    }
}
