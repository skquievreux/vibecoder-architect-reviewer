
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ENHANCEMENTS = {
    'vibecoder-architect-reviewer': {
        businessCanvas: {
            valueProposition: JSON.stringify([
                "Automated Architecture Governance",
                "Self-Healing Codebase Analysis",
                "Enterprise-Grade Compliance Guardrails"
            ]),
            customerSegments: JSON.stringify([
                { name: "CTOs & Tech Leads", pain_points: ["Technical Debt", "Inconsistent Standards"], willingness_to_pay: "High" },
                { name: "Scale-ups", pain_points: ["Onboarding Velocity", "Broken CI/CD"], willingness_to_pay: "High" }
            ]),
            revenueStreams: JSON.stringify([
                { source: "Enterprise License", model: "Per Seat/Repo", potential_arr: 50000 }
            ])
        },
        description: "An automated governance platform that orchestrates 60+ micro-repositories. It enforces architectural decisions (ADRs), synchronizes CI/CD pipelines, and provides a 'Self-Healing' capability for high-velocity engineering teams."
    },
    'Karbendrop': {
        businessCanvas: {
            valueProposition: JSON.stringify([
                "Instant Event Visualization",
                "User-Generated Campaign Assets",
                "Viral Social Media Integration"
            ]),
            customerSegments: JSON.stringify([
                { name: "Event Organizers", pain_points: ["Cost of Design", "Slow Time-to-Market"], willingness_to_pay: "Medium" },
                { name: "Clubs & Venues", pain_points: ["Engagement", "Brand Consistency"], willingness_to_pay: "Medium" }
            ]),
            revenueStreams: JSON.stringify([
                { source: "Freemium SaaS", model: "Basic/Pro", potential_arr: 20000 }
            ])
        },
        description: "A creative engine for event promotion. Karbendrop allows organizers to generate professional, on-brand visual assets in seconds, leveraging a specialized rendering engine for maximum social media engagement."
    },
    'ACID-MONK-GENERATOR': {
        businessCanvas: {
            valueProposition: JSON.stringify([
                "Guaranteed Data Integrity",
                "Type-Safe Backend Generation",
                "Zero-Runtime Errors"
            ]),
            customerSegments: JSON.stringify([
                { name: "FinTech Startups", pain_points: ["Data Corruption", "Compliance"], willingness_to_pay: "High" },
                { name: "Enterprise Architects", pain_points: ["System Stability", "Schema Drift"], willingness_to_pay: "High" }
            ]),
            revenueStreams: JSON.stringify([
                { source: "Open Core", model: "Support/Enterprise", potential_arr: 30000 }
            ])
        },
        description: "The 'Guardian' of data consistency. A generator framework that enforces ACID principles at the code level, producing strictly typed backend interfaces that eliminate entire classes of runtime errors."
    }
};

async function main() {
    console.log("🚀 Starting Portfolio Enhancement...");

    for (const [repoName, data] of Object.entries(ENHANCEMENTS)) {
        console.log(`\nProcessing ${repoName}...`);

        // Find repo
        const repo = await prisma.repository.findFirst({
            where: { name: { equals: repoName, mode: 'insensitive' } }
        });

        if (!repo) {
            console.warn(`⚠️ Repository ${repoName} not found! Skipping.`);
            continue;
        }

        // Update Repository Description
        await prisma.repository.update({
            where: { id: repo.id },
            data: { description: data.description }
        });
        console.log(`✅ Updated Description`);

        // Update or Create Business Canvas
        await prisma.businessCanvas.upsert({
            where: { repositoryId: repo.id },
            create: {
                repositoryId: repo.id,
                ...data.businessCanvas
            },
            update: {
                ...data.businessCanvas,
                updatedAt: new Date()
            }
        });
        console.log(`✅ Updated Business Canvas`);
    }

    console.log("\n✨ Enhancement Complete! Database is now ready for portfolio generation.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
