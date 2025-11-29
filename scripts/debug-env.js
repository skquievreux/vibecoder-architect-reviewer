const fs = require('fs');
const path = require('path');

console.log("Current CWD:", process.cwd());
const envPath = path.join(process.cwd(), '.env');
console.log("Target .env Path:", envPath);

if (fs.existsSync(envPath)) {
    console.log("File exists.");
    const envContent = fs.readFileSync(envPath, 'utf-8');
    console.log("File content length:", envContent.length);

    const lines = envContent.split('\n');
    console.log("Lines found:", lines.length);
    lines.forEach((line, idx) => {
        if (line.trim()) {
            const parts = line.split('=');
            console.log(`Line ${idx + 1}: Key="${parts[0].trim()}", ValueLength=${parts.length > 1 ? parts[1].length : 0}`);
        }
    });

    const matchPerplexity = envContent.match(/PERPLEXITY_API_KEY=(.*)/);
    const matchOpenAI = envContent.match(/OPENAI_API_KEY=(.*)/);

    if (matchPerplexity) {
        console.log("Found PERPLEXITY_API_KEY match.");
        console.log("Key length:", matchPerplexity[1].trim().replace(/["']/g, '').length);
        console.log("Key starts with:", matchPerplexity[1].trim().replace(/["']/g, '').substring(0, 5) + "...");
    } else {
        console.log("PERPLEXITY_API_KEY match NOT found.");
    }

    if (matchOpenAI) {
        console.log("Found OPENAI_API_KEY match.");
    } else {
        console.log("OPENAI_API_KEY match NOT found.");
    }
} else {
    console.log("File does NOT exist.");
}
