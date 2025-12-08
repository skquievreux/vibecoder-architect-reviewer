
const https = require('https');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
try {
    if (fs.existsSync(envPath)) {
        console.log(`Loading .env from ${envPath}`);
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                process.env[key] = value;
            }
        });
    } else {
        console.error(".env file not found at", envPath);
    }
} catch (e) {
    console.error("Error loading .env", e);
}

function request(url, token) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'VibeCoder-Dashboard'
            }
        };
        https.get(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

async function main() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) { console.error("No GITHUB_TOKEN"); return; }

    const owner = 'skquievreux';
    const repo = 'ACID-MONK-GENERATOR';

    console.log(`Fetching deployments for ${owner}/${repo}...`);

    // 1. Get Deployments
    const deployments = await request(`https://api.github.com/repos/${owner}/${repo}/deployments`, token);

    if (!Array.isArray(deployments)) {
        console.error("Failed to fetch deployments", deployments);
        return;
    }

    // 2. Find the Production one (usually has environment: 'Production' or similar)
    const production = deployments.find(d => d.environment === 'Production' || d.environment === 'production');

    if (!production) {
        console.log("No explicit 'Production' environment deployment found. Showing all:");
        deployments.forEach(d => console.log(` - Limit: ${d.environment} (ID: ${d.id})`));
        // Check the most recent one anyway
        if (deployments.length > 0) checkStatus(deployments[0], token);
        return;
    }

    await checkStatus(production, token);
}

async function checkStatus(deployment, token) {
    console.log(`\nChecking Deployment ID: ${deployment.id} (${deployment.environment})...`);
    console.log(`Created at: ${deployment.created_at}`);

    // 3. Get Statuses for this deployment
    const statuses = await request(deployment.statuses_url, token);

    if (Array.isArray(statuses) && statuses.length > 0) {
        const latest = statuses[0];
        console.log(`Final Status: ${latest.state.toUpperCase()}`);
        console.log(`Description: ${latest.description}`);
        console.log(`Log URL: ${latest.log_url || latest.target_url}`);
    } else {
        console.log("No statuses found.");
    }
}

main().catch(console.error);
