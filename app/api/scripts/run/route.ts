import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

const ALLOWED_SCRIPTS = {
    'audit-ecosystem': 'audit-ecosystem.js',
    'standardize-node': 'standardize-node.js',
    'standardize-ts': 'standardize-ts.js',
    'standardize-supabase': 'standardize-supabase.js',
    'analyze-next-migration': 'analyze-next-migration.js',
    'analyze-react-upgrade': 'analyze-react-upgrade.js',
    'upgrade-react': 'upgrade-react.js',
    'verify-tasks': 'verify-tasks.js',
    'sync-vercel-domains': 'sync-vercel-domains.js',
};

export async function POST(request: Request) {
    try {
        const { script, target } = await request.json();

        if (!ALLOWED_SCRIPTS[script as keyof typeof ALLOWED_SCRIPTS]) {
            return NextResponse.json({ error: 'Invalid script' }, { status: 400 });
        }

        // Prevent unsafe scripts in cloud environment
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            const UNSAFE_SCRIPTS = [
                'standardize-node',
                'standardize-ts',
                'standardize-supabase',
                'upgrade-react',
                'analyze-react-upgrade',
                'analyze-next-migration'
            ];

            if (UNSAFE_SCRIPTS.includes(script)) {
                return NextResponse.json({
                    error: 'This script modifies the local filesystem and cannot be run in a cloud environment (Vercel). Run it locally via CLI.'
                }, { status: 403 });
            }
        }

        const scriptName = ALLOWED_SCRIPTS[script as keyof typeof ALLOWED_SCRIPTS];
        const scriptPath = path.join(process.cwd(), 'scripts', scriptName);
        const targetDir = target || '../'; // Default to parent dir

        // Construct command
        let command = `node ${scriptPath} ${targetDir}`;

        if (script === 'upgrade-react') {
            command += ' tier2';
        }

        if (script !== 'audit-ecosystem' && script !== 'upgrade-react') {
            command += ' --yes'; // Auto-confirm for fixers
        }

        // Execute
        const result = await new Promise<Response>((resolve) => {
            exec(command, async (error, stdout, stderr) => {
                const output = stdout + (stderr ? `\nERRORS:\n${stderr}` : '');
                const status = error ? 'ERROR' : 'SUCCESS';

                // Log to DB
                try {
                    // @ts-ignore
                    if (!prisma.syncLog) {
                        // Fallback
                        const crypto = require('crypto');
                        await prisma.$executeRawUnsafe(
                            'INSERT INTO SyncLog (id, status, message, details, createdAt) VALUES (?, ?, ?, ?, ?)',
                            crypto.randomUUID(), status, `Executed script: ${scriptName}`, output, new Date().toISOString()
                        );
                    } else {
                        // @ts-ignore
                        await prisma.syncLog.create({
                            data: {
                                status,
                                message: `Executed script: ${scriptName}`,
                                details: output
                            }
                        });
                    }
                } catch (logError) {
                    console.error("Failed to log script execution", logError);
                }

                resolve(NextResponse.json({
                    success: !error,
                    output,
                    csvUrl: script === 'audit-ecosystem' ? '/api/scripts/download-audit' : null
                }));
            });
        });

        return result;

    } catch (error) {
        return NextResponse.json({ error: 'Failed to run script' }, { status: 500 });
    }
}
