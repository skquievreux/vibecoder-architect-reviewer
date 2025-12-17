
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;

async function fetchVercelProjects() {
    if (!VERCEL_TOKEN) throw new Error('VERCEL_API_TOKEN is not defined');

    const res = await fetch('https://api.vercel.com/v9/projects', {
        headers: {
            'Authorization': `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch Vercel projects: ${res.statusText}`);
    }

    const data = await res.json();
    return data.projects || [];
}

async function main() {
    console.log("🚀 Syncing Vercel Deployments...");

    if (!VERCEL_TOKEN) {
        console.error("❌ VERCEL_API_TOKEN or VERCEL_TOKEN not found in environment.");
        // We will try running anyway in case the user has it set in their shell, but warn.
        process.exit(1);
    }

    try {
        const projects = await fetchVercelProjects();
        console.log(`Found ${projects.length} Vercel projects.`);

        for (const project of projects) {
            // Rate limit kindness
            await new Promise(r => setTimeout(r, 200));

            // Try to find matching repository by Name or Git Link
            let repo = null;

            if (project.link && project.link.type === 'github') {
                const fullName = project.link.repo;
                if (typeof fullName === 'string' && fullName.includes('/')) {
                    repo = await prisma.repository.findFirst({
                        where: { nameWithOwner: fullName }
                    });
                }
            }
            if (!repo) {
                repo = await prisma.repository.findFirst({
                    where: { name: project.name }
                });
            }

            if (repo) {
                // 1. Handle Deployments
                const prodTarget = project.targets?.production;

                if (prodTarget) {
                    // Prefer the alias (clean .vercel.app) over the unique deployment URL
                    let cleanUrl = prodTarget.url;
                    if (prodTarget.alias && prodTarget.alias.length > 0) {
                        // Find the one ending in .vercel.app
                        const vercelAlias = prodTarget.alias.find((a: string) => a.includes('.vercel.app'));
                        if (vercelAlias) cleanUrl = vercelAlias;
                        else cleanUrl = prodTarget.alias[0];
                    }

                    const url = `https://${cleanUrl}`;

                    const existing = await prisma.deployment.findFirst({
                        where: { repositoryId: repo.id, provider: 'vercel' }
                    });

                    if (existing) {
                        await prisma.deployment.update({
                            where: { id: existing.id },
                            data: {
                                url: url,
                                lastDeployedAt: new Date(prodTarget.createdAt || Date.now()),
                                status: prodTarget.readyState || 'READY'
                            }
                        });
                        console.log(`   ✅ Updated Vercel deployment for ${repo.name}: ${url}`);
                    } else {
                        await prisma.deployment.create({
                            data: {
                                repositoryId: repo.id,
                                provider: 'vercel',
                                url: url,
                                lastDeployedAt: new Date(prodTarget.createdAt || Date.now()),
                                status: prodTarget.readyState || 'READY'
                            }
                        });
                        console.log(`   ✅ Created Vercel deployment for ${repo.name}: ${url}`);
                    }
                }

                // 2. Fetch & Link Domains (The "Association" part)
                try {
                    const domainsRes = await fetch(`https://api.vercel.com/v9/projects/${project.id}/domains`, {
                        headers: {
                            'Authorization': `Bearer ${VERCEL_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (domainsRes.ok) {
                        const domainData = await domainsRes.json();
                        const domains = domainData.domains || [];

                        // Filter for custom domains (not .vercel.app, typically)
                        // Or just take the first verified one.
                        const customDomain = domains.find((d: any) => !d.name.endsWith('.vercel.app') && d.verified);

                        if (customDomain) {
                            const fullCustomUrl = `https://${customDomain.name}`;
                            if (repo.customUrl !== fullCustomUrl) {
                                await prisma.repository.update({
                                    where: { id: repo.id },
                                    data: { customUrl: fullCustomUrl }
                                });
                                console.log(`   🔗 Linked Custom Domain for ${repo.name}: ${fullCustomUrl}`);
                            } else {
                                console.log(`   (Domain ${fullCustomUrl} already linked)`);
                            }
                        }
                    }
                } catch (err: any) {
                    console.error(`   Failed to fetch domains for ${project.name}:`, err.message);
                }

            }
        }
    } catch (e: any) {
        console.error("Error syncing Vercel deployments:", e.message);
        process.exit(1);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
