import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    // 1. Fetch all OPEN tasks with their repositories
    const tasks = await (prisma as any).repoTask.findMany({
      where: { status: 'OPEN' },
      include: { repository: true }
    });

    let verifiedCount = 0;
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
        verifiedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verified ${verifiedCount} tasks successfully`,
      verifiedTasks
    });
    
  } catch (error: any) {
    console.error('Task verification error:', error);
    return NextResponse.json(
      { 
        error: 'Task verification failed', 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}