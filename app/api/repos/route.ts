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
                businessCanvas: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Fetch tasks separately to avoid "Unknown field" error with stale Prisma Client
        let tasks: any[] = [];
        try {
            // @ts-ignore
            if (prisma.repoTask) {
                // @ts-ignore
                tasks = await prisma.repoTask.findMany({
                    where: { status: 'OPEN' }
                });
            } else {
                // Fallback to raw SQL
                // Note: PostgreSQL tables created by Prisma are usually double-quoted case-sensitive
                try {
                    tasks = await prisma.$queryRawUnsafe(`SELECT * FROM "RepoTask" WHERE status = 'OPEN'`);
                } catch (sqlError) {
                    console.warn("SQL fallback failed, trying lowercase:", sqlError);
                    tasks = await prisma.$queryRawUnsafe(`SELECT * FROM "repo_task" WHERE status = 'OPEN'`);
                }
            }
        } catch (e) {
            console.warn("Failed to fetch tasks, continuing without them:", e);
            tasks = [];
        }

        // Transform to match the frontend expected shape
        const formatted = repos.map((r: any) => {
            const repoTasks = tasks.filter((t: any) => t.repositoryId === r.id);

            let parsedDetails = null;
            try {
                parsedDetails = r.interfaces?.[0]?.details ? JSON.parse(r.interfaces[0].details) : null;
            } catch (err) {
                console.warn(`Failed to parse interface details for repo ${r.name}`, err);
            }

            return {
                repo: {
                    ...r,
                    languages: { edges: r.language ? [{ node: { name: r.language } }] : [] }
                },
                technologies: r.technologies,
                deployments: r.deployments,
                tasks: repoTasks,
                interfaces: r.interfaces.map((i: any) => {
                    try {
                        return {
                            ...i,
                            details: i.details ? JSON.parse(i.details) : null
                        };
                    } catch (e) {
                        return { ...i, details: null, _parseError: true };
                    }
                }),
                businessCanvas: r.businessCanvas
            };
        });

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
