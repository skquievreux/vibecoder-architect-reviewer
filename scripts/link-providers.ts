import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Configuration for detection
const DETECTORS = [
    {
        providerId: 'vercel',
        files: ['vercel.json', '.vercel'],
        dependencies: ['vercel'],
        envVars: ['VERCEL_URL', 'VERCEL_ENV']
    },
    {
        providerId: 'fly',
        files: ['fly.toml'],
        dependencies: [],
        envVars: ['FLY_APP_NAME']
    },
    {
        providerId: 'supabase',
        files: ['supabase/config.toml'],
        dependencies: ['@supabase/supabase-js'],
        envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL']
    },
    {
        providerId: 'stripe',
        files: [],
        dependencies: ['stripe', '@stripe/stripe-js'],
        envVars: ['STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']
    },
    {
        providerId: 'openai',
        files: [],
        dependencies: ['openai'],
        envVars: ['OPENAI_API_KEY']
    },
    {
        providerId: 'perplexity',
        files: [],
        dependencies: [],
        envVars: ['PERPLEXITY_API_KEY']
    },
    {
        providerId: 'replicate',
        files: [],
        dependencies: ['replicate'],
        envVars: ['REPLICATE_API_TOKEN']
    },
    {
        providerId: 'fal',
        files: [],
        dependencies: ['@fal-ai/serverless-client'],
        envVars: ['FAL_KEY']
    },
    {
        providerId: 'suno',
        files: [],
        dependencies: [],
        envVars: ['SUNO_API_KEY']
    },
    {
        providerId: 'elevenlabs',
        files: [],
        dependencies: ['elevenlabs-node'],
        envVars: ['ELEVENLABS_API_KEY']
    },
    {
        providerId: 'cloudflare',
        files: ['wrangler.toml'],
        dependencies: [],
        envVars: ['CLOUDFLARE_API_TOKEN']
    },
    {
        providerId: 'hetzner',
        files: [], // Hard to detect via file, maybe docker-compose with specific labels?
        dependencies: [],
        envVars: ['HETZNER_TOKEN'] // Hypothetical
    },
    {
        providerId: 'clerk',
        files: ['middleware.ts', 'clerk.ts'],
        dependencies: ['@clerk/nextjs', '@clerk/clerk-sdk-node'],
        envVars: ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY']
    },
    {
        providerId: 'sentry',
        files: ['sentry.client.config.ts', 'sentry.server.config.ts', 'sentry.properties'],
        dependencies: ['@sentry/nextjs', '@sentry/node', '@sentry/react'],
        envVars: ['SENTRY_DSN', 'SENTRY_AUTH_TOKEN']
    },
    {
        providerId: 'posthog',
        files: [],
        dependencies: ['posthog-js', 'posthog-node'],
        envVars: ['NEXT_PUBLIC_POSTHOG_KEY', 'POSTHOG_API_KEY']
    },
    {
        providerId: 'resend',
        files: [],
        dependencies: ['resend'],
        envVars: ['RESEND_API_KEY']
    },
    {
        providerId: 'sanity',
        files: ['sanity.config.ts', 'sanity.cli.ts'],
        dependencies: ['sanity', 'next-sanity', '@sanity/client'],
        envVars: ['SANITY_PROJECT_ID', 'NEXT_PUBLIC_SANITY_PROJECT_ID']
    },
    {
        providerId: 'pinecone',
        files: [],
        dependencies: ['@pinecone-database/pinecone'],
        envVars: ['PINECONE_API_KEY', 'PINECONE_ENVIRONMENT']
    }
];

// Helper to check if file exists in repo
function hasFile(repoPath: string, fileName: string): boolean {
    return fs.existsSync(path.join(repoPath, fileName));
}

// Helper to check dependencies in package.json
function hasDependency(repoPath: string, depName: string): boolean {
    const pkgPath = path.join(repoPath, 'package.json');
    if (!fs.existsSync(pkgPath)) return false;
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        return !!allDeps[depName];
    } catch {
        return false;
    }
}

// Helper to check env vars in code (simple grep-like check)
function hasEnvVarUsage(repoPath: string, envVar: string): boolean {
    // We can't easily scan all files efficiently in this script without being slow.
    // But we can check .env.example or .env.local.example if they exist.
    // OR we can check if the repo has a .env file (we can't read it usually if gitignored, but we are local admin).
    // Let's assume we can read .env or .env.local for detection if they exist locally.
    const envFiles = ['.env', '.env.local', '.env.example', '.env.development'];
    for (const file of envFiles) {
        const filePath = path.join(repoPath, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content.includes(envVar)) return true;
        }
    }
    return false;
}

async function main() {
    console.log('Starting Provider Linking...');

    // 1. Get all repos from DB
    // We need the local path. Assuming we can derive it or it's stored.
    // The DB stores 'url' but not local path directly. 
    // However, we are running in the context where we know where repos are checked out?
    // Actually, the previous scripts (like generate-interface-registry) assumed access to 'portfolio.json' but didn't scan local files of OTHER repos.
    // Wait, 'scripts/detect-canvas.js' DOES scan local files? No, it reads from DB.

    // CRITICAL: We need to know where the repos are located on disk to scan them.
    // Assuming they are in the same parent directory as 'dashboard' or we have a mapping.
    // Let's assume a standard structure: /home/ladmin/Desktop/GIT/ArchitekturReview/<RepoName>
    // The dashboard is at /home/ladmin/Desktop/GIT/ArchitekturReview/dashboard

    const REPO_ROOT = path.join(__dirname, '..', '..'); // Go up two levels from scripts/

    const repos = await prisma.repository.findMany();
    const providers = await prisma.provider.findMany();

    const providerMap = new Map(providers.map(p => [p.slug, p.id])); // Map slug -> UUID

    for (const repo of repos) {
        const repoPath = path.join(REPO_ROOT, repo.name);

        if (!fs.existsSync(repoPath)) {
            console.warn(`Repo path not found: ${repoPath}, skipping.`);
            continue;
        }

        console.log(`Scanning ${repo.name}...`);
        const detectedProviderIds: string[] = [];

        for (const detector of DETECTORS) {
            let detected = false;

            // Check files
            for (const file of detector.files) {
                if (hasFile(repoPath, file)) {
                    detected = true;
                    console.log(`  -> Detected ${detector.providerId} via file ${file}`);
                    break;
                }
            }

            // Check dependencies
            if (!detected) {
                for (const dep of detector.dependencies) {
                    if (hasDependency(repoPath, dep)) {
                        detected = true;
                        console.log(`  -> Detected ${detector.providerId} via dependency ${dep}`);
                        break;
                    }
                }
            }

            // Check env vars
            if (!detected) {
                for (const env of detector.envVars) {
                    if (hasEnvVarUsage(repoPath, env)) {
                        detected = true;
                        console.log(`  -> Detected ${detector.providerId} via env var ${env}`);
                        break;
                    }
                }
            }

            if (detected) {
                const dbId = providerMap.get(detector.providerId);
                if (dbId) {
                    detectedProviderIds.push(dbId);
                }
            }
        }

        // Update DB
        if (detectedProviderIds.length > 0) {
            await prisma.repository.update({
                where: { id: repo.id },
                data: {
                    providers: {
                        connect: detectedProviderIds.map(id => ({ id }))
                    }
                }
            });
            console.log(`  Linked ${detectedProviderIds.length} providers to ${repo.name}`);
        }
    }

    console.log('Provider Linking Complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
