const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const capabilities = await prisma.capability.findMany({
        include: {
            repository: {
                select: {
                    name: true
                }
            }
        }
    });

    console.log(`Total Capabilities: ${capabilities.length}\n`);

    // Group by category
    const byCategory = {};
    capabilities.forEach(cap => {
        if (!byCategory[cap.category]) {
            byCategory[cap.category] = [];
        }
        byCategory[cap.category].push(cap.repository.name);
    });

    console.log('Capabilities by Category:\n');
    Object.entries(byCategory).forEach(([category, repos]) => {
        console.log(`${category}: ${repos.length} repos`);
        console.log(`  ${repos.slice(0, 5).join(', ')}${repos.length > 5 ? '...' : ''}\n`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
