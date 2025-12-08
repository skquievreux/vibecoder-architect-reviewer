const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GIT_ROOT = '/home/ladmin/Desktop/GIT';

function scanRepo(repoName) {
    const repoPath = path.join(GIT_ROOT, repoName);
    const results = {
        name: repoName,
        hasTsConfig: false,
        moduleConfig: null,
        assertUsage: 0,
        riskLevel: 'LOW'
    };

    if (!fs.existsSync(repoPath) || !fs.lstatSync(repoPath).isDirectory()) {
        return null;
    }

    // 1. Check tsconfig.json
    const tsConfigPath = path.join(repoPath, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
        results.hasTsConfig = true;
        try {
            // Simple regex parse to avoid comments issues in JSON
            const content = fs.readFileSync(tsConfigPath, 'utf-8');
            const moduleMatch = content.match(/"module"\s*:\s*"([^"]+)"/);
            if (moduleMatch) {
                results.moduleConfig = moduleMatch[1];
            }
        } catch (e) {
            console.warn(`Error reading tsconfig for ${repoName}:`, e.message);
        }
    }

    // 2. Scan for 'assert {' usage
    // Using grep via execSync for speed and simplicity
    try {
        // Only scan .ts, .tsx, .js, .mjs files
        // Exclude node_modules, .next, dist, build
        const cmd = `grep -r "assert {" "${repoPath}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" --exclude-dir="node_modules" --exclude-dir=".next" --exclude-dir="dist" --exclude-dir="build" | wc -l`;
        const count = parseInt(execSync(cmd, { encoding: 'utf-8' }).trim(), 10);
        results.assertUsage = count;
    } catch (e) {
        // grep returns 1 if no matches, which might throw in execSync depending on options, 
        // but wc -l usually succeeds. If it fails, assume 0 or log.
        results.assertUsage = 0;
    }

    // 3. Assess Risk
    if (results.assertUsage > 0) {
        results.riskLevel = 'CRITICAL'; // Using deprecated syntax
    } else if (results.moduleConfig === 'nodenext' || results.moduleConfig === 'node16') {
        results.riskLevel = 'HIGH'; // Strict ESM enforcement
    } else if (results.moduleConfig === 'esnext') {
        results.riskLevel = 'MEDIUM'; // Potential future issues
    }

    return results;
}

function main() {
    console.log('🔍 Scanning Portfolio for TypeScript 5.8 Risks...');

    let repos;
    try {
        repos = fs.readdirSync(GIT_ROOT);
    } catch (e) {
        console.error("Failed to list GIT_ROOT:", e.message);
        return;
    }

    const risks = [];

    for (const repo of repos) {
        if (repo.startsWith('.')) continue; // Skip hidden
        const result = scanRepo(repo);
        if (result && result.hasTsConfig) {
            if (result.riskLevel !== 'LOW') {
                risks.push(result);
            }
        }
    }

    console.log('\n=== RISK REPORT ===');
    if (risks.length === 0) {
        console.log('✅ No significant risks detected.');
    } else {
        console.log(`⚠️  Found ${risks.length} repositories with potential risks:\n`);
        risks.forEach(r => {
            const icon = r.riskLevel === 'CRITICAL' ? '🔴' : (r.riskLevel === 'HIGH' ? '🟠' : '🟡');
            console.log(`${icon} ${r.name}`);
            console.log(`   Module: ${r.moduleConfig || 'N/A'}`);
            console.log(`   'assert {' usage: ${r.assertUsage} occurrences`);
            console.log('---');
        });
    }
}

main();
