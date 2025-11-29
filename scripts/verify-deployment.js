/* eslint-disable @typescript-eslint/no-require-imports */
// const fetch = require('node-fetch'); // Native fetch is available in Node 20+

const BASE_URL = 'http://localhost:3000';
const MAX_RETRIES = 30;
const RETRY_DELAY = 1000; // 1 second

async function waitForServer() {
    console.log(`⏳ Waiting for server at ${BASE_URL}...`);
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const res = await fetch(BASE_URL);
            if (res.ok || res.status === 500) { // Accept 500 for now as "server is up but broken"
                console.log(`✅ Server is up!`);
                return true;
            }
        } catch (e) {
            // Ignore connection errors and retry
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        process.stdout.write('.');
    }
    console.error(`\n❌ Server did not start within ${MAX_RETRIES} seconds.`);
    return false;
}

async function checkUrl(path, expectedStatus = 200) {
    const url = `${BASE_URL}${path}`;
    console.log(`Checking ${url}...`);
    try {
        const res = await fetch(url);
        if (res.status === expectedStatus) {
            console.log(`✅ Success: ${url} (Status ${res.status})`);
            return true;
        } else {
            console.error(`❌ Failed: ${url} returned status ${res.status}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error fetching ${url}:`, error.message);
        return false;
    }
}

async function runVerification() {
    console.log("🚀 Starting Post-Deployment Verification...");

    const serverUp = await waitForServer();
    if (!serverUp) {
        process.exit(1);
    }

    const checks = [
        checkUrl('/'),
        checkUrl('/repo/playlist_generator')
    ];

    const results = await Promise.all(checks);
    const allPassed = results.every(r => r);

    if (allPassed) {
        console.log("\n✅ All checks passed! Deployment looks good.");
        process.exit(0);
    } else {
        console.error("\n⚠️ Some checks failed. Please review the logs.");
        process.exit(1);
    }
}

runVerification();
