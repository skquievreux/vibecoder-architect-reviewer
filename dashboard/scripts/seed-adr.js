const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding TypeScript 5.8 ADR...');

    const adr = await prisma.architectureDecision.create({
        data: {
            title: 'TypeScript 5.8 Adoption Policy',
            status: 'ACCEPTED',
            tags: '["typescript", "security", "modules"]',
            context: `
TypeScript 5.8 introduces breaking changes regarding ESM/CommonJS interoperability, specifically with the \`--module nodenext\` flag. 
Key risks include:
- \`require("esm")\` is allowed but top-level await fails.
- Import Assertions (\`assert { type: "json" }\`) are deprecated/removed in favor of Import Attributes (\`with { type: "json" }\`).
            `,
            decision: `
We will adopt TypeScript 5.8 but mitigate risks by:
1. Using \`--module esnext\` where possible to avoid strict \`nodenext\` breaking changes for now.
2. Migrating all \`assert { ... }\` syntax to \`with { ... }\`.
3. Running build verification on all repos before upgrading.
            `,
            consequences: `
- **Positive**: Access to new TS features (performance, type safety).
- **Negative**: Potential build breaks if legacy syntax is used.
- **Action**: All new projects must use \`with\` syntax for JSON imports.
            `
        }
    });

    console.log('Created ADR:', adr.title);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
