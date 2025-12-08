// const fetch = require('node-fetch'); // Native fetch in Node 18+

const API_URL = 'http://localhost:3000/api/system/ingest';

async function testValidation() {
    console.log('🧪 Testing Zod Validation...');

    // 1. Test Valid Payload
    console.log('\n1. Sending Valid Payload...');
    const validPayload = {
        repoName: 'zod-test-repo',
        nameWithOwner: 'ladmin/zod-test-repo',
        repoUrl: 'https://github.com/ladmin/zod-test-repo',
        description: 'A test repo for Zod validation',
        packageJson: { engines: { node: '18' } }
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validPayload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
            console.log('✅ Valid Payload Accepted');
        } else {
            console.error('❌ Valid Payload Failed:', data);
        }
    } catch (e) {
        console.error('❌ Error:', e.message);
    }

    // 2. Test Invalid Payload (Missing required fields)
    console.log('\n2. Sending Invalid Payload (Missing repoName)...');
    const invalidPayload = {
        // repoName missing
        nameWithOwner: 'ladmin/invalid-repo',
        repoUrl: 'not-a-url' // Invalid URL format
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidPayload)
        });
        const data = await res.json();

        if (!res.ok && data.error?.code === 'VALIDATION_ERROR') {
            console.log('✅ Invalid Payload Rejected (Correctly)');
            console.log('   Error Details:', JSON.stringify(data.error.details, null, 2));
        } else {
            console.error('❌ Invalid Payload NOT Rejected correctly:', data);
        }
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

testValidation();
