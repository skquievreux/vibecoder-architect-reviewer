const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = 'C:\\CODE\\GIT';

async function main() {
    console.log("🚀 Starting Fast React Upgrade Analysis...\n");

    const dirs = fs.readdirSync(ROOT_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    console.log(`📁 Found ${dirs.length} directories\n`);

    const results = [];
    let processed = 0;

    for (const dir of dirs) {
        processed++;
        const packageJsonPath = path.join(ROOT_DIR, dir, 'package.json');

        // Progress indicator
        if (processed % 10 === 0) {
            process.stdout.write(`\r⏳ Progress: ${processed}/${dirs.length} (${Math.round(processed / dirs.length * 100)}%)`);
        }

        try {
            if (!fs.existsSync(packageJsonPath)) {
                continue;
            }

            const content = fs.readFileSync(packageJsonPath, 'utf8');
            const pkg = JSON.parse(content);
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            if (!deps.react) {
                continue;
            }

            const reactVersion = deps.react || 'N/A';
            const reactDomVersion = deps['react-dom'] || 'N/A';
            const nextVersion = deps.next || 'N/A';

            // Determine Status
            let status = 'UNKNOWN';
            let tier = 'NONE';
            let emoji = '❓';

            // Clean version string (remove ^, ~, >=)
            const cleanVer = reactVersion.replace(/[\^~>=]/g, '');

            if (cleanVer.startsWith('18.') || cleanVer.startsWith('17.') || cleanVer.startsWith('16.')) {
                status = 'CRITICAL';
                tier = 'TIER-1';
                emoji = '🔴';
            } else if (cleanVer.startsWith('19.0') || cleanVer.startsWith('19.1')) {
                status = 'WARNING';
                tier = 'TIER-2';
                emoji = '⚠️';
            } else if (cleanVer.startsWith('19.2') || cleanVer.startsWith('19.3')) {
                status = 'GOOD';
                tier = 'OK';
                emoji = '✅';
            }

            results.push({
                name: dir,
                react: reactVersion,
                reactDom: reactDomVersion,
                next: nextVersion,
                status,
                tier,
                emoji
            });

        } catch (e) {
            // Skip invalid package.json files
            continue;
        }
    }

    console.log(`\r✅ Completed: ${processed}/${dirs.length} (100%)     \n`);

    // Summary
    console.log("\n" + "=".repeat(80));
    console.log("📊 REACT VERSION SUMMARY");
    console.log("=".repeat(80) + "\n");

    const tier1 = results.filter(r => r.tier === 'TIER-1');
    const tier2 = results.filter(r => r.tier === 'TIER-2');
    const good = results.filter(r => r.tier === 'OK');

    console.log(`Total React Projects: ${results.length}`);
    console.log(`✅ React 19.2+ (Latest):           ${good.length}`);
    console.log(`⚠️  React 19.0/19.1 (Minor Update): ${tier2.length}`);
    console.log(`🔴 React ≤18.x (CRITICAL):         ${tier1.length}\n`);

    if (tier1.length > 0) {
        console.log("🔴 CRITICAL UPGRADES NEEDED (React 18.x or older):");
        console.log("-".repeat(80));
        console.table(tier1.map(r => ({
            Project: r.name,
            React: r.react,
            'React-DOM': r.reactDom,
            'Next.js': r.next
        })));
    }

    if (tier2.length > 0) {
        console.log("\n⚠️  RECOMMENDED UPDATES (React 19.0/19.1):");
        console.log("-".repeat(80));
        console.table(tier2.map(r => ({
            Project: r.name,
            React: r.react,
            'React-DOM': r.reactDom,
            'Next.js': r.next
        })));
    }

    if (good.length > 0) {
        console.log("\n✅ UP TO DATE (React 19.2+):");
        console.log("-".repeat(80));
        console.table(good.map(r => ({
            Project: r.name,
            React: r.react,
            'React-DOM': r.reactDom,
            'Next.js': r.next
        })));
    }

    // Export to CSV
    const csvPath = path.join(ROOT_DIR, 'vibecoder-architect-reviewer', 'react-upgrade-analysis.csv');
    const csvContent = [
        'Project,React,React-DOM,Next.js,Status,Tier',
        ...results.map(r => `"${r.name}","${r.react}","${r.reactDom}","${r.next}","${r.status}","${r.tier}"`)
    ].join('\n');

    fs.writeFileSync(csvPath, csvContent);
    console.log(`\n💾 Report saved to: ${csvPath}`);
}

main().catch(console.error);
