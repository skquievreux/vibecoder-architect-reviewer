/* eslint-disable @typescript-eslint/no-require-imports */
// const fetch = require('node-fetch'); // Native fetch is available in Node 20+

async function generateReport() {
    console.log('Triggering AI Report Generation...');
    try {
        const res = await fetch('http://localhost:3000/api/ai/generate', { method: 'POST' });
        const data = await res.json();

        if (res.ok) {
            console.log('✅ Report Generated Successfully!');
            console.log('Preview:', data.report.content.substring(0, 200) + '...');
        } else {
            console.error('❌ Failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

generateReport();
