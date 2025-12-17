
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding ADR-009: Local Database Strategy...");

    const adrContent = fs.readFileSync(path.join(process.cwd(), 'docs/adr/009-local-database-strategy.md'), 'utf-8');

    // Extract logical decision sections (simplified)
    const title = "Local Database Development Strategy";
    const decisionText = `
1. **Default to SQLite** for simple local dev.
2. **Use Dockerized PostgreSQL** for feature parity.
3. **Use Prisma Migrate** for all schema changes.
`.trim();

    try {
        const adr = await prisma.architectureDecision.upsert({
            where: { id: 'ADR-009' },
            update: {
                title: title,
                status: 'ACCEPTED',
                tags: 'DATABASE, PRISMA, LOCAL-DEV, DOCKER',
                context: adrContent, // Mapping full content to context as per current schema limitations
                decision: decisionText,
                consequences: "See Context for full details."
            },
            create: {
                id: 'ADR-009',
                title: title,
                status: 'ACCEPTED',
                decision: decisionText,
                context: adrContent,
                consequences: "See Context for full details.",
                tags: 'DATABASE, PRISMA, LOCAL-DEV, DOCKER',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        console.log(`✅ ADR-009 Created/Updated: ${adr.title}`);
    } catch (e: any) {
        console.error("❌ ERROR SEEDING ADR-009:");
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
