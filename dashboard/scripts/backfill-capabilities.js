const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Inline the logic since we can't import TS in JS script easily without build step
const CAPABILITY_MAP = {
    'openai': { name: 'AI_TEXT_GEN', category: 'AI' },
    'langchain': { name: 'AI_ORCHESTRATION', category: 'AI' },
    'replicate': { name: 'AI_IMAGE_GEN', category: 'AI' },
    'ffmpeg': { name: 'VIDEO_PROCESSING', category: 'MEDIA' },
    'fluent-ffmpeg': { name: 'VIDEO_PROCESSING', category: 'MEDIA' },
    'sharp': { name: 'IMAGE_PROCESSING', category: 'MEDIA' },
    'canvas': { name: 'IMAGE_MANIPULATION', category: 'MEDIA' },
    'tone': { name: 'AUDIO_SYNTHESIS', category: 'MEDIA' },
    'three': { name: '3D_RENDERING', category: 'MEDIA' },
    'react-three-fiber': { name: '3D_RENDERING', category: 'MEDIA' },
    'supabase': { name: 'BACKEND_AS_A_SERVICE', category: 'INFRA' },
    'stripe': { name: 'PAYMENT_PROCESSING', category: 'BUSINESS' },
    'resend': { name: 'EMAIL_SENDING', category: 'INFRA' },
    'next': { name: 'SSR_FRAMEWORK', category: 'WEB' },
    'react': { name: 'UI_LIBRARY', category: 'WEB' },
    'tailwindcss': { name: 'STYLING', category: 'WEB' },
};

async function main() {
    console.log("🚀 Starting Capability Backfill...");

    const repos = await prisma.repository.findMany({
        include: { technologies: true }
    });

    console.log(`Found ${repos.length} repositories.`);

    for (const repo of repos) {
        const capabilities = [];

        for (const tech of repo.technologies) {
            const lowerTech = tech.name.toLowerCase();
            if (CAPABILITY_MAP[lowerTech]) {
                capabilities.push({
                    ...CAPABILITY_MAP[lowerTech],
                    source: `package:${lowerTech}`
                });
            } else if (lowerTech.includes('openai')) {
                capabilities.push({ name: 'AI_INTEGRATION', category: 'AI', source: `package:${tech.name}` });
            }
        }

        // Deduplicate
        const uniqueCaps = capabilities.filter((cap, index, self) =>
            index === self.findIndex((t) => t.name === cap.name)
        );

        if (uniqueCaps.length > 0) {
            console.log(`Repo: ${repo.name} -> ${uniqueCaps.map(c => c.name).join(', ')}`);

            // Delete existing to avoid dupes on re-run
            await prisma.capability.deleteMany({ where: { repositoryId: repo.id } });

            await prisma.capability.createMany({
                data: uniqueCaps.map(c => ({
                    repositoryId: repo.id,
                    name: c.name,
                    category: c.category,
                    source: c.source,
                    confidence: 1.0
                }))
            });
        }
    }

    console.log("🎉 Backfill complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
