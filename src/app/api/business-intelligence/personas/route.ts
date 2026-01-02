import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

interface Persona {
    name: string;
    title: string;
    ltv: string;
    willingnessToPay: string;
    painPoints: string[];
    priority: 'primary' | 'secondary' | 'tertiary';
}

export async function GET() {
    try {
        const personasPath = path.join(process.cwd(), 'docs/04-business/Customer-Personas.md');

        if (!fs.existsSync(personasPath)) {
            return NextResponse.json(
                { error: 'Personas documentation not found' },
                { status: 404 }
            );
        }

        const personasContent = fs.readFileSync(personasPath, 'utf-8');
        const { data: personasMeta } = matter(personasContent);

        // Hardcoded parsing for MVP - in a real implementation we would parse the markdown content
        // This matches the content we just created in Customer-Personas.md
        const personas: Persona[] = [
            {
                name: 'CTO Chris',
                title: 'Scale-Up Technical Leader',
                ltv: '$18,000',
                willingnessToPay: '$200-$500/month',
                painPoints: ['Manual audits', 'Inconsistent standards', 'Hidden technical debt'],
                priority: 'primary'
            },
            {
                name: 'DevOps Dana',
                title: 'Consultancy Operations Lead',
                ltv: '$24,000',
                willingnessToPay: '$500-$2,000/month',
                painPoints: ['Client reporting overhead', 'Context switching', 'Audit fatigue'],
                priority: 'primary'
            },
            {
                name: 'Maintainer Mike',
                title: 'Open Source Polyglot',
                ltv: '$600',
                willingnessToPay: '$0-$50/month',
                painPoints: ['Dependency hell', 'Security alerts', 'Upgrade fatigue'],
                priority: 'tertiary'
            },
            {
                name: 'Founder Fiona',
                title: 'Solo SaaS Builder',
                ltv: '$3,600',
                willingnessToPay: '$50-$200/month',
                painPoints: ['Time scarcity', 'Technical decisions', 'Quality vs speed'],
                priority: 'secondary'
            }
        ];

        return NextResponse.json({
            personas,
            lastUpdated: personasMeta.updated || new Date().toISOString().split('T')[0]
        });
    } catch (error) {
        console.error('Failed to load personas:', error);
        return NextResponse.json(
            { error: 'Failed to load personas' },
            { status: 500 }
        );
    }
}
