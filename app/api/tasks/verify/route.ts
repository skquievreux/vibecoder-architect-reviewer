import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from "@/lib/prisma";

export async function POST() {
    try {
        // 1. Fetch all OPEN tasks with their repositories
        // @ts-ignore
        const tasks = await prisma.repoTask.findMany({
            where: { status: 'OPEN' },
            include: { repository: true }
        });

        let verifiedCount = 0;
        const verifiedTasks = [];

        for (const task of tasks) {
            const repo = task.repository;
            // Assuming repos are checked out in a known location or we can find them relative to dashboard
            // For this environment, we'll assume they are siblings to the dashboard folder or we use the path from a previous step if stored.
            // Since we don't store absolute path in DB, we'll try to find it in the parent directory.

            // Heuristic: Try to find the repo in the parent directory
            const parentDir = path.resolve(process.cwd(), '..');
            const repoPath = path.join(parentDir, repo.name);
            const packageJsonPath = path.join(repoPath, 'package.json');

            if (!fs.existsSync(packageJsonPath)) {
                continue; // Cannot verify without package.json
            }

            let isCompleted = false;
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            const title = task.title.toLowerCase();

            // Heuristics
            if (title.includes('node') && title.includes('20')) {
                if (pkg.engines && pkg.engines.node && (pkg.engines.node.includes('20') || pkg.engines.node.includes('>=20'))) {
                    isCompleted = true;
                }
            } else if (title.includes('typescript') && title.includes('5.8')) {
                if (deps.typescript && deps.typescript.includes('5.8')) {
                    isCompleted = true;
                }
            } else if (title.includes('supabase') && title.includes('2.49')) {
                if (deps['@supabase/supabase-js'] && deps['@supabase/supabase-js'].includes('2.49')) {
                    isCompleted = true;
                }
            } else if (title.includes('next.js') && title.includes('16')) {
                if (deps.next && (deps.next.includes('16.') || deps.next.includes('^16'))) {
                    isCompleted = true;
                }
            }

            if (isCompleted) {
                // Update task status
                // @ts-ignore
                await prisma.repoTask.update({
                    where: { id: task.id },
                    data: { status: 'COMPLETED', updatedAt: new Date().toISOString() }
                });
                verifiedCount++;
                verifiedTasks.push({ id: task.id, title: task.title, repo: repo.name });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Verified ${verifiedCount} tasks`,
            verifiedTasks
        });

    } catch (error: any) {
        console.error("Task Verification Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to verify tasks' }, { status: 500 });
    }
}
