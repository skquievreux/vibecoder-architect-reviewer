const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyArchitectureData() {
    console.log('🔍 Verifying Architecture Report Data...\n');

    // 1. Repository Count
    const repoCount = await prisma.repository.count();
    console.log(`📦 Repositories in DB: ${repoCount}`);

    // 2. Deployment Count
    const deploymentCount = await prisma.deployment.count();
    console.log(`🚀 Deployments in DB: ${deploymentCount}`);

    // 3. Interface Count
    const interfaceCount = await prisma.interface.count();
    console.log(`🔌 Interfaces in DB: ${interfaceCount}`);

    // 4. Technology Stack Distribution
    const techStats = await prisma.technology.groupBy({
        by: ['name'],
        _count: true,
        orderBy: {
            _count: {
                name: 'desc'
            }
        },
        take: 15
    });

    console.log('\n📊 Top 15 Technologies:');
    console.table(techStats.map(t => ({
        Technology: t.name,
        Count: t._count
    })));

    // 5. Next.js Version Distribution
    const nextJsVersions = await prisma.technology.groupBy({
        by: ['version'],
        where: {
            name: {
                in: ['Next.js', 'next', 'NextJS']
            }
        },
        _count: true
    });

    console.log('\n📦 Next.js Version Distribution:');
    console.table(nextJsVersions.map(v => ({
        Version: v.version || 'N/A',
        Count: v._count
    })));

    // 6. React Version Distribution
    const reactVersions = await prisma.technology.groupBy({
        by: ['version'],
        where: {
            name: {
                in: ['React', 'react']
            }
        },
        _count: true
    });

    console.log('\n⚛️ React Version Distribution:');
    console.table(reactVersions.map(v => ({
        Version: v.version || 'N/A',
        Count: v._count
    })));

    await prisma.$disconnect();
}

verifyArchitectureData().catch(console.error);
