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
        developerUrl: 'https://vercel.com/dashboard',
        docsUrl: 'https://vercel.com/docs',
        billingUrl: 'https://vercel.com/dashboard/billing',
        category: 'hosting'
    },
    {
        id: 'fly',
        name: 'Fly.io',
        description: 'Run full stack apps (Docker) close to your users.',
        capabilities: ['Docker Runtime', 'Global Anycast', 'Persistent Volumes', 'Internal Private Network'],
        tags: ['hosting', 'docker'],
        website: 'https://fly.io',
        developerUrl: 'https://fly.io/dashboard',
        docsUrl: 'https://fly.io/docs',
        billingUrl: 'https://fly.io/dashboard/billing',
        category: 'hosting'
    },
    {
        id: 'hetzner',
        name: 'Hetzner',
        description: 'High-performance dedicated servers and cloud hosting.',
        capabilities: ['Dedicated Servers', 'Cloud VPS', 'Load Balancers', 'Managed Kubernetes'],
        tags: ['hosting', 'docker', 'storage'],
        website: 'https://hetzner.com',
        developerUrl: 'https://console.hetzner.cloud',
        docsUrl: 'https://docs.hetzner.com',
        billingUrl: 'https://accounts.hetzner.com/invoice',
        category: 'hosting'
    },
    {
        id: 'supabase',
        name: 'Supabase',
        description: 'Open Source Firebase alternative.',
        capabilities: ['PostgreSQL Database', 'Authentication', 'Realtime Subscriptions', 'Storage', 'Edge Functions'],
        tags: ['database', 'auth', 'storage', 'serverless'],
        website: 'https://supabase.com',
        developerUrl: 'https://supabase.com/dashboard',
        docsUrl: 'https://supabase.com/docs',
        billingUrl: 'https://supabase.com/dashboard/org/_/billing',
        category: 'service'
    },
    {
        id: 'aws',
        name: 'AWS',
        description: 'Comprehensive cloud computing platform.',
        capabilities: ['S3 Storage', 'EC2 Compute', 'Lambda Serverless', 'RDS Databases'],
        tags: ['hosting', 'storage', 'database', 'serverless', 'ai'],
        website: 'https://aws.amazon.com',
        developerUrl: 'https://console.aws.amazon.com',
        docsUrl: 'https://docs.aws.amazon.com',
        billingUrl: 'https://console.aws.amazon.com/billing',
        category: 'infrastructure'
    },
    {
        id: 'openai',
        name: 'OpenAI',
        description: 'AI research and deployment company.',
        capabilities: ['GPT-4 Model', 'Embeddings', 'DALL-E Image Gen', 'Whisper Audio'],
        tags: ['ai'],
        website: 'https://openai.com',
        developerUrl: 'https://platform.openai.com',
        docsUrl: 'https://platform.openai.com/docs',
        billingUrl: 'https://platform.openai.com/account/billing',
        category: 'service'
    },
    {
        id: 'suno',
        name: 'Suno AI',
        description: 'Generative AI for music and audio.',
        capabilities: ['Music Generation', 'Lyrics Generation', 'Vocal Synthesis'],
        tags: ['ai'],
        website: 'https://suno.ai',
        developerUrl: 'https://suno.com/create',
        docsUrl: 'https://suno-ai.notion.site/Wiki-5e92e52e92c2492997b418b7f739e86b',
        billingUrl: 'https://suno.com/account',
        category: 'service'
    },
    {
        id: 'elevenlabs',
        name: 'Eleven Labs',
        description: 'AI Voice Generator and Text to Speech.',
        capabilities: ['Voice Synthesis', 'Voice Cloning', 'Dubbing'],
        tags: ['ai'],
        website: 'https://elevenlabs.io',
        developerUrl: 'https://elevenlabs.io/app',
        docsUrl: 'https://elevenlabs.io/docs',
        billingUrl: 'https://elevenlabs.io/app/subscription',
        category: 'service'
    },
    {
        id: 'fal',
        name: 'FAL-AI',
        description: 'Fast AI inference cloud.',
        capabilities: ['Stable Diffusion', 'Video Generation', 'LoRA Training'],
        tags: ['ai', 'gpu'],
        website: 'https://fal.ai',
        developerUrl: 'https://fal.ai/dashboard',
        docsUrl: 'https://fal.ai/docs',
        billingUrl: 'https://fal.ai/dashboard/billing',
        category: 'service'
    },
    {
        id: 'replicate',
        name: 'Replicate',
        description: 'Run open-source machine learning models with a cloud API.',
        capabilities: ['Image Generation', 'LLM Hosting', 'Video Generation'],
        tags: ['ai', 'gpu'],
        website: 'https://replicate.com',
        developerUrl: 'https://replicate.com/dashboard',
        docsUrl: 'https://replicate.com/docs',
        billingUrl: 'https://replicate.com/account/billing',
        category: 'service'
    },
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'Financial infrastructure platform for the internet.',
        capabilities: ['Payments', 'Billing', 'Invoicing', 'Connect'],
        tags: ['payment', 'fintech'],
        website: 'https://stripe.com',
        developerUrl: 'https://dashboard.stripe.com',
        docsUrl: 'https://stripe.com/docs',
        billingUrl: 'https://dashboard.stripe.com/settings/billing',
        category: 'service'
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        description: 'Unified interface for LLMs.',
        capabilities: ['Model Aggregation', 'Unified API', 'Cost Comparison'],
        tags: ['ai', 'llm'],
        website: 'https://openrouter.ai',
        developerUrl: 'https://openrouter.ai/activity',
        docsUrl: 'https://openrouter.ai/docs',
        billingUrl: 'https://openrouter.ai/credits',
        category: 'service'
    },
    {
        id: 'perplexity',
        name: 'Perplexity',
        description: 'AI-powered answer engine and API.',
        capabilities: ['Online Search', 'LLM Inference', 'Sonar Models'],
        tags: ['ai', 'search'],
        website: 'https://perplexity.ai',
        developerUrl: 'https://www.perplexity.ai/settings/api',
        docsUrl: 'https://docs.perplexity.ai',
        billingUrl: 'https://www.perplexity.ai/settings/subscription',
        category: 'service'
    },
    {
        id: 'lovable',
        name: 'Lovable',
        description: 'AI-powered full-stack application builder.',
        capabilities: ['No-Code/Low-Code', 'React Generation', 'Supabase Integration'],
        tags: ['ai', 'tool', 'nocode'],
        website: 'https://lovable.dev',
        developerUrl: 'https://lovable.dev/projects',
        docsUrl: 'https://docs.lovable.dev',
        billingUrl: 'https://lovable.dev/settings/billing',
        category: 'tool'
    },
    {
        id: 'lemon-squeezy',
        name: 'Lemon Squeezy',
        description: 'Payments, tax, and subscriptions for software companies.',
        capabilities: ['Merchant of Record', 'Subscriptions', 'Global Tax'],
        tags: ['payment', 'fintech'],
        website: 'https://lemonsqueezy.com',
        developerUrl: 'https://app.lemonsqueezy.com/products',
        docsUrl: 'https://docs.lemonsqueezy.com',
        billingUrl: 'https://app.lemonsqueezy.com/billing',
        category: 'service'
    },
    {
        id: 'cloudflare',
        name: 'Cloudflare',
        description: 'Web performance and security company.',
        capabilities: ['CDN', 'DDoS Protection', 'Workers', 'R2 Storage'],
        tags: ['infrastructure', 'cdn', 'serverless'],
        website: 'https://cloudflare.com',
        developerUrl: 'https://dash.cloudflare.com',
        docsUrl: 'https://developers.cloudflare.com',
        billingUrl: 'https://dash.cloudflare.com/billing',
        category: 'infrastructure'
    },
    // New Providers Added via Concept
    {
        id: 'sentry',
        name: 'Sentry',
        description: 'Application monitoring and error tracking software.',
        capabilities: ['Error Tracking', 'Performance Monitoring', 'Session Replay'],
        tags: ['observability', 'monitoring'],
        website: 'https://sentry.io',
        developerUrl: 'https://sentry.io/organizations/vibecoder/issues/',
        docsUrl: 'https://docs.sentry.io',
        billingUrl: 'https://sentry.io/settings/billing',
        category: 'tool'
    },
    {
        id: 'posthog',
        name: 'PostHog',
        description: 'Open source product analytics.',
        capabilities: ['Product Analytics', 'Session Recording', 'Feature Flags', 'A/B Testing'],
        tags: ['analytics', 'tool'],
        website: 'https://posthog.com',
        developerUrl: 'https://us.posthog.com/project/settings',
        docsUrl: 'https://posthog.com/docs',
        billingUrl: 'https://us.posthog.com/organization/billing',
        category: 'tool'
    },
    {
        id: 'clerk',
        name: 'Clerk',
        description: 'Complete user management and authentication.',
        capabilities: ['Authentication', 'User Management', 'Multi-Session'],
        tags: ['auth', 'service'],
        website: 'https://clerk.com',
        developerUrl: 'https://dashboard.clerk.com',
        docsUrl: 'https://clerk.com/docs',
        billingUrl: 'https://dashboard.clerk.com',
        category: 'service'
    },
    {
        id: 'resend',
        name: 'Resend',
        description: 'Email for developers.',
        capabilities: ['Transactional Email', 'Email API', 'React Email'],
        tags: ['email', 'service'],
        website: 'https://resend.com',
        developerUrl: 'https://resend.com/overview',
        docsUrl: 'https://resend.com/docs',
        billingUrl: 'https://resend.com/settings/billing',
        category: 'service'
    },
    {
        id: 'sanity',
        name: 'Sanity',
        description: 'Structured content platform.',
        capabilities: ['Headless CMS', 'Realtime Content', 'Visual Editing'],
        tags: ['cms', 'content'],
        website: 'https://sanity.io',
        developerUrl: 'https://sanity.io/manage',
        docsUrl: 'https://www.sanity.io/docs',
        billingUrl: 'https://sanity.io/manage',
        category: 'service'
    },
    {
        id: 'pinecone',
        name: 'Pinecone',
        description: 'Long-term memory for AI.',
        capabilities: ['Vector Database', 'Semantic Search', 'AI Memory'],
        tags: ['database', 'ai', 'vector'],
        website: 'https://pinecone.io',
        developerUrl: 'https://app.pinecone.io',
        docsUrl: 'https://docs.pinecone.io',
        billingUrl: 'https://app.pinecone.io',
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
                developerUrl: p.developerUrl,
                docsUrl: p.docsUrl,
                billingUrl: p.billingUrl,
                category: p.category,
                tags: JSON.stringify(p.tags),
                capabilities: JSON.stringify(p.capabilities),
            },
            create: {
                slug: p.id,
                name: p.name,
                description: p.description,
                website: p.website,
                developerUrl: p.developerUrl,
                docsUrl: p.docsUrl,
                billingUrl: p.billingUrl,
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
