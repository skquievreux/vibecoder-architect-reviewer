
const fs = require('fs');
const path = require('path');

async function main() {
    // 1. Get API Token
    const envPath = path.join(process.cwd(), '.env');
    let apiToken = null;
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/VERCEL_API_TOKEN=(.*)/) || envContent.match(/VERCEL_TOKEN=(.*)/);
        if (match && match[1]) apiToken = match[1].trim().replace(/["']/g, '');
    }

    if (!apiToken) {
        console.error("❌ VERCEL_API_TOKEN not found.");
        return;
    }

    const HEADERS = { 'Authorization': `Bearer ${apiToken}` };

    // 2. Fetch Projects
    console.log("Fetching Vercel projects to debug links...");
    const projectsRes = await fetch('https://api.vercel.com/v9/projects?limit=100', { headers: HEADERS });
    const data = await projectsRes.json();

    // 3. Filter for the "problematic" ones mentioned by user
    const interesting = ['voicestage', 'techeroes', 'waldessenz', 'numerorologie', 'comicgenerator-techeroes', 'shader', 'videoedidshare'];

    console.log("--- Debug output ---");
    for (const p of data.projects) {
        // loose match
        if (interesting.some(i => p.name.includes(i)) || p.name.includes('comic')) {
            console.log(`\nProject: ${p.name}`);
            console.log(`  ID: ${p.id}`);
            if (p.link) {
                console.log(`  Link Type: ${p.link.type}`);
                console.log(`  Repo: ${p.link.repo}`); // Expected format "org/repo"
            } else {
                console.log("  Link: (none)");
            }
        }
    }
}

main().catch(console.error);
