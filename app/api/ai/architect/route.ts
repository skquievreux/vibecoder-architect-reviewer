import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { safeCompletion, getModel } from '@/lib/ai/core';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, history } = body;

        console.log(`[AI Architect] Received request. Message length: ${message?.length || 0}`);

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Fetch context
        const providers = await prisma.deployment.findMany({ select: { provider: true } });
        const technologies = await prisma.technology.findMany({ select: { name: true, version: true } });
        const decisions = await prisma.architectureDecision.findMany({
            where: { status: 'ACCEPTED' },
            select: { title: true, decision: true, tags: true, createdAt: true }
        });

        const context = {
            providers: [...new Set(providers.map(p => p.provider))].join(', '),
            technologies: [...new Set(technologies.map(t => t.name))].slice(0, 50).join(', '), // Limit to top 50 to save tokens
            decisions: decisions.map(d => `- ${d.title}: ${d.decision}`).join('\n')
        };


        const systemPrompt = `
        You are the "AI Architect Advisor" for a software development company.
        Your goal is to help developers define new projects that align with the company's "Golden Paths" and portfolio standards.

        **Company Context:**
        - **Preferred Providers:** ${context.providers}
        - **Common Technologies:** ${context.technologies}
        - **Architecture Decisions (ADRs):**
        ${context.decisions}

        **Golden Path Standards:**
        - Frontend: Next.js (App Router)
        - Backend: Next.js API Routes or Node.js (Dockerized)
        - Database: Supabase (PostgreSQL)
        - Hosting: Vercel (Frontend), Fly.io/Hetzner (Backend)
        - Auth: Supabase Auth
        - AI: Perplexity (Sonar), OpenAI, Replicate (Media)

        **Instructions:**
        1. Analyze the user's project idea.
        2. Recommend a technology stack based ONLY on the Golden Paths above.
        3. If the user asks for an "ADR" or "Decision Record", output the response in a structured HTML format inside a JSON object with type 'adr'.
        4. Otherwise, provide a helpful, conversational response in **clean Markdown**.
        5. **IMPORTANT: Do NOT include citation numbers like [1][2] or sources in your response. Strip them out.**
        6. Use bolding for key terms and lists for readability.

        **Response Format:**
        Return a JSON object.
        - If normal chat: { "message": "Your markdown response here", "type": "text" }
        - If ADR requested: { "message": "Here is the ADR...", "type": "adr", "content": "<div>HTML Content...</div>" }
        `;

        // Sanitize history: Perplexity requires User message after System.
        // Remove leading Assistant messages.
        let sanitizedHistory = history;
        while (sanitizedHistory.length > 0 && sanitizedHistory[0].role === 'assistant') {
            sanitizedHistory.shift();
        }

        const completion = await safeCompletion({
            model: getModel(),
            messages: [
                { role: "system", content: systemPrompt },
                ...sanitizedHistory.map((msg: any) => ({ role: msg.role, content: msg.content })),
                { role: "user", content: message }
            ],
        });

        const responseContent = completion.choices[0].message.content;

        // Try to parse JSON from AI
        try {
            // Find JSON substring if wrapped in text
            const jsonMatch = responseContent?.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return NextResponse.json(parsed);
            }
        } catch (e) {
            // Fallback if not valid JSON
        }

        // Default fallback
        return NextResponse.json({
            message: responseContent || "I processed your request but couldn't generate a structured response.",
            type: 'text'
        });

    } catch (error: any) {
        console.error('AI Architect Error:', error);

        if (error.message && error.message.includes("API Key missing")) {
            return NextResponse.json({
                message: "I'm currently offline (API Key missing). Please configure PERPLEXITY_API_KEY in your .env.local file.",
                type: 'text'
            });
        }

        return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
    }
}
