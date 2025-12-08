import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adrs = [
    {
        title: "ADR-001: Next.js 16 Adoption",
        status: "ACCEPTED",
        context: "The ecosystem is moving towards React 19 and Next.js 16. Staying on older versions risks compatibility issues and misses out on performance improvements like the React Compiler.",
        decision: "We will adopt Next.js 16 as the standard framework for all frontend applications. This includes using the App Router and Server Actions.",
        consequences: "Requires Node.js >= 20.9.0. Some older libraries might need updates. Developers need to upskill on Server Components.",
        tags: JSON.stringify(["Frontend", "Next.js", "Standardization"])
    },
    {
        title: "ADR-002: TypeScript Strict Mode",
        status: "ACCEPTED",
        context: "Loose typing leads to runtime errors and makes refactoring difficult. As the codebase grows, maintaining type safety is critical.",
        decision: "All repositories must enable `strict: true` in their `tsconfig.json`. No implicit `any` is allowed.",
        consequences: "Initial migration effort to fix type errors. Slower development speed initially, but higher reliability and better developer experience long-term.",
        tags: JSON.stringify(["Language", "TypeScript", "Quality"])
    },
    {
        title: "ADR-003: Node.js 20 LTS Mandate",
        status: "PROPOSED",
        context: "Next.js 16 requires Node.js >= 20.9.0. Currently, some repos are on v18 or older v20 versions.",
        decision: "Enforce Node.js >= 20.9.0 across all repositories via `engines` field in `package.json` and CI/CD checks.",
        consequences: "All deployment environments (Vercel, Docker) must be updated. Local development environments need to be synced (use `.nvmrc`).",
        tags: JSON.stringify(["Infrastructure", "Node.js", "Compliance"])
    },
    {
        title: "ADR-004: React Compiler Adoption",
        status: "PROPOSED",
        context: "React applications suffer from unnecessary re-renders. Manual memoization (`useMemo`, `useCallback`) is error-prone and clutters code.",
        decision: "Enable the React Compiler (experimental in React 18, stable in 19) to automatically optimize rendering performance.",
        consequences: "Performance improvements of ~12%. Requires strict adherence to React rules. May require code changes if rules were violated.",
        tags: JSON.stringify(["Frontend", "React", "Performance"])
    },
    {
        title: "ADR-005: Tailwind CSS v4 Target",
        status: "PROPOSED",
        context: "Tailwind CSS v4 introduces a new engine and simplified configuration, but is a breaking change from v3.",
        decision: "Target Tailwind CSS v4 for all new projects. Migrate existing projects in waves starting Q1 2026.",
        consequences: "Need to learn new configuration format. Migration scripts might be needed. improved build times.",
        tags: JSON.stringify(["Frontend", "CSS", "Tailwind"])
    },
    {
        title: "ADR-006: Interface Registry Standard",
        status: "PROPOSED",
        context: "We have 173 interface instances (APIs, DB connections) without a central registry, leading to 'API Chaos' and unknown dependencies.",
        decision: "Implement a central Interface Registry (YAML/JSON based) to track all internal and external interfaces.",
        consequences: "Better visibility into system dependencies. Easier impact analysis for changes. Requires discipline to keep registry updated.",
        tags: JSON.stringify(["Architecture", "Governance", "API"])
    },
    {
        title: "ADR-007: Hosting Strategy (Vercel vs. Hetzner)",
        status: "ACCEPTED",
        context: "We need a clear guideline on when to use managed hosting (Vercel) versus self-managed infrastructure (Hetzner) to optimize costs and performance.",
        decision: "Use **Vercel** for frontend applications and static sites (Next.js) to leverage Edge Network and easy CI/CD. Use **Hetzner** (Docker/VPS) for long-running backend services, databases, and heavy compute tasks where control and cost-efficiency are paramount.",
        consequences: "Hybrid infrastructure requires clear networking setup. Backend services on Hetzner must be containerized (Docker).",
        tags: JSON.stringify(["Infrastructure", "Hosting", "Cost"])
    }
];

async function main() {
    console.log(`Start seeding ${adrs.length} ADRs...`);

    for (const adr of adrs) {
        const decision = await prisma.architectureDecision.upsert({
            where: { title: adr.title }, // Assuming title is unique enough for this seed
            update: adr,
            create: adr,
        });
        console.log(`Upserted ADR: ${decision.title}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
