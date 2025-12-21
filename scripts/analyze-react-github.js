const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();

// GitHub API Helper - fetches package.json from GitHub
function fetchGitHubFile(repoUrl) {
    return new Promise((resolve, reject) => {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return reject(new Error('Invalid GitHub URL'));

        const [, owner, repo] = match;
        const tryBranch = (branch) => {
            const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`;
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else if (branch === 'main') {
                        tryBranch('master'); // Fallback to master
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
            }).on('error', reject);
        };
        tryBranch('main');
    });
}

async function main() {
    console.log("🚀 Fetching React versions from GitHub (live data)...\n");

    const repos = await prisma.repository.findMany({
        select: { id: true, name: true, url: true }
    });

    console.log(`📁 Analyzing ${repos.length} repositories\n`);

    const results = [];
    let processed = 0;

    for (const repo of repos) {
        processed++;
        if (processed % 5 === 0) {
            process.stdout.write(`\r⏳ ${processed}/${repos.length} (${Math.round(processed / repos.length * 100)}%)`);
        }

        try {
            const packageJson = await fetchGitHubFile(repo.url);
            const pkg = JSON.parse(packageJson);
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            if (!deps.react) continue;

            const react = deps.react || 'N/A';
            const cleanVer = react.replace(/[\^~>=]/g, '');

            let tier = 'OK';
            if (cleanVer.startsWith('18.') || cleanVer.startsWith('17.') || cleanVer.startsWith('16.')) {
                tier = 'TIER-1';
            } else if (cleanVer.startsWith('19.0') || cleanVer.startsWith('19.1')) {
                tier = 'TIER-2';
            }

            results.push({
                name: repo.name,
                react,
                reactDom: deps['react-dom'] || 'N/A',
                next: deps.next || 'N/A',
                tier
            });
        } catch (e) {
            continue;
        }
    }

    console.log(`\r✅ Complete: ${processed}/${repos.length}     \n`);

    const tier1 = results.filter(r => r.tier === 'TIER-1');
    const tier2 = results.filter(r => r.tier === 'TIER-2');
    const good = results.filter(r => r.tier === 'OK');

    console.log("\n" + "=".repeat(80));
    console.log("📊 REACT UPGRADE ANALYSIS (Live from GitHub)");
    console.log("=".repeat(80) + "\n");
    console.log(`Total: ${results.length} | ✅ 19.2+: ${good.length} | ⚠️ 19.0/19.1: ${tier2.length} | 🔴 ≤18.x: ${tier1.length}\n`);

    if (tier1.length > 0) {
        console.log("🔴 CRITICAL (React ≤18.x):");
        console.table(tier1.map(r => ({ Project: r.name, React: r.react, Next: r.next })));
    }

    if (tier2.length > 0) {
        console.log("\n⚠️ UPDATE RECOMMENDED (React 19.0/19.1):");
        console.table(tier2.map(r => ({ Project: r.name, React: r.react, Next: r.next })));
    }

    await prisma.$disconnect();
}

main().catch(console.error);
