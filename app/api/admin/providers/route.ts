import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const providers = await prisma.provider.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(providers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const provider = await prisma.provider.create({
            data: {
                slug: body.slug,
                name: body.name,
                description: body.description,
                category: body.category,
                website: body.website,
                tags: body.tags, // Assumes JSON string from UI
                capabilities: body.capabilities, // Assumes JSON string from UI
                pricingModel: body.pricingModel,
            }
        });
        return NextResponse.json(provider);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
    }
}
