import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

export async function POST() {
    try {
        const apiKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY;
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
        const systemPrompt = `You are a Senior Software Architect providing a high-level "Project Overview" for a portfolio of software projects.
    
    **Objective:**
    Create a comprehensive executive summary of the entire system landscape. Do not get lost in minor details of every single repo unless critical.
    
    **Report Structure:**
    1.  **Executive Summary**: A 2-3 sentence high-level assessment of the system's health.
    2.  **Portfolio Statistics**: Total repos, tech stack distribution, deployment health.
    3.  **Critical Risks**: Highlight only the most urgent security or maintenance risks (e.g., outdated frameworks, exposed secrets).
    4.  **Strategic Recommendations**: What are the top 3 initiatives the team should focus on next? (e.g., "Standardize on Node 20", "Migrate all Python apps to Fly.io").
    
    **Tone:** Professional, strategic, and actionable.
    **Format:** Clean Markdown.`;

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
            model: "llama-3.1-sonar-large-128k-online", // Perplexity Model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
        });

        const reportContent = completion.choices[0].message.content || "No report generated.";

        // 4. Save to Database
        const report = await prisma.aIReport.create({
            data: {
                content: reportContent
            }
        });

        return NextResponse.json({ report });
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to generate report' }, { status: 500 });
    }
}
