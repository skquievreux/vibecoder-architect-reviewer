import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const count = await prisma.repository.count();
        const firstRepo = await prisma.repository.findFirst({ select: { name: true } });

        // Mask password in DB URL
        const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
        const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');

        return NextResponse.json({
            status: 'ok',
            provider: 'fly.io (postgres)',
            repoCount: count,
            sampleRepo: firstRepo?.name || 'none',
            dbUrlMasked: maskedUrl,
            env: process.env.NODE_ENV
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
