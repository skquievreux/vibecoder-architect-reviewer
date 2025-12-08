const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Cleaning up noisy connections...");

    // Delete all connections of type SHARED_DATABASE
    const { count } = await prisma.repoConnection.deleteMany({
        where: {
            type: 'SHARED_DATABASE'
        }
    });

    console.log(`Deleted ${count} noisy connections.`);
    console.log("The graph will now rely on Service Nodes (Hub & Spoke) for visualization.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
