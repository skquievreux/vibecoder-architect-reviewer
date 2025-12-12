const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Testing Connection Creation...\n");

    // Get two repos
    const repos = await prisma.repository.findMany({ take: 2 });

    if (repos.length < 2) {
        console.log("Not enough repos");
        return;
    }

    console.log(`Repo 1: ${repos[0].name} (${repos[0].id})`);
    console.log(`Repo 2: ${repos[1].name} (${repos[1].id})`);

    // Try to create a connection
    try {
        const conn = await prisma.repoConnection.create({
            data: {
                sourceRepoId: repos[0].id,
                targetRepoId: repos[1].id,
                type: 'TEST_CONNECTION'
            }
        });
        console.log("\n✅ Connection created successfully!");
        console.log(conn);

        // Clean up
        await prisma.repoConnection.delete({
            where: {
                sourceRepoId_targetRepoId: {
                    sourceRepoId: repos[0].id,
                    targetRepoId: repos[1].id
                }
            }
        });
        console.log("✅ Test connection deleted");
    } catch (e) {
        console.error("\n❌ Error creating connection:");
        console.error(e.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
