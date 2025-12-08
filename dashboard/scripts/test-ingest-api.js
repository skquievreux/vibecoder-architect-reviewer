

async function main() {
    const url = 'http://localhost:3000/api/ingest/changelog';
    const payload = {
        repoName: 'test-repo',
        content: `
# Changelog
## [1.0.0] - 2024-01-01
### Added
- Integrated Stripe for payments.
- Added Vercel deployment config.
- Connected to Supabase database.
        `
    };

    console.log(`Sending request to ${url}...`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
