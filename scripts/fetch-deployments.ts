
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load Env
const envLocal = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
dotenv.config();

const prisma = new PrismaClient();
const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchVercelDeployments() {
    if (!VERCEL_TOKEN) {
        console.log("⚠️ VERCEL_API_TOKEN missing. Skipping Vercel scan.");
        return;
    }

    console.log("🔍 Scanning Vercel Deployments...");
    const headers = { 'Authorization': `Bearer ${VERCEL_TOKEN}` };

    // 1. Get Projects first
    let projects: any[] = [];
    try {
        const res = await fetch('https://api.vercel.com/v9/projects?limit=100', { headers });
        if (res.ok) {
            const data = await res.json();
            projects = data.projects;
            console.log(`   Found ${projects.length} Vercel projects.`);
        } else {
            console.error(`   ❌ Failed to fetch Vercel projects: ${res.status}`);
            return;
        }
    } catch (e: any) {
        console.error(`   ❌ Vercel Error: ${e.message}`);
        return;
    }

    // 2. Process Projects
    for (const proj of projects) {
        // Find Repo
        let repo = await prisma.repository.findFirst({
            where: {
                OR: [
                    { name: proj.name },
                    { name: proj.link?.repo?.split('/')[1] || "nomatch" }
                ]
            }
        });

        if (!repo) continue;

        // Get Latest Deployment for this project
        // Only active/production ones usually matter for "Current State"
        // But let's check the latest one.
        const depRes = await fetch(`https://api.vercel.com/v6/deployments?projectId=${proj.id}&limit=1&state=READY`, { headers });
        if (depRes.ok) {
            const depData = await depRes.json();
            const latest = depData.deployments[0];

            if (latest) {
                // Upsert Deployment Record
                const existing = await prisma.deployment.findFirst({
                    where: { repositoryId: repo.id, provider: 'Vercel' }
                });

                const data = {
                    repositoryId: repo.id,
                    provider: 'Vercel',
                    url: `https://${latest.url}`, // The deployment URL
                    status: latest.state, // READY, ERROR etc
                    lastDeployedAt: new Date(latest.created), // or ready field
                    detectedAt: new Date(),
                };

                if (existing) {
                    await prisma.deployment.update({ where: { id: existing.id }, data });
                } else {
                    await prisma.deployment.create({ data });
                }
                console.log(`   ✅ Vercel: ${repo.name} -> ${latest.url} (${latest.state})`);
            }
        }
    }
}

async function fetchGitHubDeployments() {
    if (!GITHUB_TOKEN) {
        console.log("⚠️ GITHUB_TOKEN missing. Skipping GitHub scan.");
        return;
    }

    console.log("🔍 Scanning GitHub Deployments...");
    const repos = await prisma.repository.findMany({
        where: { nameWithOwner: { not: "" } } // Only repos where we know the GH full name
    });

    for (const repo of repos) {
        if (!repo.nameWithOwner) continue;

        try {
            const res = await fetch(`https://api.github.com/repos/${repo.nameWithOwner}/deployments?per_page=1`, {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (res.ok) {
                const deps = await res.json();
                if (deps.length > 0) {
                    const latest = deps[0];

                    // Allow multiple providers (Vercel via GH, or GH Pages)
                    // If GitHub shows a deployment, it might be Vercel too.
                    const env = latest.environment || "production";

                    // Check local DB
                    const existing = await prisma.deployment.findFirst({
                        where: { repositoryId: repo.id, provider: `GitHub:${env}` }
                    });

                    // Get status
                    const statusRes = await fetch(latest.statuses_url, {
                        headers: {
                            'Authorization': `Bearer ${GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    let status = "UNKNOWN";
                    let logUrl = "";
                    if (statusRes.ok) {
                        const statuses = await statusRes.json();
                        if (statuses.length > 0) {
                            status = statuses[0].state; // success, failure
                            logUrl = statuses[0].target_url;
                        }
                    }

                    const data = {
                        repositoryId: repo.id,
                        provider: `GitHub:${env}`,
                        url: logUrl,
                        status: status,
                        lastDeployedAt: new Date(latest.created_at),
                        detectedAt: new Date()
                    };

                    if (existing) {
                        await prisma.deployment.update({ where: { id: existing.id }, data });
                    } else {
                        await prisma.deployment.create({ data });
                    }
                    console.log(`   ✅ GitHub (${env}): ${repo.name} -> ${status}`);
                }
            }
        } catch (e: any) {
            // Ignore 404s
        }
    }
}

async function main() {
    console.log("🚀 Starting Global Deployment Scan...\n");
    await fetchVercelDeployments();
    await fetchGitHubDeployments();

    // Summary
    const total = await prisma.deployment.count();
    console.log(`\n🎉 Total Active Deployments Tracked: ${total}`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
