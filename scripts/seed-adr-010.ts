
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding ADR-010: GitHub Actions Governance...");

    const adrContent = fs.readFileSync(path.join(process.cwd(), 'docs/adr/010-github-actions-governance.md'), 'utf-8');

    const title = "CI/CD & Governance via GitHub Actions";
    const decisionText = `
1. **Semantic Release** for automated versioning/changelogs.
2. **Ecosystem Guard** workflow enforces Node 20+, TS 5.8+, Supabase 2.49+.
3. **Conventional Commits** are mandatory.
`.trim();

    try {
        const adr = await prisma.architectureDecision.upsert({
            where: { id: 'ADR-010' },
            update: {
                title: title,
                decision: decisionText,
                status: 'ACCEPTED',
                tags: 'CI-CD, GITHUB-ACTIONS, GOVERNANCE, AUTOMATION',
                context: adrContent,
                consequences: "See Context for full details."
            },
            create: {
                id: 'ADR-010',
                title: title,
                status: 'ACCEPTED',
                decision: decisionText,
                tags: 'CI-CD, GITHUB-ACTIONS, GOVERNANCE, AUTOMATION',
                context: adrContent,
                consequences: "See Context for full details.",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        console.log(`✅ ADR-010 Created/Updated: ${adr.title}`);
    } catch (e: any) {
        console.error("❌ ERROR SEEDING ADR-010:");
        console.error(e.message);
        if (e.meta) console.error("Prisma Meta:", e.meta);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
