import { NextRequest, NextResponse } from 'next/server';
import { analyzeChangelog } from '@/lib/changelog-analyzer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        // Fallback: Load .env manually if not present (e.g. dev server not restarted)
        let apiKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            const envPath = path.join(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf-8');
                const match = envContent.match(/PERPLEXITY_API_KEY=(.*)/) || envContent.match(/PERPLEXITY_API_TOKEN=(.*)/) || envContent.match(/OPENAI_API_KEY=(.*)/);
                if (match && match[1]) {
                    apiKey = match[1].trim().replace(/["']/g, '');
                }
            }
        }

        if (!apiKey) {
            return NextResponse.json({ error: 'Server misconfiguration: Missing AI API Key' }, { status: 500 });
        }

        const body = await req.json();
        const { repoName, content } = body;

        if (!repoName || !content) {
            return NextResponse.json({ error: 'Missing repoName or content' }, { status: 400 });
        }

        console.log(`Analyzing changelog for ${repoName}...`);

        // Analyze content
        // Limit content size to avoid token limits (e.g. last 10kb)
        const snippet = content.slice(0, 10000);
        const analysis = await analyzeChangelog(snippet, apiKey);

        if (!analysis) {
            return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
        }

        // Store results (or just log for now based on current requirements)
        // In a real implementation, we would update the database here.
        // For now, we'll return the analysis so the caller knows what happened.

        // Example: Find repo and connect providers if confidence is high
        // Use findFirst because name might not be unique in schema or to avoid type errors if not marked unique
        const repo = await prisma.repository.findFirst({ where: { name: repoName } });

        if (repo) {
            // Logic to auto-link providers could go here
            // For now, we just return the suggestions
        }

        return NextResponse.json({
            success: true,
            repo: repoName,
            analysis: analysis
        });

    } catch (error) {
        console.error('Error in changelog ingestion:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
