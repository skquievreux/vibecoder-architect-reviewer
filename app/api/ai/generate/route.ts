import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

export async function POST() {
    try {
        // Force read .env from filesystem to bypass Next.js/Node process.env cache
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(process.cwd(), '.env');
        let fileKey = null;

        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const match = envContent.match(/PERPLEXITY_API_KEY=(.*)/) || envContent.match(/PERPLEXITY_API_TOKEN=(.*)/) || envContent.match(/OPENAI_API_KEY=(.*)/);
            if (match && match[1]) {
                fileKey = match[1].trim().replace(/["']/g, '');
            }
        }

        const apiKey = fileKey || process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_TOKEN || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI API Key not configured (Set PERPLEXITY_API_KEY or OPENAI_API_KEY)' }, { status: 500 });
        }

        // Configure for Perplexity (OpenAI compatible)
        const openai = new OpenAI({
            apiKey,
            baseURL: 'https://api.perplexity.ai', // Perplexity API Endpoint
        });

        // 1. Fetch System Context
        const [repos, technologies, interfaces, deployments] = await Promise.all([
            prisma.repository.findMany({ include: { technologies: true, interfaces: true, deployments: true } }),
            prisma.technology.findMany(),
            prisma.interface.findMany(),
            prisma.deployment.findMany()
        ]);

        // 2. Construct Prompt
        const systemPrompt = `Du bist ein Senior Software Architekt, der einen "Projekt-Überblick" für ein Portfolio von Softwareprojekten erstellt.
    
    **Ziel:**
    Erstelle eine umfassende Zusammenfassung der gesamten Systemlandschaft auf DEUTSCH.
    
    **WICHTIG - Verlinkungen:**
    Wenn du Module, Repositories oder Technologien erwähnst, verlinke sie bitte direkt im Dashboard:
    - Repository: \`[Name](/repo/Name)\` (z.B. [playlist_generator](/repo/playlist_generator))
    - Technologien: \`[Tech](/tech?q=Tech)\`
    - Logs: \`[Logs](/logs)\`
    - DNS/Domains: \`[DNS](/dns)\`
    
    **Berichtsstruktur:**
    1.  **Management Summary**: 2-3 Sätze zur Gesundheit des Systems.
    2.  **Portfolio Statistiken**: Anzahl Repos, Tech-Stack Verteilung.
    3.  **Kritische Risiken**: Nur die dringendsten Sicherheits- oder Wartungsrisiken (z.B. veraltete Frameworks, exponierte Secrets).
    4.  **Strategische Empfehlungen**: Was sind die Top 3 Initiativen? (z.B. "Standardisierung auf Node 20", "Migration zu Fly.io").
    
    **Ton:** Professionell, strategisch und handlungsorientiert.
    **Format:** Sauberes Markdown.`;

        const userPrompt = `System Data:
    - Repositories: ${repos.length}
    - Technologies: ${technologies.map(t => `${t.name} (${t.version || 'unknown'})`).join(', ')}
    - Interfaces: ${interfaces.length} detected
    - Deployments: ${deployments.length} active

    Detailed Repo List:
    ${JSON.stringify(repos.map(r => ({
            name: r.name,
            private: r.isPrivate,
            updated: r.updatedAt,
            tech: r.technologies.map(t => t.name),
            interfaces: r.interfaces.map(i => i.type)
        })), null, 2)}
    `;

        // 3. Call AI (Perplexity)
        const completion = await openai.chat.completions.create({
            model: "sonar-pro", // Perplexity Model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
        });

        const reportContent = completion.choices[0].message.content || "No report generated.";

        // 4. Save to Database
        if (!prisma.aIReport) {
            // Fallback for stale Prisma Client
            const crypto = require('crypto');
            const id = crypto.randomUUID();
            const now = new Date().toISOString();
            await prisma.$executeRawUnsafe(
                'INSERT INTO AIReport (id, content, createdAt) VALUES (?, ?, ?)',
                id, reportContent, now
            );
            // Return mock object since we can't return the prisma result
            return NextResponse.json({ report: { id, content: reportContent, createdAt: now } });
        } else {
            const report = await prisma.aIReport.create({
                data: {
                    content: reportContent
                }
            });
            return NextResponse.json({ report });
        }
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to generate report' }, { status: 500 });
    }
}
