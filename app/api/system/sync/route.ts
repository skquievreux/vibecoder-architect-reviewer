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
        const analyzerScript = path.join(rootDir, 'analysis', 'analyzer.py');

        // Log Start
        await prisma.syncLog.create({
            data: {
                status: 'INFO',
                message: 'Sync started',
                details: 'Triggered via Dashboard'
            }
        });

        // 1. Run Analyzer
        console.log('Starting Analyzer...');
        const analyzerRes = await execAsync(`python3 "${analyzerScript}"`, { cwd: rootDir });
        console.log('Analyzer finished.');

        // 2. Run Seeder
        console.log('Starting Seeder...');
        const seederRes = await execAsync('npx prisma db seed', { cwd: dashboardDir });
        console.log('Seeder finished.');

        // Log Success
        await prisma.syncLog.create({
            data: {
                status: 'SUCCESS',
                message: 'Sync completed successfully',
                details: `Analyzer:\n${analyzerRes.stdout}\n\nSeeder:\n${seederRes.stdout}`
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
