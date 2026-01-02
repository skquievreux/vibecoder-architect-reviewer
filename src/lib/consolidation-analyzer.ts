import { Repository, Technology, Capability, BusinessCanvas } from '@prisma/client';

type RepoWithDetails = Repository & {
    technologies: Technology[];
    capabilities: Capability[];
    businessCanvas: BusinessCanvas | null;
};

export function calculateSimilarity(repo1: RepoWithDetails, repo2: RepoWithDetails): number {
    let score = 0;

    // 1. Tech Stack Overlap (40%)
    const tech1 = new Set(repo1.technologies.map(t => t.name));
    const tech2 = new Set(repo2.technologies.map(t => t.name));

    const techIntersection = [...tech1].filter(x => tech2.has(x));
    const techUnion = new Set([...tech1, ...tech2]);

    if (techUnion.size > 0) {
        score += (techIntersection.length / techUnion.size) * 0.4;
    }

    // 2. Capability Overlap (30%)
    const cap1 = new Set(repo1.capabilities.map(c => c.name));
    const cap2 = new Set(repo2.capabilities.map(c => c.name));

    const capIntersection = [...cap1].filter(x => cap2.has(x));
    const capUnion = new Set([...cap1, ...cap2]);

    if (capUnion.size > 0) {
        score += (capIntersection.length / capUnion.size) * 0.3;
    }

    // 3. Customer Segment Overlap (30%)
    const seg1 = repo1.businessCanvas?.customerSegments || '';
    const seg2 = repo2.businessCanvas?.customerSegments || '';

    if (seg1 && seg2 && seg1 === seg2) {
        score += 0.3;
    } else if (seg1 && seg2) {
        // Partial match if any segment overlaps
        const s1Parts = seg1.split(',').map(s => s.trim());
        const s2Parts = seg2.split(',').map(s => s.trim());
        const segIntersection = s1Parts.filter(x => s2Parts.includes(x));

        if (segIntersection.length > 0) {
            score += 0.15; // Partial credit
        }
    }

    return score;
}
