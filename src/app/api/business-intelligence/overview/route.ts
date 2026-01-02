import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

interface BusinessOverview {
    product: string;
    version: string;
    targetARR: string;
    currentMRR: string;
    q1Budget: string;
    status: string;
    lastUpdated: string;
}

export async function GET() {
    try {
        // Read Marketing-Strategy.md
        const strategyPath = path.join(process.cwd(), 'docs/04-business/Marketing-Strategy.md');

        if (!fs.existsSync(strategyPath)) {
            return NextResponse.json(
                { error: 'Marketing strategy not found' },
                { status: 404 }
            );
        }

        const strategyContent = fs.readFileSync(strategyPath, 'utf-8');
        const { data: strategyMeta } = matter(strategyContent);

        // Extract key metrics from frontmatter
        const overview: BusinessOverview = {
            product: strategyMeta.product || 'VibeCoder Architect Reviewer',
            version: strategyMeta.version || '2.17.1',
            targetARR: '$250,000', // Year 1 target from strategy
            currentMRR: '$0', // Starting phase
            q1Budget: '$17,700', // From campaigns
            status: strategyMeta.status || 'approved',
            lastUpdated: strategyMeta.updated || new Date().toISOString().split('T')[0]
        };

        return NextResponse.json(overview);
    } catch (error) {
        console.error('Failed to load business overview:', error);
        return NextResponse.json(
            { error: 'Failed to load business overview' },
            { status: 500 }
        );
    }
}
