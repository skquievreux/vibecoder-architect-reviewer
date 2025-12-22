import { NextResponse } from 'next/server';
import { getRepositories } from '@/lib/repositories';

export async function GET() {
    try {
        const formatted = await getRepositories();
        return NextResponse.json(formatted);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch data',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
