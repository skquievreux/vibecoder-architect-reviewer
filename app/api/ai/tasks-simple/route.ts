import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
    try {
        // Simple task generation without AI
        const tasks = [
            { id: '1', title: 'Review deployment configurations', status: 'OPEN', priority: 'HIGH', type: 'MAINTENANCE' },
            { id: '2', title: 'Update documentation for custom domains', status: 'OPEN', priority: 'MEDIUM', type: 'DOCUMENTATION' },
            { id: '3', title: 'Test PDF generation in production', status: 'OPEN', priority: 'HIGH', type: 'TEST' }
        ];

        // Save tasks to database
        for (const task of tasks) {
            await prisma.repoTask.create({
                data: {
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    type: task.type
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: `Generated ${tasks.length} maintenance tasks`,
            tasks: tasks
        });

    } catch (error) {
        console.error('Task generation error:', error);
        return NextResponse.json(
            {
                error: 'Task generation failed',
                details: String(error)
            },
            { status: 500 }
        );
    }
}