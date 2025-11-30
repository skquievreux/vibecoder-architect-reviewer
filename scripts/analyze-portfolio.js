const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Analyzing Portfolio Capabilities...");

    // 1. Get all unique technologies and their counts
    const technologies = await prisma.technology.groupBy({
        by: ['name', 'category'],
        _count: {
            name: true
        },
        orderBy: {
            _count: {
                name: 'desc'
            }
        }
    });

    console.log("\n--- Technologies Found ---");
    console.table(technologies.map(t => ({
        Name: t.name,
        Category: t.category || 'Uncategorized',
        Count: t._count.name
    })));

    // 2. Get all interfaces
    const interfaces = await prisma.interface.findMany({
        include: {
            repository: {
                select: { name: true }
            }
        }
    });

    console.log("\n--- Interfaces Found ---");
    // Group by type
    const interfaceSummary = {};
    interfaces.forEach(i => {
        const key = `${i.type} (${i.direction || 'unknown'})`;
        if (!interfaceSummary[key]) interfaceSummary[key] = [];
        interfaceSummary[key].push(i.repository.name);
    });

    console.table(Object.entries(interfaceSummary).map(([type, repos]) => ({
        Type: type,
        Count: repos.length,
        Examples: repos.slice(0, 3).join(', ')
    })));

    // 3. Search for specific "Capabilities" based on keywords
    const keywords = {
        'Image Generation': ['openai', 'dall-e', 'stable-diffusion', 'midjourney', 'image', 'canvas'],
        'Sound/Audio': ['tone', 'audio', 'sound', 'music', 'spotify', 'mp3'],
        'Web Development': ['react', 'next', 'vue', 'html', 'css', 'tailwind'],
        'Database': ['prisma', 'sql', 'postgres', 'mongo', 'supabase']
    };

    console.log("\n--- Potential Capabilities Mapping ---");
    for (const [capability, terms] of Object.entries(keywords)) {
        const matches = technologies.filter(t =>
            terms.some(term => t.name.toLowerCase().includes(term))
        );
        if (matches.length > 0) {
            console.log(`\n${capability}:`);
            matches.forEach(m => console.log(`  - ${m.name} (${m._count.name} repos)`));
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
