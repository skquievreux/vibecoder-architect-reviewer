import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        let reports;
        // Fallback for stale Prisma Client (server restart required for new models)
        if (!prisma.aIReport) {
            console.warn("AIReport model missing in Prisma Client. Using raw SQL fallback.");
            reports = await prisma.$queryRawUnsafe('SELECT * FROM AIReport ORDER BY createdAt DESC');
        } else {
            reports = await prisma.aIReport.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("Fetch Reports Error:", error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}
