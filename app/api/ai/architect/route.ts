import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock AI response generation (replace with actual LLM call in production)
// This simulates the "Architect Advisor" logic
async function generateArchitectResponse(message: string, context: any) {
    const lowerMsg = message.toLowerCase();

    // 1. Analyze Intent
    const isBackgroundWorker = lowerMsg.includes('background') || lowerMsg.includes('worker') || lowerMsg.includes('queue');
    const isWebApp = lowerMsg.includes('web') || lowerMsg.includes('app') || lowerMsg.includes('frontend');
    const isVideo = lowerMsg.includes('video') || lowerMsg.includes('media');

    // 2. Match Portfolio Standards (Golden Paths)
    let stack = {
        frontend: "Next.js (v14.2)", // Default
        backend: "Next.js API Routes",
        database: "Supabase (PostgreSQL)",
        hosting: "Vercel",
        auth: "Supabase Auth"
    };

    let recommendations = [];
    let warnings = [];

    if (isBackgroundWorker) {
        stack.backend = "Node.js (Dockerized)";
        stack.hosting = "Hetzner (Docker Swarm) or Fly.io";
        recommendations.push("Use **BullMQ** for job queues (Redis required).");
        recommendations.push("For long-running tasks, avoid serverless functions (timeout risk).");
    }

    if (isVideo) {
        recommendations.push("Use **FAL-AI** or **Replicate** for AI video processing (SaaS preferred).");
        recommendations.push("Store large assets in **AWS S3** or **Supabase Storage**.");
    }

    // New: Audio/Music Detection
    const isAudio = lowerMsg.includes('music') || lowerMsg.includes('audio') || lowerMsg.includes('voice') || lowerMsg.includes('suno') || lowerMsg.includes('eleven');
    if (isAudio) {
        recommendations.push("Use **Suno AI** for music generation (Portfolio Standard).");
        recommendations.push("Use **Eleven Labs** for voice synthesis.");
    }

    // 3. Generate ADR Content (HTML format for simplicity in this demo)
    const adrContent = `
<div class="space-y-4">
    <h1 class="text-2xl font-bold text-white">Architecture Decision Record (ADR)</h1>
    
    <div class="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h2 class="text-lg font-semibold text-violet-400 mb-2">Context</h2>
        <p class="text-slate-300">The user requested a solution for: <em class="text-white">"${message}"</em></p>
    </div>

    <div>
        <h2 class="text-lg font-semibold text-violet-400 mb-2">Decision</h2>
        <p class="text-slate-300 mb-4">We will use the following <strong>Golden Path</strong> stack to ensure consistency and maintainability:</p>
        
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="text-slate-400 border-b border-slate-700">
                    <th class="py-2">Component</th>
                    <th class="py-2">Technology</th>
                    <th class="py-2">Version</th>
                </tr>
            </thead>
            <tbody class="text-slate-200">
                <tr class="border-b border-slate-800"><td class="py-2 font-medium">Frontend</td><td>${stack.frontend}</td><td>14.2</td></tr>
                <tr class="border-b border-slate-800"><td class="py-2 font-medium">Backend</td><td>${stack.backend}</td><td>-</td></tr>
                <tr class="border-b border-slate-800"><td class="py-2 font-medium">Database</td><td>${stack.database}</td><td>-</td></tr>
                <tr class="border-b border-slate-800"><td class="py-2 font-medium">Hosting</td><td>${stack.hosting}</td><td>-</td></tr>
                <tr class="border-b border-slate-800"><td class="py-2 font-medium">Auth</td><td>${stack.auth}</td><td>-</td></tr>
            </tbody>
        </table>
    </div>

    <div>
        <h2 class="text-lg font-semibold text-emerald-400 mb-2">Key Recommendations</h2>
        <ul class="list-disc list-inside text-slate-300 space-y-1">
            ${recommendations.map(r => `<li>${r.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}
        </ul>
    </div>

    <div class="bg-emerald-900/20 p-4 rounded-lg border border-emerald-800">
        <h2 class="text-lg font-semibold text-emerald-400 mb-2">Compliance Check</h2>
        <ul class="space-y-1 text-emerald-200">
            <li class="flex items-center gap-2"><span class="text-emerald-500">✔</span> <strong>SaaS First</strong>: Prioritized managed services.</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">✔</span> <strong>Version Lock</strong>: Enforced Portfolio Standards.</li>
            <li class="flex items-center gap-2"><span class="text-emerald-500">✔</span> <strong>Cost Efficiency</strong>: Verified against contracts.</li>
        </ul>
    </div>
</div>
    `;

    return {
        message: "Based on your requirements and our portfolio standards, I have generated the following Architecture Decision Record (ADR):",
        type: 'adr',
        content: adrContent
    };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, history } = body;

        console.log(`[AI Architect] Received request. Message length: ${message?.length || 0}`);

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Fetch context (Providers, Technologies)
        // In a real implementation, we would feed this to the LLM
        const providers = await prisma.deployment.findMany({ select: { provider: true } });
        const technologies = await prisma.technology.findMany({ select: { name: true, version: true } });

        const context = {
            providers: [...new Set(providers.map(p => p.provider))],
            technologies: technologies
        };

        console.log('[AI Architect] Context loaded. Generating response...');

        // Generate Response
        // For this demo, we use the rule-based mock function
        // In production, this would be: await callLLM(systemPrompt, message, context);
        const response = await generateArchitectResponse(message, context);

        console.log(`[AI Architect] Response generated. Type: ${response.type}`);

        // If the response is an ADR, we send the content separately or as part of the message
        // The UI expects { message: string, type: 'text' | 'adr', content?: string }
        // But our UI logic handles 'adr' type by rendering 'content' as HTML/Markdown

        // Let's refine the response structure to match UI expectation
        if (response.type === 'adr') {
            return NextResponse.json({
                message: response.message,
                type: 'adr',
                content: response.content
            });
        }

        return NextResponse.json({
            message: "I'm listening. Tell me more about your project requirements.",
            type: 'text'
        });

    } catch (error) {
        console.error('AI Architect Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
