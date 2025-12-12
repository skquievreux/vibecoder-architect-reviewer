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

            // Check capability map
            if (CAPABILITY_MAP[lowerTech]) {
                capabilities.push({
                    ...CAPABILITY_MAP[lowerTech],
                    source: `package:${lowerTech}`
                });
            }
            // Language-based capabilities
            else if (lowerTech === 'python') {
                capabilities.push({ name: 'SCRIPTING', category: 'DEV', source: 'language:Python' });
            }
            else if (lowerTech === 'javascript' || lowerTech === 'typescript') {
                capabilities.push({ name: 'WEB_DEVELOPMENT', category: 'WEB', source: `language:${tech.name}` });
            }
            else if (lowerTech === 'html' || lowerTech === 'css') {
                capabilities.push({ name: 'FRONTEND', category: 'WEB', source: `language:${tech.name}` });
            }
            else if (lowerTech === 'ruby') {
                capabilities.push({ name: 'WEB_FRAMEWORK', category: 'WEB', source: 'language:Ruby' });
            }
            else if (lowerTech === 'node.js') {
                capabilities.push({ name: 'BACKEND', category: 'INFRA', source: 'runtime:Node.js' });
            }
            else if (lowerTech === 'express') {
                capabilities.push({ name: 'API_SERVER', category: 'INFRA', source: 'framework:Express' });
            }
            else if (lowerTech === 'dockerfile' || lowerTech === 'docker') {
                capabilities.push({ name: 'CONTAINERIZATION', category: 'INFRA', source: 'tool:Docker' });
            }
            else if (lowerTech === 'shell' || lowerTech === 'powershell' || lowerTech === 'batchfile') {
                capabilities.push({ name: 'AUTOMATION', category: 'DEV', source: `tool:${tech.name}` });
            }
            else if (lowerTech.includes('openai')) {
                capabilities.push({ name: 'AI_INTEGRATION', category: 'AI', source: `package:${tech.name}` });
            }
        }

        // If no capabilities found but has technologies, assign generic capability
        if (capabilities.length === 0 && repo.technologies.length > 0) {
            const primaryLang = repo.technologies[0].name;
            if (primaryLang.toLowerCase().includes('html') || primaryLang.toLowerCase().includes('javascript')) {
                capabilities.push({ name: 'WEB_APPLICATION', category: 'WEB', source: 'inferred' });
            } else {
                capabilities.push({ name: 'SOFTWARE_PROJECT', category: 'DEV', source: 'inferred' });
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
