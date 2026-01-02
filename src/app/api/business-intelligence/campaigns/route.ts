import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

interface Campaign {
    name: string;
    type: string;
    budget: string;
    status: 'planned' | 'active' | 'completed';
    goal: string;
    startDate?: string;
}

export async function GET() {
    try {
        const campaignsPath = path.join(process.cwd(), 'docs/04-business/Campaigns.md');

        if (!fs.existsSync(campaignsPath)) {
            return NextResponse.json(
                { error: 'Campaigns documentation not found' },
                { status: 404 }
            );
        }

        const campaignsContent = fs.readFileSync(campaignsPath, 'utf-8');
        const { data: campaignsMeta } = matter(campaignsContent);

        // Hardcoded parsing for MVP based on Campaigns.md content
        const campaigns: Campaign[] = [
            {
                name: 'Product Hunt Launch',
                type: 'Product Launch',
                budget: '$2,000',
                status: 'planned',
                goal: '#1 Product of the Day, 500+ upvotes',
                startDate: '2025-01-15'
            },
            {
                name: 'Architecture Debt Calculator',
                type: 'Lead Generation',
                budget: '$3,000/month',
                status: 'active',
                goal: '500 qualified leads/month'
            },
            {
                name: 'Architecture Office Hours',
                type: 'Webinar Series',
                budget: '$1,000/month',
                status: 'active',
                goal: '100 attendees/webinar, 20% trial conversion'
            },
            {
                name: 'State of Repository Management 2025',
                type: 'Research Report',
                budget: '$5,000',
                status: 'planned',
                goal: '1,000 downloads, 10 press mentions',
                startDate: '2025-02-01'
            },
            {
                name: 'Partner Integration Showcase',
                type: 'Co-Marketing',
                budget: '$2,000/partner',
                status: 'planned',
                goal: '100 signups per integration'
            },
            {
                name: 'VibeCoder for Open Source',
                type: 'Community Program',
                budget: '$500/month',
                status: 'active',
                goal: '500 OSS users, 50 testimonials'
            }
        ];

        return NextResponse.json({
            campaigns,
            lastUpdated: campaignsMeta.updated || new Date().toISOString().split('T')[0]
        });
    } catch (error) {
        console.error('Failed to load campaigns:', error);
        return NextResponse.json(
            { error: 'Failed to load campaigns' },
            { status: 500 }
        );
    }
}
