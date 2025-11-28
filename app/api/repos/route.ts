import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const repos = await prisma.repository.findMany({
            include: {
                technologies: true,
                interfaces: true,
                deployments: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Transform to match the frontend expected shape if needed
        // Frontend expects: { repo: ..., technologies: ..., interfaces: ... }
        const formatted = repos.map((r: any) => ({
            repo: {
                ...r,
                // Frontend expects languages as { edges: ... } from GH GraphQL, but we stored single string
                // We can adapt frontend or adapt here. Let's adapt here to keep frontend simple for now.
                languages: { edges: r.language ? [{ node: { name: r.language } }] : [] }
            },
            technologies: r.technologies,
            deployments: r.deployments,
            interfaces: r.interfaces.map((i: any) => ({
                ...i,
                details: i.details ? JSON.parse(i.details) : null
            }))
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
