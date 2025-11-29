const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const prisma = new PrismaClient();

// Configuration
const TEMP_DIR = path.join(os.tmpdir(), 'react-upgrade-analysis');

async function main() {
    console.log("Starting React 19.2 Upgrade Analysis...");

    // 1. Fetch Repositories
    const repos = await prisma.repository.findMany();
    console.log(`Found ${repos.length} repositories.`);

    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR);
    }

    const results = [];

    for (const repo of repos) {
        // console.log(`\nAnalyzing: ${repo.name}`);
        const repoPath = path.join(TEMP_DIR, repo.name);

        try {
            // Clean up previous run
            if (fs.existsSync(repoPath)) {
                fs.rmSync(repoPath, { recursive: true, force: true });
            }

            // Clone
            try {
                execSync(`git clone --depth 1 ${repo.url} ${repoPath}`, { stdio: 'ignore' });
            } catch (cloneError) {
                // console.log(`  - Skipped: Clone failed`);
                continue;
            }

            // Check package.json
            const packageJsonPath = path.join(repoPath, 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                // console.log(`  - Skipped: No package.json`);
                continue;
            }

            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            if (!deps.react) {
                // console.log(`  - Skipped: Not a React project`);
                continue;
            }

            const reactVersion = deps.react;
            const reactDomVersion = deps['react-dom'];

            // Determine Status
            let status = 'UNKNOWN';
            let tier = 'NONE';

            // Clean version string (remove ^, ~)
            const cleanVer = reactVersion.replace(/[\^~]/g, '');

            if (cleanVer.startsWith('18.') || cleanVer.startsWith('17.') || cleanVer.startsWith('16.')) {
                status = 'CRITICAL';
                tier = 'TIER-1';
            } else if (cleanVer.startsWith('19.0') || cleanVer.startsWith('19.1')) {
                status = 'WARNING';
                tier = 'TIER-2';
            } else if (cleanVer.startsWith('19.2') || cleanVer.startsWith('19.3')) {
                status = 'GOOD';
                tier = 'OK';
            }

            results.push({
                name: repo.name,
                version: reactVersion,
                domVersion: reactDomVersion,
                status,
                tier
            });

            // console.log(`  - React: ${reactVersion} [${status}]`);

        } catch (e) {
            // console.error(`  ❌ Error analyzing ${repo.name}: ${e.message}`);
        }
    }

    // Summary
    console.log("\n\n=== REACT VERSION SUMMARY ===");

    const tier1 = results.filter(r => r.tier === 'TIER-1');
    const tier2 = results.filter(r => r.tier === 'TIER-2');
    const good = results.filter(r => r.tier === 'OK');

    console.log(`Total React Projects: ${results.length}`);
    console.log(`✅ React 19.2+ (Optimized): ${good.length}`);
    console.log(`⚠️  React 19.0/19.1 (Update needed): ${tier2.length}`);
    console.log(`🔴 React 18.x (CRITICAL - Missing Perf): ${tier1.length}`);

    if (tier1.length > 0) {
        console.log("\n🔴 CRITICAL UPGRADES NEEDED (Tier 1):");
        console.table(tier1.map(r => ({ Repo: r.name, Version: r.version })));
    }

    if (tier2.length > 0) {
        console.log("\n⚠️  Recommended Updates (Tier 2):");
        console.table(tier2.map(r => ({ Repo: r.name, Version: r.version })));
    }

    // Cleanup
    if (fs.existsSync(TEMP_DIR)) {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
