import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const execAsync = promisify(exec);

export async function POST() {
    try {
        const dashboardDir = process.cwd();
        const rootDir = path.resolve(dashboardDir, '..');
        // 1. Run GitHub Fetch (replaces Analyzer)
        console.log('Starting GitHub Fetch...');
        const fetchScript = path.join(dashboardDir, 'scripts', 'fetch-github-repos.ts');
        // Use npx -y tsx to execute TS script directly
        const analyzerRes = await execAsync(`npx -y tsx "${fetchScript}"`, {
            cwd: dashboardDir,
            env: { ...process.env, PATH: process.env.PATH }
        });
        console.log('GitHub Fetch finished.');

        // 2. Run Seeder
        console.log('Starting Seeder...');
        const seederRes = await execAsync('npx prisma db seed', { cwd: dashboardDir });
        console.log('Seeder finished.');

        // 3. Auto-Verify Tasks
        console.log('Starting Auto-Verify Tasks...');
        const verifyScript = path.join(dashboardDir, 'scripts', 'verify-tasks.js');
        const verifyRes = await execAsync(`node "${verifyScript}"`, { cwd: dashboardDir });
        console.log('Task verification finished.');

        // Log Success
        await prisma.syncLog.create({
            data: {
                status: 'SUCCESS',
                message: 'Sync completed successfully',
                details: `Analyzer:\n${analyzerRes.stdout}\n\nSeeder:\n${seederRes.stdout}\n\nTask Verification:\n${verifyRes.stdout}`
            }
        });

        return NextResponse.json({ success: true, message: 'Data synced successfully' });
    } catch (error: any) {
        console.error('Sync Error:', error);

        // Log Failure
        await prisma.syncLog.create({
            data: {
                status: 'ERROR',
                message: 'Sync failed',
                details: error.message + '\n' + (error.stderr || error.stdout || '')
            }
        });

        return NextResponse.json({
            success: false,
            error: error.message,
            details: error.stderr || error.stdout
        }, { status: 500 });
    }
}
