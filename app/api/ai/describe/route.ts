import { NextResponse } from 'next/server';
import { safeCompletion } from '@/lib/ai/core';
import prisma from '@/lib/prisma';

export async function POST() {
    try {
        // 1. Setup - Handled centrally by safeCompletion

        // 2. Find repos without descriptions
        const reposToEnrich = await prisma.repository.findMany({
            where: {
                OR: [
                    { description: null },
                    { description: '' }
                ]
            },
            include: {
                technologies: true
            },
            take: 5 // Process 5 at a time to avoid timeouts
        });

        if (reposToEnrich.length === 0) {
            return NextResponse.json({ message: 'No repositories need enrichment', updated: 0 });
        }

        let updatedCount = 0;
        const updates = [];

        for (const repo of reposToEnrich) {
            const techStack = repo.technologies.map(t => t.name).join(', ');

            const prompt = `
            Erstelle eine sehr kurze, prägnante Beschreibung (max. 1 Satz, Deutsch) für ein Software-Repository.
            Name: ${repo.name}
            Technologien: ${techStack}
            
            Antworte NUR mit der Beschreibung. Keine Anführungszeichen.
            `;

            try {
                const completion = await safeCompletion({
                    model: "sonar-pro",
                    messages: [
                        { role: "system", content: "Du bist ein technischer Redakteur." },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 60,
                });

                const description = completion.choices[0].message.content?.trim() || "Keine Beschreibung verfügbar.";

                // Update DB
                await prisma.repository.update({
                    where: { id: repo.id },
                    data: { description }
                });

                updates.push({ name: repo.name, description });
                updatedCount++;

            } catch (aiError) {
                console.error(`Failed to generate description for ${repo.name}`, aiError);
            }
        }

        return NextResponse.json({
            message: `Enriched ${updatedCount} repositories`,
            updates
        });

    } catch (error: any) {
        console.error("Enrichment Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to enrich data' }, { status: 500 });
    }
}
