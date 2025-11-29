import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ name: string }> }
) {
    const name = (await params).name;

    try {
        const repo = await prisma.repository.findFirst({
            where: {
                name: name
            },
            include: {
                technologies: true,
                interfaces: true,
                deployments: true,
            },
        });

        if (!repo) {
            return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
        }

        // Transform to match the frontend expected shape
        const formatted = {
            repo: {
                ...repo,
                languages: repo.language ? [{ size: 0, node: { name: repo.language } }] : []
            },
            technologies: repo.technologies,
            deployments: repo.deployments,
            interfaces: repo.interfaces.map((i: any) => ({
                ...i,
                details: i.details ? JSON.parse(i.details) : null
            }))
        };

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ name: string }> }
) {
    const name = (await params).name;

    try {
        const body = await request.json();
        const { customUrl } = body;

        const updated = await prisma.repository.updateMany({
            where: { name: name },
            data: { customUrl: customUrl }
        });

        return NextResponse.json({ success: true, updated });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to update repository' }, { status: 500 });
    }
}
