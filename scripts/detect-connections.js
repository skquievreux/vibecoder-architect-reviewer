const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Connection Detection...\n");

    // 1. Clear existing connections
    await prisma.repoConnection.deleteMany();
    console.log("Cleared existing connections.\n");

    // 2. Get all repos with interfaces
    const repos = await prisma.repository.findMany({
        include: { interfaces: true }
    });

    console.log(`Analyzing ${repos.length} repositories...\n`);

    const connections = [];
    const resourceMap = {};

    // 3. Group repos by shared resources
    repos.forEach(repo => {
        repo.interfaces.forEach(iface => {
            let details = {};
            try {
                details = JSON.parse(iface.details || '{}');
            } catch (e) { }

            // Detect service name from various sources
            const service = details.service || details.framework || details.orm || iface.type;

            // Database connections
            if (iface.type === 'Database' || iface.type === 'database_connection') {
                const key = `DB:${service}`;
                if (!resourceMap[key]) resourceMap[key] = [];
                resourceMap[key].push(repo.id);
            }

            // Cloud services
            if (iface.type === 'Cloud Service' || iface.type === 'cloud_service') {
                const key = `CLOUD:${service}`;
                if (!resourceMap[key]) resourceMap[key] = [];
                resourceMap[key].push(repo.id);
            }

            // API connections
            if (iface.type === 'REST API' || iface.type === 'rest_api' ||
                iface.type === 'GraphQL API' || iface.type === 'graphql_api') {
                const key = `API:${service}`;
                if (!resourceMap[key]) resourceMap[key] = [];
                resourceMap[key].push(repo.id);
            }
        });
    });

    // 4. Create connections for shared resources
    for (const [resource, repoIds] of Object.entries(resourceMap)) {
        if (repoIds.length > 1) {
            console.log(`Found ${repoIds.length} repos sharing ${resource}`);

            // Determine connection type
            let connectionType = 'SHARED_INFRASTRUCTURE';
            if (resource.startsWith('DB:')) {
                connectionType = 'SHARED_DATABASE';
            } else if (resource.startsWith('API:')) {
                connectionType = 'SHARED_API';
            } else if (resource.startsWith('CLOUD:')) {
                connectionType = 'SHARED_CLOUD_SERVICE';
            }

            // Create all-to-all connections
            for (let i = 0; i < repoIds.length; i++) {
                for (let j = i + 1; j < repoIds.length; j++) {
                    connections.push({
                        sourceRepoId: repoIds[i],
                        targetRepoId: repoIds[j],
                        type: connectionType
                    });
                }
            }
        }
    }

    // 5. Deduplicate and insert
    if (connections.length > 0) {
        console.log(`\nCreating ${connections.length} connections...`);

        // Deduplicate
        const uniqueConnections = [];
        const seen = new Set();

        for (const conn of connections) {
            const key = [conn.sourceRepoId, conn.targetRepoId].sort().join('|');
            if (!seen.has(key)) {
                seen.add(key);
                uniqueConnections.push(conn);
            }
        }

        console.log(`After deduplication: ${uniqueConnections.length} unique connections`);

        // Insert in batches to avoid issues
        const batchSize = 10;
        for (let i = 0; i < uniqueConnections.length; i += batchSize) {
            const batch = uniqueConnections.slice(i, i + batchSize);
            try {
                await prisma.repoConnection.createMany({
                    data: batch,
                    skipDuplicates: true
                });
                console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(uniqueConnections.length / batchSize)}`);
            } catch (e) {
                console.error(`  Error in batch ${Math.floor(i / batchSize) + 1}:`, e.message);
                // Try individual inserts for this batch
                for (const conn of batch) {
                    try {
                        await prisma.repoConnection.create({ data: conn });
                    } catch (err) {
                        console.error(`    Failed to create connection:`, conn, err.message);
                    }
                }
            }
        }

        console.log("\n✅ Connections created successfully!");
    } else {
        console.log("\nNo connections to create.");
    }

    console.log("\n🎉 Connection Detection complete!");
}

main()
    .catch(e => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
