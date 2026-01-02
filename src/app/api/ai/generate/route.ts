import { NextResponse } from 'next/server';
import { safeCompletion, getModel } from '@/lib/ai/core';
import prisma from '@/lib/prisma';
import { getVersionInfo } from '@/lib/version';

export async function POST() {
    try {
        // 1. Fetch System Context with enhanced data
        const [repos, technologies, interfaces, deployments, decisions] = await Promise.all([
            prisma.repository.findMany({ include: { technologies: true, interfaces: true, deployments: true } }),
            prisma.technology.findMany({ include: { repository: { select: { name: true } } } }),
            prisma.interface.findMany(),
            prisma.deployment.findMany({ include: { repository: { select: { name: true } } } }),
            prisma.architectureDecision.findMany({ where: { status: 'ACCEPTED' } })
        ]);

        const dashboardInfo = getVersionInfo();

        // 1.5 Enhanced Analytics: ADR Compliance & Security

        // Next.js Version Analysis (ADR-001)
        const nextJsProjects = technologies.filter((t: any) =>
            ['Next.js', 'next', 'NextJS'].includes(t.name)
        );
        const nextJs16Count = nextJsProjects.filter((t: any) =>
            t.version && (t.version.includes('16.0') || t.version.includes('16.1'))
        ).length;
        const nextJs15Count = nextJsProjects.filter((t: any) =>
            t.version && t.version.includes('15.')
        ).length;

        // React Version Analysis (Security)
        const reactProjects = technologies.filter((t: any) =>
            ['React', 'react'].includes(t.name)
        );
        const react19_2Plus = reactProjects.filter((t: any) =>
            t.version && (t.version.includes('19.2') || t.version.includes('19.3'))
        ).length;

        // Vulnerable versions (CVE-2025-55182, CVE-2025-66478)
        const vulnerableReact = reactProjects.filter((t: any) => {
            if (!t.version) return false;
            const v = t.version.replace(/[\^~>=]/g, '');
            return v.match(/^19\.[0-2]\.0$/); // React 19.0.0 - 19.2.0 (before 19.2.1)
        });

        const vulnerableNextJs = nextJsProjects.filter((t: any) => {
            if (!t.version) return false;
            const v = t.version.replace(/[\^~>=]/g, '');
            return v.match(/^15\.[0-4]\./) || v.match(/^16\.0\.[0-6]$/);
        });

        // TypeScript Adoption (ADR-002)
        const tsProjects = technologies.filter((t: any) => t.name === 'TypeScript');
        const tsAdoptionRate = Math.round((tsProjects.length / repos.length) * 100);

        // Deployment Provider Analysis (ADR-007)
        const deploymentsWithProvider = deployments.filter((d: any) => d.provider);
        const providerCoverage = Math.round((deploymentsWithProvider.length / deployments.length) * 100);

        // 1.6 Fetch Previous Report
        let previousReportContent = "";
        try {
            if ('aIReport' in prisma) {
                const aIReport = (prisma as any).aIReport;
                const lastReport = await aIReport.findFirst({
                    orderBy: { createdAt: 'desc' }
                });
                if (lastReport) {
                    previousReportContent = lastReport.content;
                }
            } else {
                const reports = await (prisma as any).$queryRawUnsafe('SELECT content FROM AIReport ORDER BY createdAt DESC LIMIT 1');
                if (Array.isArray(reports) && reports.length > 0) {
                    previousReportContent = (reports[0] as any).content;
                }
            }
        } catch (e) {
            console.warn("Failed to fetch previous report for comparison", e);
        }

        // 2. Enhanced Prompt with Compliance Metrics
        const systemPrompt = `Du bist ein Senior Software Architekt, der einen "Architecture Analysis Report" für ein Portfolio von Softwareprojekten erstellt.
    
    **Ziel:**
    Erstelle eine umfassende, datenbasierte Analyse der gesamten Systemlandschaft auf DEUTSCH.
    
    **WICHTIG - Verlinkungen:**
    Wenn du Module, Repositories oder Technologien erwähnst, verlinke sie bitte direkt im Dashboard:
    - Repository: \`[Name](/repo/Name)\` (z.B. [playlist_generator](/repo/playlist_generator))
    - Technologien: \`[Tech](/tech?q=Tech)\`
    - Logs: \`[Logs](/logs)\`
    - DNS/Domains: \`[DNS](/dns)\`
    - Policies: \`[Policy](/architect/decisions/ID)\`
    
    **Berichtsstruktur:**
    1.  **Management Summary**: 2-3 Sätze zur Gesundheit des Systems, inkl. kritischer Metriken.
    2.  **Veränderungen seit dem letzten Bericht**: Vergleiche mit "Previous Report". Was ist neu? Was hat sich geändert?
    3.  **Portfolio Statistiken**: Anzahl Repos, Tech-Stack Verteilung mit konkreten Zahlen.
    4.  **Compliance Check**: Prüfe JEDEN Architecture Decision mit den bereitgestellten Metriken:
        - ADR-001 (Next.js 16): Nutze die Next.js-Versions-Statistiken
        - ADR-002 (TypeScript Strict): Nutze die TypeScript-Adoption-Rate
        - ADR-007 (Hosting): Nutze die Provider-Coverage-Daten
        - ADR-013 (DB Connections): Analysiere basierend auf Technologie-Stack
    5.  **Kritische Risiken**: PRIORISIERE Security-Schwachstellen (nutze die CVE-Daten):
        - React Server Components RCE (CVE-2025-55182, CVE-2025-66478)
        - Liste KONKRET betroffene Projekte auf
    6.  **Strategische Empfehlungen**: Top 3 Initiativen mit konkreten Zahlen und Timelines.
    
    **Ton:** Professionell, datenbasiert, handlungsorientiert.
    **Format:** Sauberes Markdown mit Tabellen für Metriken.`;

        const userPrompt = `System Data:
    - Repositories: ${repos.length}
    - Technologies: ${technologies.length} total
    - Interfaces: ${interfaces.length} detected
    - Deployments: ${deployments.length} active

    === SYSTEM REFERENCE (Reference Version for Compliance) ===
    - Dashboard Name: Vibecoder Architect Reviewer
    - Dashboard App Version: ${dashboardInfo.version}
    - Dashboard Next.js Version: ${dashboardInfo.nextVersion} (Target for all projects)
    - Node.js Runtime: ${dashboardInfo.nodeVersion}
    - Platform: ${dashboardInfo.platform}

    === ADR COMPLIANCE METRICS ===
    ADR-001 (Next.js 16 Adoption):
    - Total Next.js Projects: ${nextJsProjects.length}
    - Next.js 16.x: ${nextJs16Count} (${Math.round(nextJs16Count / nextJsProjects.length * 100)}%)
    - Next.js 15.x: ${nextJs15Count} (${Math.round(nextJs15Count / nextJsProjects.length * 100)}%)
    - Compliance: ${nextJs16Count >= nextJsProjects.length * 0.8 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}

    ADR-002 (TypeScript Strict Mode):
    - TypeScript Projects: ${tsProjects.length} of ${repos.length} (${tsAdoptionRate}%)
    - Compliance: ${tsAdoptionRate >= 80 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}

    ADR-007 (Hosting Strategy):
    - Deployments with Provider: ${deploymentsWithProvider.length} of ${deployments.length} (${providerCoverage}%)
    - Compliance: ${providerCoverage >= 90 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}

    === SECURITY ANALYSIS ===
    React Server Components RCE (CVE-2025-55182, CVE-2025-66478):
    - Vulnerable React Versions: ${vulnerableReact.length} projects
    ${vulnerableReact.length > 0 ? `- Affected: ${vulnerableReact.map((t: any) => `${t.repository.name} (${t.version})`).join(', ')}` : '- ✅ No vulnerable React versions detected'}
    - Vulnerable Next.js Versions: ${vulnerableNextJs.length} projects
    ${vulnerableNextJs.length > 0 ? `- Affected: ${vulnerableNextJs.map((t: any) => `${t.repository.name} (${t.version})`).join(', ')}` : '- ✅ No vulnerable Next.js versions detected'}
    - Risk Level: ${(vulnerableReact.length + vulnerableNextJs.length) > 0 ? '🔴 HIGH' : '✅ LOW'}

    Architecture Decisions (Policies):
    ${decisions.map((d: any) => `- [${d.title}](/architect/decisions/${d.id}): ${d.decision} (Tags: ${d.tags})`).join('\n')}

    Technology Distribution (Top 15):
    ${Array.from(new Map(technologies.map((t: any) => [t.name, t])).values())
                .reduce((acc: any[], t: any) => {
                    const existing = acc.find(x => x.name === t.name);
                    if (existing) {
                        existing.count++;
                    } else {
                        acc.push({ name: t.name, count: 1 });
                    }
                    return acc;
                }, [])
                .sort((a, b) => b.count - a.count)
                .slice(0, 15)
                .map((t: any) => `- ${t.name}: ${t.count} projects (${Math.round(t.count / repos.length * 100)}%)`)
                .join('\n')}

    Deployment Overview:
    ${deployments.map((d: any) => `- ${d.repository?.name || 'Unknown'}: ${d.provider || 'Unknown Provider'} (${d.status || 'Unknown Status'})`).join('\n')}
    
    === PREVIOUS REPORT CONTENT (For Comparison) ===
    ${previousReportContent ? previousReportContent : "No previous report available."}
    `;

        // 3. Call AI (Perplexity or OpenRouter)
        const completion = await safeCompletion({
            model: getModel(), // Dynamic model selection
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

            repos.forEach((r: any) => {
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
