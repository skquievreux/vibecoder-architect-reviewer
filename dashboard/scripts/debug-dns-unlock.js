const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Searching for 'Unlock Your Song'...");

    const repos = await prisma.repository.findMany({
        where: {
            OR: [
                { name: { contains: 'Unlock' } },
                { name: { contains: 'Song' } },
                { description: { contains: 'Unlock' } },
                { description: { contains: 'Song' } }
            ]
        },
        include: { deployments: true }
    });

    if (repos.length === 0) {
        console.log("❌ No matching repo found.");
        return;
    }

    for (const repo of repos) {
        console.log(`\nFound Repo: ${repo.name} (ID: ${repo.id})`);
        console.log(`Deployments: ${repo.deployments.length}`);

        if (repo.deployments.length > 0) {
            const deployment = repo.deployments[0];
            console.log(`- URL: ${deployment.url}`);

            // Simulate the frontend logic
            const target = deployment.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
            console.log(`- Target for DNS check: ${target}`);

            // We can't easily call the API route logic here without mocking, 
            // but we can see if the target looks correct.
        } else {
            console.log("- No deployments found.");
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
