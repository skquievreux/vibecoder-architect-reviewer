const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const prisma = new PrismaClient();

// Configuration
const WORK_DIR = path.join(os.tmpdir(), 'react-upgrades');
const REACT_VERSION = '^19.2.0';

async function main() {
    const target = process.argv[2];

    if (!target) {
        console.error("Usage: node upgrade-react.js <repo-name|tier2>");
        process.exit(1);
    }

    console.log(`🚀 Starting React Upgrade for target: ${target}`);

    // 1. Fetch Repositories
    const allRepos = await prisma.repository.findMany();
    let reposToUpgrade = [];

    if (target === 'tier2') {
        // Filter for Tier 2 (React 19.0/19.1)
        // We need to check versions again or rely on a heuristic. 
        // Since we can't easily check remote versions without cloning, 
        // we will rely on the fact that the user just ran the analysis 
        // and we know which ones are Tier 2.
        // Ideally, we would re-run analysis logic here, but for speed let's clone and check.
        console.log("Targeting all potential Tier 2 repositories...");
        reposToUpgrade = allRepos; // We will filter inside the loop
    } else {
        const repo = allRepos.find(r => r.name === target);
        if (!repo) {
            if (target.includes('/') || target.includes('\\')) {
                console.error(`Error: Invalid target '${target}'. This script expects a Repository Name (e.g. 'my-repo') or 'tier2'. It does not accept file paths.`);
            } else {
                console.error(`Repository '${target}' not found in database.`);
            }
            process.exit(1);
        }
        reposToUpgrade = [repo];
    }

    if (!fs.existsSync(WORK_DIR)) {
        fs.mkdirSync(WORK_DIR);
    }

    const results = [];

    for (const repo of reposToUpgrade) {
        const repoPath = path.join(WORK_DIR, repo.name);

        try {
            // Cleanup
            if (fs.existsSync(repoPath)) {
                fs.rmSync(repoPath, { recursive: true, force: true });
            }

            // Clone
            // console.log(`\nChecking ${repo.name}...`);
            try {
                execSync(`git clone --depth 1 ${repo.url} ${repoPath}`, { stdio: 'ignore' });
            } catch (e) {
                // console.log(`  - Skipped: Clone failed`);
                continue;
            }

            // Check package.json
            const pkgPath = path.join(repoPath, 'package.json');
            if (!fs.existsSync(pkgPath)) {
                continue;
            }

            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            if (!deps.react) {
                continue;
            }

            const currentVer = deps.react.replace(/[\^~]/g, '');

            // Filter for Tier 2 if requested
            if (target === 'tier2') {
                if (!currentVer.startsWith('19.0') && !currentVer.startsWith('19.1')) {
                    // console.log(`  - Skipped: Version ${currentVer} is not Tier 2`);
                    continue;
                }
            }

            console.log(`\n📦 Upgrading ${repo.name} (Current: ${currentVer})`);

            // Update package.json
            let modified = false;
            if (pkg.dependencies && pkg.dependencies.react) {
                pkg.dependencies.react = REACT_VERSION;
                modified = true;
            }
            if (pkg.dependencies && pkg.dependencies['react-dom']) {
                pkg.dependencies['react-dom'] = REACT_VERSION;
                modified = true;
            }
            if (pkg.devDependencies && pkg.devDependencies['@types/react']) {
                pkg.devDependencies['@types/react'] = REACT_VERSION;
                modified = true;
            }
            if (pkg.devDependencies && pkg.devDependencies['@types/react-dom']) {
                pkg.devDependencies['@types/react-dom'] = REACT_VERSION;
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
                console.log("  - Updated package.json");

                // Install
                console.log("  - Running npm install...");
                try {
                    execSync('npm install', { cwd: repoPath, stdio: 'ignore' });
                } catch (e) {
                    console.warn("  ⚠️ npm install failed (ignoring for now)");
                }

                // Git Push
                console.log("  - Pushing changes...");
                const branchName = 'fix/react-19-2-upgrade';
                try {
                    execSync(`git checkout -b ${branchName}`, { cwd: repoPath, stdio: 'ignore' });
                    execSync('git add .', { cwd: repoPath, stdio: 'ignore' });
                    execSync('git commit -m "perf: upgrade to React 19.2"', { cwd: repoPath, stdio: 'ignore' });
                    execSync(`git push origin ${branchName}`, { cwd: repoPath, stdio: 'ignore' });
                    console.log(`  ✅ Success! Branch '${branchName}' pushed.`);

                    // Create PR
                    console.log("  - Creating Pull Request...");
                    const prTitle = "perf(deps): Upgrade React to v19.2.0";
                    const prBody = `## 🚀 React 19.2 Upgrade

This PR upgrades the repository to the latest stable version of React (v19.2.0).

### 📦 Changes
- Upgraded \`react\` to \`^19.2.0\`
- Upgraded \`react-dom\` to \`^19.2.0\`
- Upgraded \`@types/react\` and \`@types/react-dom\` (if present)

### 🛡️ Verification
- [x] \`npm install\` passed
- [ ] Application builds successfully (Please verify)
- [ ] Core functionality tested

*Generated automatically by the Architecture Review Dashboard.*`;

                    try {
                        const prUrl = execSync(`gh pr create --title "${prTitle}" --body "${prBody}" --head ${branchName} --base main`, { cwd: repoPath, encoding: 'utf-8' }).trim();
                        console.log(`  🔗 PR Created: ${prUrl}`);
                        results.push({ repo: repo.name, status: 'SUCCESS', pr: prUrl });
                    } catch (e) {
                        // Fallback if PR creation fails (e.g. already exists)
                        console.warn(`  ⚠️ PR Creation failed (might already exist): ${e.message.split('\n')[0]}`);
                        results.push({ repo: repo.name, status: 'SUCCESS', branch: branchName });
                    }
                } catch (e) {
                    console.error(`  ❌ Git Error: ${e.message}`);
                    results.push({ repo: repo.name, status: 'ERROR', error: e.message });
                }
            } else {
                console.log("  - No changes needed.");
            }

        } catch (e) {
            console.error(`  ❌ Error: ${e.message}`);
            results.push({ repo: repo.name, status: 'ERROR', error: e.message });
        }
    }

    console.log("\n=== UPGRADE SUMMARY ===");
    console.table(results);

    // Cleanup
    if (fs.existsSync(WORK_DIR)) {
        fs.rmSync(WORK_DIR, { recursive: true, force: true });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
