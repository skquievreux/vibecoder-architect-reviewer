import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function getVercelProjects(scope: string): Promise<{ name: string; envVars: string[] }[]> {
    try {
        // 1. List Projects
        // Capture both stdout and stderr because Vercel CLI might write to stderr in non-TTY
        const { stdout, stderr } = await execAsync(`vercel project list --scope ${scope}`);
        const lines = (stdout + '\n' + stderr).split('\n');
        const projects: { name: string; envVars: string[] }[] = [];
        // Output format is typically:
        //   Project Name   Latest Production URL   Updated
        //   proj-a         proj-a.vercel.app       1d
        // But sometimes headers are missing or different.
        // We'll look for lines that have at least 3 columns, where the second looks like a URL.

        for (const line of lines) {
            console.log('DEBUG LINE:', line);
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith('Vercel CLI')) continue;
            if (trimmed.startsWith('id')) continue; // Header in some views
            if (trimmed.includes('Project Name')) continue; // Header
            if (trimmed.startsWith('>')) continue; // Pagination info

            const parts = trimmed.split(/\s+/);
            // Expecting: Name URL Age ...
            if (parts.length >= 2 && !parts[0].includes('http')) {
                const name = parts[0];
                // Simple validation: name shouldn't be a URL
                projects.push({ name, envVars: [] });
            }
        }

        // 2. Fetch Env Vars for each project
        // Note: 'vercel env ls' requires a linked project, so we skip this for now to avoid errors.
        // We will rely on manual linking or future improvements for deep inspection.
        /*
        for (const proj of projects) {
            try {
                const { stdout: envStdout } = await execAsync(`vercel env ls ${proj.name} --scope ${scope}`);
                // Output format:
                // name  value  environments  created
                // KEY   *****  Production    1d
                const envLines = envStdout.split('\n');
                for (const el of envLines) {
                    const parts = el.trim().split(/\s+/);
                    if (parts.length > 0 && parts[0] !== 'name' && parts[0] !== 'Vercel') {
                        proj.envVars.push(parts[0]);
                    }
                }
            } catch (err) {
                console.warn(`Failed to fetch envs for ${proj.name}:`, err);
            }
        }
        */

        return projects;
    } catch (error) {
        console.warn('Failed to fetch Vercel projects:', error);
        return [];
    }
}

async function getFlyApps(): Promise<string[]> {
    try {
        const { stdout } = await execAsync('flyctl apps list --json');
        const apps = JSON.parse(stdout);
        return apps.map((a: any) => a.Name || a.name);
    } catch (error) {
        console.warn('Failed to fetch Fly apps:', error);
        return [];
    }
}

async function main() {
    console.log('Starting Provider Sync via CLI...');
    const VERCEL_SCOPE = 'skquievreuxs-projects';

    // 1. Fetch Remote Projects
    const vercelProjects = await getVercelProjects(VERCEL_SCOPE);
    console.log(`Found ${vercelProjects.length} Vercel projects in scope ${VERCEL_SCOPE}.`);

    const flyApps = await getFlyApps();
    console.log(`Found ${flyApps.length} Fly.io apps.`);

    // 2. Get DB Data
    const repos = await prisma.repository.findMany();
    const providers = await prisma.provider.findMany();

    const providerMap = new Map(providers.map(p => [p.slug, p.id]));

    // 3. Match and Link
    let linkedCount = 0;

    for (const repo of repos) {
        const repoName = repo.name.toLowerCase();
        const detectedProviderIds = new Set<string>();

        // Check Vercel
        const vProj = vercelProjects.find(p => p.name.toLowerCase() === repoName);
        if (vProj) {
            const vercelId = providerMap.get('vercel');
            if (vercelId) detectedProviderIds.add(vercelId);
            console.log(`  [Vercel] Matched ${repo.name}`);

            // Manual override for known Lemon Squeezy usage (as per user request)
            if (repoName === 'acid-monk-generator') {
                const lemonId = providerMap.get('lemon-squeezy');
                if (lemonId) {
                    detectedProviderIds.add(lemonId);
                    console.log(`    -> Manual: Detected Lemon Squeezy for ${repo.name}`);
                }
            }

            // Analyze Env Vars
            for (const env of vProj.envVars) {
                if (env.includes('LEMON_')) {
                    const id = providerMap.get('lemon-squeezy');
                    if (id) {
                        detectedProviderIds.add(id);
                        console.log(`    -> Detected Lemon Squeezy via ${env}`);
                    }
                }
                if (env.includes('R2_') || env.includes('CLOUDFLARE')) {
                    const id = providerMap.get('cloudflare');
                    if (id) {
                        detectedProviderIds.add(id);
                        console.log(`    -> Detected Cloudflare via ${env}`);
                    }
                }
                if (env.includes('SUPABASE') || env === 'DATABASE_URL') {
                    // DATABASE_URL is generic, but often Supabase in this stack.
                    // Let's be safe and only map explicit SUPABASE or if we assume default stack.
                    // For now, let's map explicit SUPABASE.
                    if (env.includes('SUPABASE')) {
                        const id = providerMap.get('supabase');
                        if (id) detectedProviderIds.add(id);
                        console.log(`    -> Detected Supabase via ${env}`);
                    }
                }
                if (env.includes('STRIPE')) {
                    const id = providerMap.get('stripe');
                    if (id) detectedProviderIds.add(id);
                    console.log(`    -> Detected Stripe via ${env}`);
                }
                if (env.includes('OPENAI')) {
                    const id = providerMap.get('openai');
                    if (id) detectedProviderIds.add(id);
                    console.log(`    -> Detected OpenAI via ${env}`);
                }
            }
        }

        // Check Fly
        if (flyApps.some(a => a.toLowerCase() === repoName)) {
            const flyId = providerMap.get('fly');
            if (flyId) detectedProviderIds.add(flyId);
            console.log(`  [Fly.io] Matched ${repo.name}`);
        }

        if (detectedProviderIds.size > 0) {
            await prisma.repository.update({
                where: { id: repo.id },
                data: {
                    providers: {
                        connect: Array.from(detectedProviderIds).map(id => ({ id }))
                    }
                }
            });
            linkedCount++;
        }
    }

    console.log(`Sync Complete. Updated ${linkedCount} repositories.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
