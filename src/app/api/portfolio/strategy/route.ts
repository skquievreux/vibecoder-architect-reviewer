import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const repos = await prisma.repository.findMany({
            include: {
                businessCanvas: true,
                health: true,
                technologies: true
            }
        });

        const strategyData = repos.map(repo => {
            // 1. Calculate Business Value Score (0-100)
            // Heuristic: More defined canvas items = higher business clarity/value
            let businessValue = 0;
            if (repo.businessCanvas) {
                const parse = (json: string | null) => {
                    try { return JSON.parse(json || '[]'); } catch { return []; }
                };

                const rs = parse(repo.businessCanvas.revenueStreams).length;
                const cs = parse(repo.businessCanvas.customerSegments).length;
                const vp = parse(repo.businessCanvas.valueProposition).length;

                // Weighting: Revenue Streams are most important
                businessValue = (rs * 20) + (cs * 10) + (vp * 5);
            }

            // Cap at 100, but allow 0
            businessValue = Math.min(100, Math.max(0, businessValue));
            // If no canvas, give a small baseline if it has a description (potential value)
            if (businessValue === 0 && repo.description) businessValue = 10;


            // 2. Calculate Technical Health Score (0-100)
            // Default to 50 (neutral) if no health data
            let technicalHealth = 50;
            if (repo.health) {
                // Start perfect
                let score = 100;

                // Penalize for outdated dependencies
                score -= (repo.health.outdatedDependenciesCount || 0) * 2;

                // Penalize heavily for vulnerabilities
                score -= (repo.health.vulnerabilitiesCount || 0) * 5;

                // Use explicit healthScore if available and lower than calculated
                if (repo.health.healthScore !== null) {
                    score = Math.min(score, repo.health.healthScore);
                }

                technicalHealth = Math.min(100, Math.max(0, score));
            } else {
                // No health data? Check age. Old repos without updates might be "rotting"
                const daysSincePush = repo.pushedAt ? Math.floor((Date.now() - new Date(repo.pushedAt).getTime()) / (1000 * 60 * 60 * 24)) : 365;
                if (daysSincePush > 180) technicalHealth -= 20; // Penalize inactivity
            }

            // Determine Quadrant
            let quadrant = "";
            if (businessValue >= 50 && technicalHealth >= 70) quadrant = "Star";
            else if (businessValue >= 50 && technicalHealth < 70) quadrant = "Critical Risk";
            else if (businessValue < 50 && technicalHealth >= 70) quadrant = "Cash Cow";
            else quadrant = "Zombie";

            return {
                id: repo.id,
                name: repo.name,
                description: repo.description,
                businessValue,
                technicalHealth,
                quadrant,
                metrics: {
                    revenueStreams: repo.businessCanvas ? JSON.parse(repo.businessCanvas.revenueStreams || '[]').length : 0,
                    vulnerabilities: repo.health?.vulnerabilitiesCount || 0,
                    outdatedDeps: repo.health?.outdatedDependenciesCount || 0
                }
            };
        });

        return NextResponse.json({ data: strategyData });
    } catch (error) {
        console.error("Failed to calculate strategy metrics:", error);
        return NextResponse.json({ error: "Failed to calculate metrics" }, { status: 500 });
    }
}
