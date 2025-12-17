
import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const snapshots = await prisma.healthSnapshot.findMany({
            orderBy: { date: 'asc' },
            take: 30 // Last 30 snapshots
        });

        return NextResponse.json({ snapshots });
    } catch (error) {
        console.error('Failed to fetch health snapshots:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
