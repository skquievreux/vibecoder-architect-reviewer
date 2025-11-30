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

        // 1.5 Fetch Previous Report
        let previousReportContent = "";
        try {
            // @ts-ignore
            if (prisma.aIReport) {
                // @ts-ignore
                const lastReport = await prisma.aIReport.findFirst({
                    orderBy: { createdAt: 'desc' }
                });
                if (lastReport) {
                    previousReportContent = lastReport.content;
                }
            } else {
                // Fallback raw query
                const reports = await prisma.$queryRawUnsafe('SELECT content FROM AIReport ORDER BY createdAt DESC LIMIT 1');
                if (Array.isArray(reports) && reports.length > 0) {
                    previousReportContent = (reports[0] as any).content;
                }
            }
        } catch (e) {
            console.warn("Failed to fetch previous report for comparison", e);
        }

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
    2.  **Veränderungen seit dem letzten Bericht**: Vergleiche den aktuellen Zustand mit dem "Previous Report". Was ist neu? Was hat sich geändert? (Nur wenn ein vorheriger Bericht existiert).
    3.  **Portfolio Statistiken**: Anzahl Repos, Tech-Stack Verteilung.
    4.  **Kritische Risiken**: Nur die dringendsten Sicherheits- oder Wartungsrisiken.
    5.  **Strategische Empfehlungen**: Top 3 Initiativen.
    
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
    
    === PREVIOUS REPORT CONTENT (For Comparison) ===
    ${previousReportContent ? previousReportContent : "No previous report available."}
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
        let report;
        if (!prisma.aIReport) {
            // Fallback for stale Prisma Client
            const crypto = require('crypto');
            const id = crypto.randomUUID();
            const now = new Date().toISOString();
            await prisma.$executeRawUnsafe(
                'INSERT INTO AIReport (id, content, createdAt) VALUES (?, ?, ?)',
                id, reportContent, now
            );
            report = { id, content: reportContent, createdAt: now };
        } else {
            report = await prisma.aIReport.create({
                data: {
                    content: reportContent
                }
            });
        }

        // 5. Create Health Snapshot
        try {
            // Calculate metrics
            const totalRepositories = repos.length;

            // Calculate outdated dependencies (mock logic based on available data or real if Health model populated)
            // For now, let's assume we can derive some "health score" or count from the data we have.
            // In a real scenario, we'd query RepoHealth.

            let outdatedCount = 0;
            let vulnerabilitiesCount = 0;
            let totalHealthScore = 0;

            // Simple heuristic if RepoHealth is empty: check for old updates
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            repos.forEach(r => {
                if (new Date(r.updatedAt) < sixMonthsAgo) {
                    outdatedCount++;
                }
                // Mock score: 100 - (10 * outdated)
                totalHealthScore += 100;
            });

            const avgHealthScore = totalRepositories > 0
                ? Math.max(0, Math.round((totalHealthScore - (outdatedCount * 20)) / totalRepositories))
                : 100;

            if (prisma.healthSnapshot) {
                await prisma.healthSnapshot.create({
                    data: {
                        totalRepositories,
                        outdatedDependenciesCount: outdatedCount,
                        vulnerabilitiesCount: vulnerabilitiesCount,
                        healthScore: avgHealthScore
                    }
                });
            }
        } catch (snapshotError) {
            console.error("Failed to create health snapshot:", snapshotError);
            // Don't fail the request if snapshot fails
        }

        return NextResponse.json({ report });
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to generate report' }, { status: 500 });
    }
}
