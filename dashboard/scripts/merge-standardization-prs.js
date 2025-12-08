
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

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

function request(url, method = 'GET', data = null, token) {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'VibeCoder-Dashboard',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(body)); } catch (e) { resolve({}); }
                } else {
                    reject({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function main() {
    console.log("🚀 Starting Batch Merge for Standardization PRs...");
    const token = process.env.GITHUB_TOKEN;
    if (!token) { console.error("Missing GITHUB_TOKEN"); process.exit(1); }

    const repos = await prisma.repository.findMany({});
    const owner = 'skquievreux';

    let merged = 0;
    let failed = 0;

    for (const repo of repos) {
        if (!repo.name) continue;
        console.log(`Checking ${repo.name}...`);

        try {
            // List Open PRs
            const prs = await request(`https://api.github.com/repos/${owner}/${repo.name}/pulls?state=open`, 'GET', null, token);

            if (Array.isArray(prs)) {
                const targets = prs.filter(p =>
                    p.title.toLowerCase().includes('standardize') ||
                    p.title.toLowerCase().includes('chore') ||
                    p.title.toLowerCase().includes('ecosystem')
                );

                for (const pr of targets) {
                    process.stdout.write(`   Merging #${pr.number} (${pr.title})... `);
                    try {
                        await request(
                            `https://api.github.com/repos/${owner}/${repo.name}/pulls/${pr.number}/merge`,
                            'PUT',
                            { merge_method: 'squash', commit_title: `${pr.title} (#${pr.number})` },
                            token
                        );
                        console.log("✅ Merged");
                        merged++;
                    } catch (e) {
                        console.log(`❌ Failed (${e.status})`);
                        // console.log(e.body);
                        failed++;
                    }
                }
            }
        } catch (e) {
            // console.error(`   Error access: ${e.status}`);
        }
    }

    console.log(`\n--- Batch Merge Complete ---`);
    console.log(`Merged: ${merged}`);
    console.log(`Failed: ${failed}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
