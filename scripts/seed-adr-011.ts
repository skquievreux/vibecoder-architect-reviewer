#!/usr/bin/env node
/**
 * Seed ADR-011: Organization-Wide Workflow Templates
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📝 Seeding ADR-011: Organization-Wide Workflow Templates');

    const title = 'ADR-011: Organization-Wide GitHub Actions Workflow Templates';

    const adr = await prisma.architectureDecision.upsert({
        where: { title },
        update: {
            status: 'ACCEPTED',
            context: 'As our development practices mature, we have established standardized GitHub Actions workflows (CI, Release, Dashboard Sync, Ecosystem Guard, Rollout Standards). Currently these exist only in individual repositories, leading to inconsistency, maintenance overhead, and onboarding friction when creating new projects.',
            decision: 'Implement Organization-Wide Workflow Templates using GitHub\'s native .github repository pattern. Create a special .github repository in the organization containing workflow-templates/ directory with .yml files and .properties.json metadata. Templates appear automatically in the Actions tab of new repositories.',
            consequences: 'Positive: Consistency across all new repos, discoverability via GitHub UI, single source of truth for updates, zero external dependencies.\nNegative: Existing repositories won\'t auto-update (need migration guide), repositories can still modify templates after creation.',
            tags: 'GitHub-Actions, CI-CD, Governance, Templates, Organization, DevOps',
        },
        create: {
            title,
            status: 'ACCEPTED',
            context: 'As our development practices mature, we have established standardized GitHub Actions workflows (CI, Release, Dashboard Sync, Ecosystem Guard, Rollout Standards). Currently these exist only in individual repositories, leading to inconsistency, maintenance overhead, and onboarding friction when creating new projects.',
            decision: 'Implement Organization-Wide Workflow Templates using GitHub\'s native .github repository pattern. Create a special .github repository in the organization containing workflow-templates/ directory with .yml files and .properties.json metadata. Templates appear automatically in the Actions tab of new repositories.',
            consequences: 'Positive: Consistency across all new repos, discoverability via GitHub UI, single source of truth for updates, zero external dependencies.\nNegative: Existing repositories won\'t auto-update (need migration guide), repositories can still modify templates after creation.',
            tags: 'GitHub-Actions, CI-CD, Governance, Templates, Organization, DevOps',
        },
    });

    console.log(`✅ ADR-011 seeded successfully: ${adr.title}`);
    console.log(`   ID: ${adr.id}`);
    console.log(`   Status: ${adr.status}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding ADR-011:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
