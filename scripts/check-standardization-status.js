const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const GIT_ROOT = '/home/ladmin/Desktop/GIT';

async function main() {
    console.log('📊 Generating Standardization Report...\n');

    const repos = await prisma.repository.findMany({
        orderBy: { name: 'asc' }
    });

    console.log('| Repository | OpenAPI Spec | README Standard | Status |');
    console.log('|---|---|---|---|');

    let compliantCount = 0;

    for (const repo of repos) {
        const repoPath = path.join(GIT_ROOT, repo.name);

        if (!fs.existsSync(repoPath)) {
            console.log(`| ${repo.name} | ❓ (Not found) | ❓ | ⚠️ Missing |`);
            continue;
        }

        // 1. Check OpenAPI
        const hasOpenApi = fs.existsSync(path.join(repoPath, 'app/api/openapi.json')) ||
            fs.existsSync(path.join(repoPath, 'public/openapi.json')) ||
            fs.existsSync(path.join(repoPath, 'src/app/api/openapi.json')); // Handle src dir

        // 2. Check README
        const readmePath = path.join(repoPath, 'README.md');
        let hasReadmeStandard = false;
        if (fs.existsSync(readmePath)) {
            const content = fs.readFileSync(readmePath, 'utf-8');
            // Simple heuristic: Check for "API Documentation" section
            if (content.includes('## API Documentation') || content.includes('### API Documentation')) {
                hasReadmeStandard = true;
            }
        }

        const status = (hasOpenApi && hasReadmeStandard) ? '✅ Compliant' : '❌ Action Required';
        if (hasOpenApi && hasReadmeStandard) compliantCount++;

        console.log(`| ${repo.name} | ${hasOpenApi ? '✅' : '❌'} | ${hasReadmeStandard ? '✅' : '❌'} | ${status} |`);
    }

    console.log(`\n**Summary**: ${compliantCount} / ${repos.length} repositories are compliant.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
