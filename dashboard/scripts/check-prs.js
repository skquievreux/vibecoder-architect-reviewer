
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    }
}

const prisma = new PrismaClient();

function fetchUrl(url, token) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'VibeCoder-Dashboard'
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
                } else {
                    resolve([]); // Treat errors as empty for now to continue loop
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log("🔍 Scanning for Open PRs (JS)...");
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error("❌ GITHUB_TOKEN missing");
        process.exit(1);
    }

    const repos = await prisma.repository.findMany({});

    let totalPrs = 0;
    const targets = [];

    const owner = 'skquievreux'; // Known owner

    for (const repo of repos) {
        if (!repo.name) continue;
        const url = `https://api.github.com/repos/${owner}/${repo.name}/pulls?state=open&per_page=100`;

        // process.stdout.write(`Checking ${repo.name}... `);
        const prs = await fetchUrl(url, token);

        if (Array.isArray(prs)) {
            const ourPrs = prs.filter(p =>
                p.title.toLowerCase().includes('standardize') ||
                p.title.toLowerCase().includes('chore') ||
                p.title.toLowerCase().includes('ecosystem')
            );

            if (ourPrs.length > 0) {
                console.log(`\n📦 ${repo.name}: ${ourPrs.length} PRs`);
                ourPrs.forEach(pr => {
                    console.log(`   - #${pr.number}: ${pr.title}`);
                    targets.push({ owner, repo: repo.name, number: pr.number, title: pr.title });
                });
                totalPrs += ourPrs.length;
            }
        }
    }

    console.log(`\n\n--- Summary ---`);
    console.log(`Total Standardization PRs: ${totalPrs}`);

    if (targets.length > 0) {
        fs.writeFileSync('pr-merge-plan.json', JSON.stringify(targets, null, 2));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
