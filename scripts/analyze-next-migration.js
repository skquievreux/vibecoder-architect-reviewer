const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const prisma = new PrismaClient();

// Configuration
const TEMP_DIR = path.join(os.tmpdir(), 'next-migration-analysis');

async function main() {
    console.log("Starting Next.js 16 Migration Analysis...");

    // 1. Fetch Repositories
    const repos = await prisma.repository.findMany();
    console.log(`Found ${repos.length} repositories.`);

    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR);
    }

    const results = [];

    for (const repo of repos) {
        console.log(`\nAnalyzing: ${repo.name}`);
        const repoPath = path.join(TEMP_DIR, repo.name);

        try {
            // Clean up previous run
            if (fs.existsSync(repoPath)) {
                fs.rmSync(repoPath, { recursive: true, force: true });
            }

            // Clone
            // Use HTTPS URL and assume public or auth is handled by environment if needed.
            // For this environment, we rely on public access or existing credentials.
            // Using 'git clone' might fail if private and no creds. 
            // We'll try to use the URL provided in DB.
            execSync(`git clone --depth 1 ${repo.url} ${repoPath}`, { stdio: 'ignore' });

            // Check if Next.js project
            const packageJsonPath = path.join(repoPath, 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                console.log(`  - Skipped: No package.json`);
                continue;
            }

            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            if (!deps.next) {
                console.log(`  - Skipped: Not a Next.js project`);
                continue;
            }

            const nextVersion = deps.next;
            console.log(`  - Next.js Version: ${nextVersion}`);

            // Scan for Breaking Changes
            // 1. cookies() / headers() / params
            // We look for usages in .tsx/.ts files

            const findings = [];

            // Helper to grep
            const grep = (pattern) => {
                try {
                    return execSync(`grep -r "${pattern}" ${repoPath} --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" | head -n 5`).toString().trim();
                } catch (e) {
                    return null;
                }
            };

            if (grep('cookies()')) findings.push('Usage of cookies() (sync)');
            if (grep('headers()')) findings.push('Usage of headers() (sync)');

            // params is harder to grep reliably without AST, but we can look for "params" in page/layout files
            // Simple heuristic: check for "params" in file content of page.tsx/layout.tsx
            // This is a rough check.

            results.push({
                name: repo.name,
                version: nextVersion,
                issues: findings
            });

            if (findings.length > 0) {
                console.log(`  ⚠️  Potential Issues:`);
                findings.forEach(f => console.log(`      - ${f}`));
            } else {
                console.log(`  ✅ Clean (No obvious sync API usage found)`);
            }

        } catch (e) {
            console.error(`  ❌ Error analyzing ${repo.name}: ${e.message}`);
        }
    }

    // Summary
    console.log("\n\n=== SUMMARY ===");
    const affected = results.filter(r => r.issues.length > 0);
    console.log(`Total Next.js Projects: ${results.length}`);
    console.log(`Projects with Potential Issues: ${affected.length}`);

    if (affected.length > 0) {
        console.log("\nProjects requiring attention:");
        affected.forEach(r => {
            console.log(`- ${r.name} (${r.version})`);
            r.issues.forEach(i => console.log(`    ${i}`));
        });
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
