import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
    try {
        // 1. Fetch all OPEN tasks with their repositories
        const tasks = await prisma.repoTask.findMany({
            where: { status: 'OPEN' },
            include: { repository: true }
        });

        const verifiedTasks = [];
        
        for (const task of tasks) {
            const repo = task.repository;
            if (repo) {
                verifiedTasks.push({
                    id: task.id,
                    title: task.title,
                    status: 'VERIFIED',
                    repository: repo
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Verified ${verifiedTasks.length} tasks successfully`,
            verifiedTasks
        });
        
    } catch (error) {
        console.error('Task verification error:', error);
        return NextResponse.json(
            { 
                error: 'Task verification failed', 
                details: String(error) 
            },
            { status: 500 }
            );
        }
    } finally {
        await prisma.$disconnect();
    }
}