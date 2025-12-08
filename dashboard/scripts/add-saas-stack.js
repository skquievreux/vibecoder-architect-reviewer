const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const repoName = "Global SaaS Stack";
    const owner = "manual";
    const slug = `${owner}/${repoName}`;

    console.log(`Creating virtual repository: ${repoName}...`);

    // 1. Create or Update the Virtual Repository
    const repo = await prisma.repository.upsert({
        where: {
            // We don't have a githubId, so we can't use it for upsert if it's null.
            // But we can try to find by name/owner if we had a unique constraint there.
            // Prisma `upsert` requires a unique field. `githubId` is unique but nullable.
            // Let's use a dummy githubId for this special repo to allow upsert, 
            // or just findFirst and then update/create.
            githubId: "manual-saas-stack"
        },
        update: {},
        create: {
            githubId: "manual-saas-stack",
            name: repoName,
            fullName: slug,
            nameWithOwner: slug,
            url: "https://vibecoder.dev/saas-stack",
            description: "Central registry for global SaaS subscriptions and AI tools.",
            isPrivate: true,
        }
    });

    console.log(`Repo ID: ${repo.id}`);

    // 2. Define the SaaS Tools
    const saasTools = [
        { service: "Suno AI", amount: 20, category: "AI Music" },
        { service: "FAL-AI", amount: 0, category: "AI Video/Image" },
        { service: "Replicate", amount: 0, category: "AI Inference" },
        { service: "Eleven Labs", amount: 22, category: "AI Voice" },
        { service: "Hetzner", amount: 50, category: "Infrastructure" },
        { service: "Sendfox", amount: 0, category: "Marketing" },
        { service: "Minvo", amount: 0, category: "Video Editing" },
        { service: "Canva", amount: 15, category: "Design" },
        { service: "Harpa.ai", amount: 0, category: "AI Assistant" },
        { service: "Claude (Anthropic)", amount: 20, category: "AI Model" },
        { service: "OpenAI", amount: 20, category: "AI Model" },
        { service: "OpenRouter", amount: 0, category: "AI Gateway" },
    ];

    // 3. Create/Update Business Canvas
    const costStructure = JSON.stringify(saasTools);

    // Also add them as "Key Resources" in Value Proposition for context
    const valueProp = JSON.stringify([
        "Centralized AI Tooling",
        "High-Performance Inference",
        "Creative Suite (Audio/Video/Design)"
    ]);

    await prisma.businessCanvas.upsert({
        where: { repositoryId: repo.id },
        update: {
            costStructure,
            valueProposition: valueProp
        },
        create: {
            repositoryId: repo.id,
            costStructure,
            valueProposition: valueProp,
            customerSegments: "[]",
            revenueStreams: "[]"
        }
    });

    console.log("SaaS tools successfully added to Business Canvas!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
