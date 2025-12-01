const fs = require('fs');
const path = require('path');

const GIT_ROOT = '/home/ladmin/Desktop/GIT';

async function main() {
    console.log('🔍 Verifying GitHub Action Distribution...');

    const repos = fs.readdirSync(GIT_ROOT);
    let missingCount = 0;
    let presentCount = 0;

    for (const repo of repos) {
        if (repo.startsWith('.') || repo === 'ArchitekturReview') continue;

        const repoPath = path.join(GIT_ROOT, repo);
        if (!fs.lstatSync(repoPath).isDirectory()) continue;

        const workflowPath = path.join(repoPath, '.github', 'workflows', 'dashboard-sync.yml');

        if (fs.existsSync(workflowPath)) {
            presentCount++;
        } else {
            console.log(`⚠️  Missing in: ${repo}`);
            missingCount++;
        }
    }

    console.log(`\n📊 Status:`);
    console.log(`   - Present: ${presentCount}`);
    console.log(`   - Missing: ${missingCount}`);

    if (missingCount === 0) {
        console.log('✅ All repositories are covered.');
    }
}

main();
