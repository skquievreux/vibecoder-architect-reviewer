
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Define standard structures
// ValueProposition: string[]
// CustomerSegment: { name: string, willingness_to_pay?: string, pain_points?: string[] }[]
// RevenueStream: { source: string, model?: string, potential_arr?: number, effort?: string }[]
// CostStructure: { service: string, amount: number, isTotal?: boolean }[]

async function standardize() {
    console.log("Starting Business Canvas standardization...");
    const canvases = await prisma.businessCanvas.findMany();
    let updatedCount = 0;

    for (const canvas of canvases) {
        let needsUpdate = false;
        const updates = {};

        // 1. Value Proposition
        try {
            let vp = JSON.parse(canvas.valueProposition || '[]');
            if (!Array.isArray(vp)) vp = [vp];

            // Normalize: Ensure all items are strings
            const normalizedVp = vp.map(item => {
                if (typeof item === 'string') return item;
                if (typeof item === 'object') return item.title || item.name || JSON.stringify(item);
                return String(item);
            });

            if (JSON.stringify(normalizedVp) !== JSON.stringify(vp)) {
                updates.valueProposition = JSON.stringify(normalizedVp);
                needsUpdate = true;
            }
        } catch (e) {
            console.error(`Error parsing VP for ${canvas.id}:`, e.message);
            updates.valueProposition = '[]';
            needsUpdate = true;
        }

        // 2. Customer Segments
        try {
            let cs = JSON.parse(canvas.customerSegments || '[]');
            if (!Array.isArray(cs)) cs = [cs];

            const normalizedCs = cs.map(item => {
                if (typeof item === 'string') return { name: item };
                if (typeof item === 'object') {
                    return {
                        name: typeof item.name === 'string' ? item.name : 'Unknown Segment',
                        willingness_to_pay: typeof item.willingness_to_pay === 'string' ? item.willingness_to_pay : (item.willingness_to_pay ? JSON.stringify(item.willingness_to_pay) : undefined),
                        pain_points: Array.isArray(item.pain_points) ? item.pain_points.map(p => typeof p === 'string' ? p : JSON.stringify(p)) : []
                    };
                }
                return { name: String(item) };
            });

            if (JSON.stringify(normalizedCs) !== JSON.stringify(cs)) {
                updates.customerSegments = JSON.stringify(normalizedCs);
                needsUpdate = true;
            }
        } catch (e) {
            console.error(`Error parsing CS for ${canvas.id}:`, e.message);
            updates.customerSegments = '[]';
            needsUpdate = true;
        }

        // 3. Revenue Streams
        try {
            let rs = JSON.parse(canvas.revenueStreams || '[]');
            if (!Array.isArray(rs)) rs = [rs];

            const normalizedRs = rs.map(item => {
                if (typeof item === 'string') return { source: item };
                if (typeof item === 'object') {
                    return {
                        source: typeof item.source === 'string' ? item.source : 'Unknown Source',
                        model: typeof item.model === 'string' ? item.model : undefined,
                        potential_arr: typeof item.potential_arr === 'number' ? item.potential_arr : undefined,
                        effort: typeof item.effort === 'string' ? item.effort : undefined
                    };
                }
                return { source: String(item) };
            });

            if (JSON.stringify(normalizedRs) !== JSON.stringify(rs)) {
                updates.revenueStreams = JSON.stringify(normalizedRs);
                needsUpdate = true;
            }
        } catch (e) {
            console.error(`Error parsing RS for ${canvas.id}:`, e.message);
            updates.revenueStreams = '[]';
            needsUpdate = true;
        }

        // 4. Cost Structure
        try {
            let cost = JSON.parse(canvas.costStructure || '[]');
            if (!Array.isArray(cost)) cost = [cost];

            const normalizedCost = cost.map(item => {
                if (typeof item === 'string') return { service: item, amount: 0 };
                if (typeof item === 'object') {
                    return {
                        service: typeof item.service === 'string' ? item.service : 'Unknown Service',
                        amount: typeof item.amount === 'number' ? item.amount : 0,
                        isTotal: !!item.isTotal
                    };
                }
                return { service: String(item), amount: 0 };
            });

            if (JSON.stringify(normalizedCost) !== JSON.stringify(cost)) {
                updates.costStructure = JSON.stringify(normalizedCost);
                needsUpdate = true;
            }
        } catch (e) {
            console.error(`Error parsing Cost for ${canvas.id}:`, e.message);
            updates.costStructure = '[]';
            needsUpdate = true;
        }

        if (needsUpdate) {
            await prisma.businessCanvas.update({
                where: { id: canvas.id },
                data: updates
            });
            updatedCount++;
            process.stdout.write('.');
        }
    }

    console.log(`\nStandardization complete. Updated ${updatedCount} records.`);
}

standardize()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
