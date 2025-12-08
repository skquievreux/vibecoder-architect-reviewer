const fs = require('fs');
const path = require('path');

async function main() {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const tokenMatch = envContent.match(/VERCEL_API_TOKEN=(.*)/) || envContent.match(/VERCEL_TOKEN=(.*)/);

    if (!tokenMatch) {
        console.error("No Vercel Token found.");
        return;
    }

    const apiToken = tokenMatch[1].trim().replace(/["']/g, '');

    const res = await fetch('https://api.vercel.com/v9/projects?limit=50', {
        headers: { 'Authorization': `Bearer ${apiToken}` }
    });
    const data = await res.json();

    console.log("Vercel Projects:");
    data.projects.forEach(p => {
        const url = p.targets?.production?.url ? `https://${p.targets.production.url}` : `https://${p.name}.vercel.app`;
        console.log(`- ${p.name} -> ${url}`);
    });
}

main();
