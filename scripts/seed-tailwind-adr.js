const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('📝 Seeding Tailwind ADR...');

    const adr = await prisma.architectureDecision.create({
        data: {
            title: "Tailwind CSS Migration Moratorium",
            status: "ACCEPTED",
            context: "In the past, a migration to a newer version of Tailwind CSS (likely v4 or a major v3 update) was attempted. This attempt resulted in significant incompatibilities and breaking changes within the project structure, specifically regarding configuration and integration with existing UI libraries.",
            decision: "We will **NOT** proceed with the Tailwind CSS migration at this time. The project will remain on the current stable version to ensure compatibility and stability. Any future migration attempts must be preceded by a comprehensive impact analysis and a dedicated refactoring plan.",
            consequences: "**Positive:**\n*   Immediate stability of the frontend build pipeline.\n*   Avoidance of regression bugs in UI components.\n\n**Negative:**\n*   Inability to use the latest Tailwind CSS features and optimizations.\n*   Potential accumulation of technical debt as the current version ages.",
            tags: JSON.stringify(["tailwind", "css", "migration", "risk", "frontend"])
        }
    });

    console.log(`✅ Created ADR: ${adr.title}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
