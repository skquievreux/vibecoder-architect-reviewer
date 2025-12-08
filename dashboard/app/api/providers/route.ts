import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const providers = await prisma.provider.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(providers);
    } catch (error) {
        console.error('Error fetching providers:', error);
        return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
