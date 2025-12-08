const fs = require('fs');
const path = require('path');

const GIT_ROOT = '/home/ladmin/Desktop/GIT';
const SOURCE_FILE = '/home/ladmin/Desktop/GIT/ArchitekturReview/dashboard/.github/workflows/dashboard-sync.yml';

async function main() {
    console.log('🚀 Distributing GitHub Action: dashboard-sync.yml ...');

    if (!fs.existsSync(SOURCE_FILE)) {
        console.error('❌ Source file not found:', SOURCE_FILE);
        return;
    }

    const content = fs.readFileSync(SOURCE_FILE, 'utf-8');
    const repos = fs.readdirSync(GIT_ROOT);
    let successCount = 0;
    let skipCount = 0;

    for (const repo of repos) {
        if (repo.startsWith('.') || repo === 'ArchitekturReview') { // Skip self and hidden
            skipCount++;
            continue;
        }

        const repoPath = path.join(GIT_ROOT, repo);
        if (!fs.lstatSync(repoPath).isDirectory()) continue;

        const workflowsDir = path.join(repoPath, '.github', 'workflows');

        try {
            // Ensure .github/workflows exists
            if (!fs.existsSync(workflowsDir)) {
                fs.mkdirSync(workflowsDir, { recursive: true });
            }

            const targetFile = path.join(workflowsDir, 'dashboard-sync.yml');
            fs.writeFileSync(targetFile, content);
            console.log(`✅ Synced to: ${repo}`);
            successCount++;
        } catch (e) {
            console.error(`❌ Failed to sync to ${repo}:`, e.message);
        }
    }

    console.log(`\n🎉 Distribution Complete.`);
    console.log(`   - Updated: ${successCount} repos`);
    console.log(`   - Skipped: ${skipCount} repos`);
}

main();
