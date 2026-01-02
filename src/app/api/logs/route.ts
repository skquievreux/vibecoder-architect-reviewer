import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        let logs;
        // @ts-ignore
        if (!prisma.syncLog) {
            logs = await prisma.$queryRawUnsafe('SELECT * FROM SyncLog ORDER BY createdAt DESC LIMIT 50');
        } else {
            // @ts-ignore
            logs = await prisma.syncLog.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50
            });
        }
        return NextResponse.json({ logs });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
