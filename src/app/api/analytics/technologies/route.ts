import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const technologies = await prisma.technology.findMany({
            select: {
                name: true,
                version: true,
                category: true
            }
        });

        // Group by name and version
        const stats = technologies.reduce((acc: any, tech) => {
            const key = tech.name;
            if (!acc[key]) {
                acc[key] = {
                    name: tech.name,
                    category: tech.category,
                    total: 0,
                    versions: {}
                };
            }
            acc[key].total++;
            const v = tech.version || 'unknown';
            acc[key].versions[v] = (acc[key].versions[v] || 0) + 1;
            return acc;
        }, {});

        return NextResponse.json({ stats: Object.values(stats) });
    } catch (error) {
        console.error('Failed to fetch technology stats:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
