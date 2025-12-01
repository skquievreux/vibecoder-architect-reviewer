const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PROVIDERS = [
    {
        id: 'vercel',
        name: 'Vercel',
        description: 'Frontend Cloud for Next.js and React.',
        capabilities: ['Serverless Functions', 'Edge Middleware', 'Global CDN', 'Preview Deployments'],
        tags: ['hosting', 'serverless'],
        website: 'https://vercel.com',
        category: 'hosting'
    },
    {
        id: 'fly',
        name: 'Fly.io',
        description: 'Run full stack apps (Docker) close to your users.',
        capabilities: ['Docker Runtime', 'Global Anycast', 'Persistent Volumes', 'Internal Private Network'],
        tags: ['hosting', 'docker'],
        website: 'https://fly.io',
        category: 'hosting'
    },
    {
        id: 'hetzner',
        name: 'Hetzner',
        description: 'High-performance dedicated servers and cloud hosting.',
        capabilities: ['Dedicated Servers', 'Cloud VPS', 'Load Balancers', 'Managed Kubernetes'],
        tags: ['hosting', 'docker', 'storage'],
        website: 'https://hetzner.com',
        category: 'hosting'
    },
    {
        id: 'supabase',
        name: 'Supabase',
        description: 'Open Source Firebase alternative.',
        capabilities: ['PostgreSQL Database', 'Authentication', 'Realtime Subscriptions', 'Storage', 'Edge Functions'],
        tags: ['database', 'auth', 'storage', 'serverless'],
        website: 'https://supabase.com',
        category: 'service'
    },
    {
        id: 'aws',
        name: 'AWS',
        description: 'Comprehensive cloud computing platform.',
        capabilities: ['S3 Storage', 'EC2 Compute', 'Lambda Serverless', 'RDS Databases'],
        tags: ['hosting', 'storage', 'database', 'serverless', 'ai'],
        website: 'https://aws.amazon.com',
        category: 'infrastructure'
    },
    {
        id: 'openai',
        name: 'OpenAI',
        description: 'AI research and deployment company.',
        capabilities: ['GPT-4 Model', 'Embeddings', 'DALL-E Image Gen', 'Whisper Audio'],
        tags: ['ai'],
        website: 'https://openai.com',
        category: 'service'
    },
    {
        id: 'suno',
        name: 'Suno AI',
        description: 'Generative AI for music and audio.',
        capabilities: ['Music Generation', 'Lyrics Generation', 'Vocal Synthesis'],
        tags: ['ai'],
        website: 'https://suno.ai',
        category: 'service'
    },
    {
        id: 'elevenlabs',
        name: 'Eleven Labs',
        description: 'AI Voice Generator and Text to Speech.',
        capabilities: ['Voice Synthesis', 'Voice Cloning', 'Dubbing'],
        tags: ['ai'],
        website: 'https://elevenlabs.io',
        category: 'service'
    },
    {
        id: 'fal',
        name: 'FAL-AI',
        description: 'Fast AI inference cloud.',
        capabilities: ['Stable Diffusion', 'Video Generation', 'LoRA Training'],
        tags: ['ai', 'gpu'],
        website: 'https://fal.ai',
        category: 'service'
    },
    {
        id: 'replicate',
        name: 'Replicate',
        description: 'Run open-source machine learning models with a cloud API.',
        capabilities: ['Image Generation', 'LLM Hosting', 'Video Generation'],
        tags: ['ai', 'gpu'],
        website: 'https://replicate.com',
        category: 'service'
    }
];

async function main() {
    console.log('Seeding providers...');
    for (const p of PROVIDERS) {
        await prisma.provider.upsert({
            where: { slug: p.id },
            update: {
                name: p.name,
                description: p.description,
                website: p.website,
                category: p.category,
                tags: JSON.stringify(p.tags),
                capabilities: JSON.stringify(p.capabilities),
            },
            create: {
                slug: p.id,
                name: p.name,
                description: p.description,
                website: p.website,
                category: p.category,
                tags: JSON.stringify(p.tags),
                capabilities: JSON.stringify(p.capabilities),
            }
        });
    }
    console.log('Providers seeded successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
