
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const adrDir = path.join(process.cwd(), 'docs', 'adr');

    if (!fs.existsSync(adrDir)) {
        console.error(`ADR directory not found at ${adrDir}`);
        return;
    }

    const files = fs.readdirSync(adrDir).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} ADRs to sync...`);

    for (const file of files) {
        const filePath = path.join(adrDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Parse Title (First # header)
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : file.replace('.md', '');

        // Parse Status
        const statusMatch = content.match(/Status:\s*(\w+)/i);
        // Default to PROPOSED if not found, usually Accepted or Proposed
        let status = statusMatch ? statusMatch[1].toUpperCase() : 'PROPOSED';

        // Normalize Status for DB Enum if needed (assuming String in schema)
        // Schema says: default("PROPOSED")

        // Context, Decision, Consequences usually sections.
        // For simplicity, we might store the whole content in 'context' 
        // OR extend the schema to store 'content' (which we preferred earlier).
        // Let's check schema for ArchitectureDecision.
        // It has: context, decision, consequences. It does NOT have 'content'.

        // Simple parser to split mapped sections
        const context = parseSection(content, 'Context') || content.substring(0, 500);
        const decision = parseSection(content, 'Decision') || "See full text";
        const consequences = parseSection(content, 'Consequences') || "See full text";

        // Since schema requires non-null context, decision, consequences

        try {
            await prisma.architectureDecision.upsert({
                where: { title: title },
                update: {
                    status,
                    context,
                    decision,
                    consequences,
                    tags: "imported"
                },
                create: {
                    title,
                    status,
                    context,
                    decision,
                    consequences,
                    tags: "imported"
                }
            });
            console.log(`✅ Synced: ${title}`);
        } catch (e) {
            console.error(`❌ Failed to sync ${file}:`, e);
        }
    }
}

function parseSection(content: string, sectionName: string): string | null {
    const regex = new RegExp(`##\\s*${sectionName}[\\s\\S]*?(?=##|$)`, 'i');
    const match = content.match(regex);
    if (match) {
        return match[0].replace(new RegExp(`##\\s*${sectionName}`, 'i'), '').trim();
    }
    return null;
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
