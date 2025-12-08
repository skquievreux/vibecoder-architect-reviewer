export const CAPABILITY_MAP: Record<string, { name: string; category: string }> = {
    // AI & ML
    'openai': { name: 'AI_TEXT_GEN', category: 'AI' },
    'langchain': { name: 'AI_ORCHESTRATION', category: 'AI' },
    'huggingface': { name: 'AI_MODEL_HOSTING', category: 'AI' },
    'replicate': { name: 'AI_IMAGE_GEN', category: 'AI' },
    'tensorflow': { name: 'ML_TRAINING', category: 'AI' },
    'pytorch': { name: 'ML_TRAINING', category: 'AI' },

    // Media
    'ffmpeg': { name: 'VIDEO_PROCESSING', category: 'MEDIA' },
    'fluent-ffmpeg': { name: 'VIDEO_PROCESSING', category: 'MEDIA' },
    'sharp': { name: 'IMAGE_PROCESSING', category: 'MEDIA' },
    'canvas': { name: 'IMAGE_MANIPULATION', category: 'MEDIA' },
    'tone': { name: 'AUDIO_SYNTHESIS', category: 'MEDIA' },
    'howler': { name: 'AUDIO_PLAYBACK', category: 'MEDIA' },
    'three': { name: '3D_RENDERING', category: 'MEDIA' },
    'react-three-fiber': { name: '3D_RENDERING', category: 'MEDIA' },

    // Infrastructure
    'supabase': { name: 'BACKEND_AS_A_SERVICE', category: 'INFRA' },
    'firebase': { name: 'BACKEND_AS_A_SERVICE', category: 'INFRA' },
    'prisma': { name: 'ORM', category: 'INFRA' },
    'drizzle-orm': { name: 'ORM', category: 'INFRA' },
    'stripe': { name: 'PAYMENT_PROCESSING', category: 'BUSINESS' },
    'resend': { name: 'EMAIL_SENDING', category: 'INFRA' },
    'react-email': { name: 'EMAIL_TEMPLATES', category: 'INFRA' },

    // Web
    'next': { name: 'SSR_FRAMEWORK', category: 'WEB' },
    'react': { name: 'UI_LIBRARY', category: 'WEB' },
    'tailwindcss': { name: 'STYLING', category: 'WEB' },
    'framer-motion': { name: 'ANIMATION', category: 'WEB' },
};

export function detectCapabilities(technologies: string[]): { name: string; category: string; source: string }[] {
    const capabilities: { name: string; category: string; source: string }[] = [];

    technologies.forEach(tech => {
        const lowerTech = tech.toLowerCase();
        // Exact match
        if (CAPABILITY_MAP[lowerTech]) {
            capabilities.push({
                ...CAPABILITY_MAP[lowerTech],
                source: `package:${lowerTech}`
            });
        }
        // Partial match for some (be careful)
        else if (lowerTech.includes('openai')) {
            capabilities.push({ name: 'AI_INTEGRATION', category: 'AI', source: `package:${tech}` });
        }
    });

    // Deduplicate
    return capabilities.filter((cap, index, self) =>
        index === self.findIndex((t) => (
            t.name === cap.name
        ))
    );
}
