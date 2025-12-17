import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const repos = await prisma.repository.findMany({
            include: {
                deployments: true,
                technologies: true,
                businessCanvas: true,
            },
        });

        // Fetch Provider Metadata from DB
        const providerMetadata = await prisma.provider.findMany();

        const providerStats: Record<string, {
            name: string;
            category: 'hosting' | 'service' | 'infrastructure' | 'other';
            usageCount: number;
            totalEstimatedCost: number;
            repos: { id: string; name: string; cost?: number }[];
            // New fields
            capabilities?: string[];
            tags?: string[];
            description?: string;
        }> = {};

        const normalize = (s: string) => s.trim().toLowerCase();
        const getProviderEntry = (name: string, category: 'hosting' | 'service' | 'infrastructure' | 'other') => {
            const key = normalize(name);
            if (!providerStats[key]) {
                // Check DB Metadata
                const dbEntry = providerMetadata.find((p: any) =>
                    normalize(p.name) === key || normalize(p.slug) === key
                );

                let capabilities = [];
                let tags = [];
                try {
                    if (dbEntry?.capabilities) capabilities = JSON.parse(dbEntry.capabilities);
                    if (dbEntry?.tags) tags = JSON.parse(dbEntry.tags);
                } catch (e) {
                    console.error('Error parsing provider metadata JSON', e);
                }

                providerStats[key] = {
                    name: dbEntry ? dbEntry.name : name, // Use pretty name from DB if available
                    category: dbEntry ? (dbEntry.category as any) : category, // Prefer DB category
                    usageCount: 0,
                    totalEstimatedCost: 0,
                    repos: [],
                    // Merge DB data
                    capabilities: capabilities,
                    tags: tags,
                    description: dbEntry?.description || undefined
                };
            }
            return providerStats[key];
        };

        for (const repo of repos) {
            // 1. Hosting Providers from Deployments
            for (const dep of repo.deployments) {
                if (dep.provider) {
                    const entry = getProviderEntry(dep.provider, 'hosting');
                    // Avoid double counting same repo for same provider
                    if (!entry.repos.find(r => r.id === repo.id)) {
                        entry.usageCount++;
                        entry.repos.push({ id: repo.id, name: repo.name });
                    }
                }
            }

            // 2. Services from Business Canvas Costs
            if (repo.businessCanvas?.costStructure) {
                try {
                    const costs = JSON.parse(repo.businessCanvas.costStructure);
                    if (Array.isArray(costs)) {
                        for (const cost of costs) {
                            if (cost.service && cost.amount) {
                                const entry = getProviderEntry(cost.service, 'service');
                                // Check if we already counted this repo for this provider (unlikely for costs, but possible)
                                // For costs, we always add the cost.
                                if (!entry.repos.find(r => r.id === repo.id)) {
                                    entry.usageCount++;
                                    entry.repos.push({ id: repo.id, name: repo.name, cost: cost.amount });
                                } else {
                                    // Update existing repo entry with cost if needed
                                    const repoEntry = entry.repos.find(r => r.id === repo.id);
                                    if (repoEntry) repoEntry.cost = (repoEntry.cost || 0) + cost.amount;
                                }
                                entry.totalEstimatedCost += cost.amount;
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Failed to parse cost structure for repo ${repo.name}`, e);
                }
            }

            // 3. Infer Providers from Technologies (e.g. Supabase, Firebase)
            // This is a heuristic.
            const cloudTechs = ['supabase', 'firebase', 'aws', 'azure', 'google cloud', 'vercel', 'netlify', 'heroku', 'digitalocean'];
            for (const tech of repo.technologies) {
                const lowerName = normalize(tech.name);
                if (cloudTechs.some(ct => lowerName.includes(ct))) {
                    // Determine exact provider name
                    const providerName = cloudTechs.find(ct => lowerName.includes(ct)) || tech.name;
                    // We categorize these as 'infrastructure' or 'hosting' if not already caught
                    // But be careful not to double count if Deployment already caught it (e.g. Vercel)

                    // Simple check: if we already have a hosting entry for this repo with this name, skip
                    const key = normalize(providerName);
                    if (providerStats[key] && providerStats[key].repos.find(r => r.id === repo.id)) {
                        continue;
                    }

                    const entry = getProviderEntry(providerName.charAt(0).toUpperCase() + providerName.slice(1), 'infrastructure');
                    entry.usageCount++;
                    entry.repos.push({ id: repo.id, name: repo.name });
                }
            }
        }

        // Convert to array and sort by usage or cost
        const providers = Object.values(providerStats).sort((a, b) => b.totalEstimatedCost - a.totalEstimatedCost || b.usageCount - a.usageCount);

        return NextResponse.json(providers);
    } catch (error) {
        console.error('Error fetching provider stats:', error);
        return NextResponse.json({ error: 'Failed to fetch provider stats' }, { status: 500 });
    }
}
