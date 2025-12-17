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
        // 1. Run GitHub Fetch (In-Process)
        console.log('Starting GitHub Fetch...');
        const { syncGithubRepos } = await import('@/scripts/fetch-github-repos');
        const syncResult = await syncGithubRepos();
        console.log('GitHub Fetch finished:', syncResult);

        // 2. Run Seeder (Skipped for Sync - only needed for init)
        // const seederRes = await execAsync('npx prisma db seed', { cwd: dashboardDir });

        // 3. Auto-Verify Tasks
        const verifyDetails = "Verification Skipped (TODO: Move to import)";

        // Log Success
        await prisma.syncLog.create({
            data: {
                status: 'SUCCESS',
                message: 'Sync completed successfully',
                details: `GitHub Sync:\nCreated: ${syncResult.created}, Updated: ${syncResult.updated}, Total: ${syncResult.total}`
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Data synced successfully',
            stats: syncResult
        });
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
