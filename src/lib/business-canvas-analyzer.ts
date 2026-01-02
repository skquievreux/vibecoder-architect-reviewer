import { Repository, Technology, Capability } from '@prisma/client';

// 1. Value Proposition Detection
export function detectValueProp(repo: Repository & { description?: string | null }): string {
    const readme = repo.description || '';

    const patterns: Record<string, string[]> = {
        'AI Video Generation': ['video', 'generation', 'ai', 'visual', 'story'],
        'Audio Transcription': ['transcription', 'speech-to-text', 'audio', 'voice'],
        'Image Processing': ['image', 'processing', 'manipulation', 'photo'],
        'Data Analytics': ['analytics', 'dashboard', 'visualization', 'data'],
        'Developer Tooling': ['cli', 'sdk', 'library', 'framework', 'tool'],
        'E-Commerce': ['shop', 'store', 'cart', 'payment', 'checkout'],
        'Content Management': ['cms', 'blog', 'content', 'publish'],
    };

    for (const [value, keywords] of Object.entries(patterns)) {
        if (keywords.every(k => readme.toLowerCase().includes(k))) {
            return value;
        }
    }

    return 'Unknown Value Proposition';
}

// 2. Customer Segment Inference
export function detectCustomerSegments(capabilities: Capability[]): string[] {
    const segments: Set<string> = new Set();

    const capNames = capabilities.map(c => c.name.toUpperCase());

    if (capNames.some(c => c.includes('AUDIO') || c.includes('MUSIC'))) {
        segments.add('Musicians');
        segments.add('Podcasters');
    }
    if (capNames.some(c => c.includes('VIDEO') || c.includes('IMAGE'))) {
        segments.add('Content Creators');
        segments.add('Video Editors');
    }
    if (capNames.some(c => c.includes('AI') || c.includes('ML'))) {
        segments.add('Tech Innovators');
        segments.add('Early Adopters');
    }
    if (capNames.some(c => c.includes('API') || c.includes('SDK'))) {
        segments.add('Developers');
    }
    if (capNames.some(c => c.includes('DASHBOARD') || c.includes('ANALYTICS'))) {
        segments.add('Business Managers');
    }

    // Broader Fallbacks
    if (segments.size === 0) {
        if (capNames.some(c => c.includes('WEB') || c.includes('UI') || c.includes('SSR'))) {
            segments.add('End Users');
        }
        if (capNames.some(c => c.includes('INFRA') || c.includes('BACKEND') || c.includes('DB'))) {
            segments.add('Startups');
            segments.add('Developers');
        }
    }

    return Array.from(segments);
}

// 3. Revenue Stream Detection
export function detectRevenue(technologies: Technology[]): {
    hasPayment: boolean;
    suggestedModel: string;
    estimatedARR: number;
    monetizationPotential: 'HIGH' | 'MEDIUM' | 'LOW';
} {
    const hasStripe = technologies.some(t => t.name.toLowerCase().includes('stripe'));
    const hasLemonSqueezy = technologies.some(t => t.name.toLowerCase().includes('lemon'));

    if (hasStripe || hasLemonSqueezy) {
        return {
            hasPayment: true,
            suggestedModel: 'Existing Subscription',
            estimatedARR: 5000, // Placeholder for existing revenue
            monetizationPotential: 'HIGH'
        };
    }

    // Heuristics for potential
    const isSaaS = technologies.some(t => ['next.js', 'react', 'supabase'].includes(t.name.toLowerCase()));
    const isInternal = technologies.some(t => ['internal', 'tool'].includes(t.name.toLowerCase())); // Mock check

    if (isSaaS && !isInternal) {
        return {
            hasPayment: false,
            suggestedModel: 'Subscription ($29/mo)',
            estimatedARR: 12000, // Projected
            monetizationPotential: 'MEDIUM'
        };
    }

    return {
        hasPayment: false,
        suggestedModel: 'Open Source / Free',
        estimatedARR: 0,
        monetizationPotential: 'LOW'
    };
}

// 4. Cost Structure Estimation
const COST_MAP: Record<string, number> = {
    'supabase': 25,
    'vercel': 20,
    'openai': 50,
    'replicate': 50,
    'aws-sdk': 30,
    'planetscale': 29,
    'upstash': 10,
    'clerk': 25
};

export function estimateCosts(technologies: Technology[]): number {
    return technologies.reduce((sum, tech) => {
        const cost = COST_MAP[tech.name.toLowerCase()] || 0;
        return sum + cost;
    }, 0);
}
