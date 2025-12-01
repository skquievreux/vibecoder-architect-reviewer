const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GIT_ROOT = '/home/ladmin/Desktop/GIT';
const GENERATOR_SOURCE = '/home/ladmin/Desktop/GIT/ArchitekturReview/dashboard/scripts/generate-openapi.js';

async function main() {
    console.log('🚀 Distributing & Running OpenAPI Generator...');

    if (!fs.existsSync(GENERATOR_SOURCE)) {
        console.error('❌ Source generator not found:', GENERATOR_SOURCE);
        return;
    }

    const generatorContent = fs.readFileSync(GENERATOR_SOURCE, 'utf-8');
    const repos = fs.readdirSync(GIT_ROOT);
    let successCount = 0;

    for (const repo of repos) {
        if (repo.startsWith('.') || repo === 'ArchitekturReview') continue;

        const repoPath = path.join(GIT_ROOT, repo);
        if (!fs.lstatSync(repoPath).isDirectory()) continue;

        // Check if it's a Next.js app (has package.json with next)
        const packageJsonPath = path.join(repoPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) continue;

        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const isNext = pkg.dependencies?.next || pkg.devDependencies?.next;

            if (!isNext) {
                console.log(`⏩ Skipping ${repo} (Not a Next.js app)`);
                continue;
            }

            // 1. Create scripts dir
            const scriptsDir = path.join(repoPath, 'scripts');
            if (!fs.existsSync(scriptsDir)) {
                fs.mkdirSync(scriptsDir, { recursive: true });
            }

            // 2. Copy Generator
            const targetFile = path.join(scriptsDir, 'generate-openapi.js');
            fs.writeFileSync(targetFile, generatorContent);

            // 3. Run Generator
            console.log(`⚙️  Running generator in ${repo}...`);
            try {
                execSync('node scripts/generate-openapi.js', { cwd: repoPath, stdio: 'pipe' });
                console.log(`✅ Generated openapi.json for ${repo}`);
                successCount++;
            } catch (err) {
                console.log(`⚠️  Failed to generate for ${repo} (likely no API routes)`);
            }

        } catch (e) {
            console.error(`❌ Error processing ${repo}:`, e.message);
        }
    }

    console.log(`\n🎉 Batch Generation Complete.`);
    console.log(`   - Successful: ${successCount}`);
}

main();
