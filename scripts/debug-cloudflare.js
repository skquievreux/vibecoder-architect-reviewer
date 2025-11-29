const fs = require('fs');
const path = require('path');

async function main() {
    console.log("Debugging Cloudflare Zones...");

    // 1. Get API Token
    const envPath = path.join(process.cwd(), '.env');
    let apiToken = null;

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const match = envContent.match(/CLOUDFLARE_API_TOKEN=(.*)/);
        if (match && match[1]) {
            apiToken = match[1].trim().replace(/["']/g, '');
        }
    }

    if (!apiToken) {
        console.error("❌ CLOUDFLARE_API_TOKEN not found.");
        return;
    }

    const BASE_URL = 'https://api.cloudflare.com/client/v4';

    // 2. List Zones
    try {
        const zonesRes = await fetch(`${BASE_URL}/zones`, {
            headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        });
        const zonesData = await zonesRes.json();

        if (!zonesData.success) {
            console.error("❌ Failed to fetch zones:", zonesData.errors);
            return;
        }

        const zones = zonesData.result;
        console.log(`Found ${zones.length} zones.`);

        let targetZone = null;

        for (const zone of zones) {
            console.log(`- [${zone.id}] ${zone.name}`);
            if (zone.name === 'unlock-your-song.de') {
                targetZone = zone;
            }
        }

        // 3. If zone found, check records
        if (targetZone) {
            console.log(`\nChecking records for ${targetZone.name} (${targetZone.id})...`);
            const recordsRes = await fetch(`${BASE_URL}/zones/${targetZone.id}/dns_records?type=CNAME`, {
                headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
            });
            const recordsData = await recordsRes.json();

            if (recordsData.success) {
                recordsData.result.forEach(r => {
                    console.log(`  - ${r.name} -> ${r.content}`);
                });
            } else {
                console.error("  ❌ Failed to fetch records.");
            }
        } else {
            console.log("\n❌ Zone 'unlock-your-song.de' not found in this account.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
