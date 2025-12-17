import { NextResponse } from 'next/server';
import { safeCompletion } from '@/lib/ai/core';
import prisma from '@/lib/prisma';

export async function POST() {
    try {
        // 1. Fetch Repositories

        // 1. Fetch Repositories
        let repos;
        if (!prisma.repository) {
            // Fallback for stale Prisma Client
            repos = await prisma.$queryRawUnsafe('SELECT * FROM Repository');
        } else {
            repos = await prisma.repository.findMany({
                include: {
                    technologies: true,
                    health: true
                }
            });
        }

        const repoData = (repos as any[]).map((r: any) => ({
            name: r.name,
            description: r.description,
            tech: r.technologies ? r.technologies.map((t: any) => t.name).join(', ') : '',
            health: r.health ? `Outdated: ${r.health.outdatedDependenciesCount}, Vulns: ${r.health.vulnerabilitiesCount}` : 'Unknown'
        })).slice(0, 20); // Limit to 20 to save tokens

        // 2. Construct Prompt
        const systemPrompt = `Du bist ein technischer Projektmanager.
        Analysiere die folgende Liste von Repositories.
        Erstelle für jedes Repository 1-2 konkrete, handlungsorientierte Aufgaben (Tasks), falls nötig.
        
        Kriterien für Aufgaben:
        - Hohe Priorität: Sicherheitslücken oder veraltete Dependencies (>0).
        - Hohe Priorität: Next.js Version < 16.0.0 (Migration auf v16 erforderlich).
        - Mittlere Priorität: Fehlende Beschreibungen oder unklare Tech-Stacks.
        - Keine Aufgaben erstellen, wenn das Repo gesund aussieht.

        Antworte AUSSCHLIESSLICH mit einem JSON Array.
        Format:
        [
            {
                "repoName": "string",
                "title": "string (kurz & knapp)",
                "priority": "HIGH" | "MEDIUM" | "LOW",
                "type": "SECURITY" | "MAINTENANCE" | "FEATURE"
            }
        ]`;

        const userPrompt = JSON.stringify(repoData, null, 2);

        // 3. Call AI
        const completion = await safeCompletion({
            model: "sonar-pro",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const content = completion.choices[0].message.content || "[]";

        // Clean up markdown code blocks if present
        const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();

        let tasks = [];
        try {
            tasks = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse AI JSON:", content);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        // 4. Save to Database
        let createdCount = 0;
        for (const task of tasks) {
            const repo = (repos as any[]).find((r: any) => r.name === task.repoName);
            if (repo) {
                // @ts-ignore
                if (!prisma.repoTask) {
                    // Fallback
                    const crypto = require('crypto');
                    await prisma.$executeRawUnsafe(
                        'INSERT INTO RepoTask (id, repositoryId, title, status, priority, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        crypto.randomUUID(), repo.id, task.title, 'OPEN', task.priority, task.type, new Date().toISOString(), new Date().toISOString()
                    );
                    createdCount++;
                } else {
                    // Check for duplicate open task
                    // @ts-ignore
                    const existing = await prisma.repoTask.findFirst({
                        where: {
                            repositoryId: repo.id,
                            title: task.title,
                            status: 'OPEN'
                        }
                    });

                    if (!existing) {
                        // @ts-ignore
                        await prisma.repoTask.create({
                            data: {
                                repositoryId: repo.id,
                                title: task.title,
                                priority: task.priority,
                                type: task.type,
                                status: 'OPEN'
                            }
                        });
                        createdCount++;
                    }
                }
            }
        }

        return NextResponse.json({ message: `Generated ${createdCount} tasks`, tasks });

    } catch (error: any) {
        console.error("AI Task Generation Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to generate tasks' }, { status: 500 });
    }
}
