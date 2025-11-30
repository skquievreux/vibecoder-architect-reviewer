const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Connection Detection...");

    // 1. Clear existing connections (for clean slate)
    await prisma.repoConnection.deleteMany();
    console.log("Cleared existing connections.");

    // 2. Get all repos with interfaces
    const repos = await prisma.repository.findMany({
        include: { interfaces: true }
    });

    console.log(`Analyzing ${repos.length} repositories...`);

    const connections = [];

    // Strategy: Shared Resources
    // If Repo A and Repo B both connect to "Supabase", we link them?
    // Or better: If Repo A is a "Backend" and Repo B is a "Frontend" and they share a resource?
    // For now, let's just link them if they share a specific resource identifier (like a specific variable name or service details).

    // Group by Service/Resource
    const resourceMap = {};

    repos.forEach(repo => {
        repo.interfaces.forEach(iface => {
            // We need a unique key for the resource.
            // analyzer.py stores details as JSON string.
            let details = {};
            try {
                details = JSON.parse(iface.details || '{}');
            } catch (e) { }

            // Key candidates:
            // 1. Variable Name (e.g. NEXT_PUBLIC_SUPABASE_URL) - Weak, but okay if consistent
            // 2. Service Name (e.g. Supabase) - Too broad?

            // Let's use Service Name for clustering, but maybe not direct connection yet.
            // BUT, if we want to show "Repo A -> Supabase -> Repo B", we need to know they share it.

            // Let's create connections based on "Shared Infrastructure".
            // We won't create Repo->Repo connections directly unless we are sure.
            // Instead, we will create Repo->Repo connections if they share a DATABASE or API.

            if (iface.type === 'database_connection' && details.service === 'Supabase') {
                const key = 'Supabase'; // Broad clustering
                if (!resourceMap[key]) resourceMap[key] = [];
                resourceMap[key].push(repo.id);
            }
        });
    });

    // Create connections for shared resources
    // If >1 repo shares a resource, they are "connected" in the ecosystem.
    // We will create a "SHARED_DB" connection between them.
    // To avoid N^2 connections, we might just want to visualize them connected to a central node in the frontend.
    // But the user asked for "Project Interconnection Graph".

    // Let's look for explicit "fetch" calls if we had them. We don't have target URLs.

    // Fallback: Create connections based on Naming Convention matching?
    // e.g. "playlist_generator" (Frontend) might call "playlist-api" (Backend)?
    // We don't have such clear pairs.

    // Let's stick to the "Shared Resource" logic for now, but store it as Repo->Repo "SHARED_INFRA".
    // This shows they are part of the same system.

    for (const [resource, repoIds] of Object.entries(resourceMap)) {
        if (repoIds.length > 1) {
            console.log(`Found ${repoIds.length} repos sharing ${resource}`);
            // Connect all to the first one? Or all-to-all?
            // All-to-all is messy.
            // Let's just log them for now.

            // Actually, for the Graph View, we want to see the Service Node.
            // So we don't strictly need RepoConnection records for Shared Resources if we handle it in the UI.
            // BUT, the user wants "Dependencies".

            // Let's try to find "Frontend -> Backend" pattern.
            // If Repo A has "Next.js" (Frontend) and Repo B has "Node.js" + "Supabase" (Backend)
            // And they both use Supabase...
            // It's likely A calls B or A calls Supabase directly.

            // Let's create a "SHARED_DB" connection between all repos that use Supabase.
            // This is a valid dependency: they depend on the same data.
            for (let i = 0; i < repoIds.length; i++) {
                for (let j = i + 1; j < repoIds.length; j++) {
                    connections.push({
                        sourceRepoId: repoIds[i],
                        targetRepoId: repoIds[j],
                        type: 'SHARED_DATABASE'
                    });
                }
            }
        }
    }

    // Batch insert
    if (connections.length > 0) {
        console.log(`Creating ${connections.length} connections...`);
        await prisma.repoConnection.createMany({
            data: connections
        });
    }

    console.log("🎉 Connection Detection complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
