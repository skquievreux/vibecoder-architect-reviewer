import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
    request: Request,
    { params }: { params: Promise<{ name: string }> }
) {
    const name = (await params).name;

    try {
        const body = await request.json();
        const { providerId } = body;

        if (!providerId) {
            return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
        }

        const repo = await prisma.repository.findFirst({ where: { name } });
        if (!repo) {
            return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
        }

        await prisma.repository.update({
            where: { id: repo.id },
            data: {
                providers: {
                    connect: { id: providerId }
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to add provider' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ name: string }> }
) {
    const name = (await params).name;

    try {
        const body = await request.json();
        const { providerId } = body;

        if (!providerId) {
            return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
        }

        const repo = await prisma.repository.findFirst({ where: { name } });
        if (!repo) {
            return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
        }

        await prisma.repository.update({
            where: { id: repo.id },
            data: {
                providers: {
                    disconnect: { id: providerId }
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to remove provider' }, { status: 500 });
    }
}
