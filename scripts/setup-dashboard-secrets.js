const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function main() {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

    // 1. Generate API Key if missing
    let apiKey = '';
    if (envContent.includes('DASHBOARD_API_KEY=')) {
        const match = envContent.match(/DASHBOARD_API_KEY=(.*)/);
        apiKey = match[1].trim();
        console.log("✅ DASHBOARD_API_KEY already exists.");
    } else {
        apiKey = crypto.randomBytes(32).toString('hex');
        fs.appendFileSync(envPath, `\nDASHBOARD_API_KEY=${apiKey}\n`);
        console.log("✅ Generated and saved DASHBOARD_API_KEY.");
    }

    // 2. Find Dashboard URL
    let dashboardUrl = '';
    if (envContent.includes('DASHBOARD_URL=')) {
        const match = envContent.match(/DASHBOARD_URL=(.*)/);
        dashboardUrl = match[1].trim();
        console.log(`✅ DASHBOARD_URL already exists: ${dashboardUrl}`);
    } else {
        // Try to find via Vercel API
        const tokenMatch = envContent.match(/VERCEL_API_TOKEN=(.*)/) || envContent.match(/VERCEL_TOKEN=(.*)/);
        if (tokenMatch) {
            const apiToken = tokenMatch[1].trim().replace(/["']/g, '');
            try {
                console.log("🔍 Searching for Dashboard URL on Vercel...");
                const res = await fetch('https://api.vercel.com/v9/projects?search=dashboard', {
                    headers: { 'Authorization': `Bearer ${apiToken}` }
                });
                const data = await res.json();
                if (data.projects && data.projects.length > 0) {
                    // Assume the first one matching 'dashboard' or similar is it
                    // Or look for one that matches the current directory name?
                    // Let's just pick the first one and verify it has a production deployment
                    const project = data.projects[0];
                    const target = project.targets?.production?.url;
                    if (target) {
                        dashboardUrl = `https://${target}`;
                    } else {
                        // Fallback to latest deployment
                        dashboardUrl = `https://${project.name}.vercel.app`;
                    }

                    fs.appendFileSync(envPath, `\nDASHBOARD_URL=${dashboardUrl}\n`);
                    console.log(`✅ Found and saved DASHBOARD_URL: ${dashboardUrl}`);
                } else {
                    console.warn("⚠️ Could not find a Vercel project named 'dashboard'.");
                }
            } catch (e) {
                console.error("❌ Error fetching from Vercel:", e.message);
            }
        }
    }

    if (!dashboardUrl) {
        console.warn("⚠️ DASHBOARD_URL is missing. Please set it manually in .env");
    }
}

main();
