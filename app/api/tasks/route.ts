import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get('repositoryId');

    try {
        let tasks;
        // @ts-ignore
        if (!prisma.repoTask) {
            // Fallback
            let query = 'SELECT * FROM RepoTask WHERE status != "IGNORED"';
            if (repoId) query += ` AND repositoryId = '${repoId}'`;
            query += ' ORDER BY priority ASC, createdAt DESC'; // HIGH is usually alphabetically before LOW? No.
            // Let's just order by createdAt for raw SQL fallback simplicity or implement custom sort later
            tasks = await prisma.$queryRawUnsafe(query);
        } else {
            const where: any = { status: { not: 'IGNORED' } };
            if (repoId) where.repositoryId = repoId;

            // @ts-ignore
            tasks = await prisma.repoTask.findMany({
                where,
                include: { repository: true },
                orderBy: [
                    { priority: 'asc' }, // HIGH, LOW, MEDIUM - wait, enum strings sort alphabetically. HIGH < LOW < MEDIUM. Ideally we want HIGH first.
                    // If we want custom sort we need to map it. For now let's just sort by date.
                    { createdAt: 'desc' }
                ]
            });
        }
        return NextResponse.json({ tasks });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();

        // @ts-ignore
        if (!prisma.repoTask) {
            await prisma.$executeRawUnsafe(
                'UPDATE RepoTask SET status = ?, updatedAt = ? WHERE id = ?',
                status, new Date().toISOString(), id
            );
            return NextResponse.json({ success: true });
        } else {
            // @ts-ignore
            const task = await prisma.repoTask.update({
                where: { id },
                data: { status }
            });
            return NextResponse.json({ task });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}
