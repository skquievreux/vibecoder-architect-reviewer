import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const reports = await prisma.aIReport.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("Fetch Reports Error:", error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}
