import prisma from '@/lib/prisma';

export async function getRepositories() {
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

            return {
                repo: {
                    ...r,
                    // Format dates to strings if they are Date objects, though Next.js serializes Date objects to ISO strings automatically in passed props sometimes,
                    // but safer to keep them as is if we are passing to a client component which might expect serialized JSON from API?
                    // Actually, Client Components expect serializable props. Date objects are NOT serializable by default in Next.js props (they show a warning).
                    // We should convert Dates to strings to be safe and consistent with the API response style.
                    createdAt: r.createdAt.toISOString(),
                    updatedAt: r.updatedAt.toISOString(),
                    pushedAt: r.pushedAt ? r.pushedAt.toISOString() : null,
                    languages: { edges: r.language ? [{ node: { name: r.language } }] : [] }
                },
                technologies: r.technologies.map((t: any) => ({ ...t, detectedAt: t.detectedAt.toISOString() })),
                deployments: r.deployments.map((d: any) => ({
                    ...d,
                    detectedAt: d.detectedAt.toISOString(),
                    lastDeployedAt: d.lastDeployedAt ? d.lastDeployedAt.toISOString() : null
                })),
                tasks: repoTasks.map((t: any) => ({
                    ...t,
                    createdAt: t.createdAt.toISOString(),
                    updatedAt: t.updatedAt.toISOString()
                })),
                interfaces: r.interfaces.map((i: any) => {
                    try {
                        return {
                            ...i,
                            detectedAt: i.detectedAt.toISOString(),
                            details: i.details ? JSON.parse(i.details) : null
                        };
                    } catch (e) {
                        return { ...i, detectedAt: i.detectedAt.toISOString(), details: null, _parseError: true };
                    }
                }),
                businessCanvas: r.businessCanvas ? {
                    ...r.businessCanvas,
                    updatedAt: r.businessCanvas.updatedAt.toISOString()
                } : null
            };
        });

        return formatted;
    } catch (error: any) {
        console.error('Data Fetch Error:', error);
        return [];
    }
}
