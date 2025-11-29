import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

export async function POST() {
    try {
        // 1. Setup AI Client
        const apiKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI API Key not configured' }, { status: 500 });
        }

        const client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.perplexity.ai", // Defaulting to Perplexity as per other routes
        });

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
                const completion = await client.chat.completions.create({
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
