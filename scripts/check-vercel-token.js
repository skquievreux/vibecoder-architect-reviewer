const fs = require('fs');
const path = require('path');

async function main() {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const hasVercel = envContent.includes('VERCEL_TOKEN') || envContent.includes('VERCEL_API_TOKEN');
        console.log(`Has Vercel Token: ${hasVercel}`);
        if (hasVercel) {
            console.log("Found Vercel Token in .env");
        } else {
            console.log("No Vercel Token found.");
        }
    } else {
        console.log(".env file not found.");
    }
}

main();
