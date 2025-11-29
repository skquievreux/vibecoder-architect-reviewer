const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let CLOUDFLARE_API_TOKEN = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/CLOUDFLARE_API_TOKEN=(.*)/);
    if (match) {
        CLOUDFLARE_API_TOKEN = match[1].trim().replace(/^Bearer\s+/i, '');
    }
}
const ZONE_ID = '10864037a5579e03076c46cc1fe14d08'; // From user report

async function testCloudflare() {
    if (!CLOUDFLARE_API_TOKEN) {
        console.error('Error: CLOUDFLARE_API_TOKEN not found in .env');
        return;
    }

    console.log(`Testing with Token: ${CLOUDFLARE_API_TOKEN.substring(0, 5)}...`);
    console.log(`Target Zone: ${ZONE_ID}`);

    try {
        const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;
        console.log(`Fetching: ${url}`);

        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        console.log('Status:', res.status);
        if (data.success) {
            console.log('Success! Found records:', data.result.length);
        } else {
            console.error('Cloudflare Error:', JSON.stringify(data.errors, null, 2));
        }
    } catch (error) {
        console.error('Network/Script Error:', error);
    }
}

testCloudflare();
