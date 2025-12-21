
import { execSync } from 'child_process';
import path from 'path';

console.log("🚀 Starting Automatic Portfolio Refresh Pipeline...");
console.log("==================================================");

function runStep(name: string, scriptPath: string) {
    console.log(`\n▶️  Step: ${name}`);
    try {
        // Use relative path for cross-platform compatibility
        const relativePath = path.relative(process.cwd(), scriptPath);
        // Execute with npx tsx and ensure stdio is piped to see live output
        execSync(`npx tsx "${relativePath}"`, { stdio: 'inherit', env: process.env });
    } catch (error) {
        console.error(`❌ Failed at step: ${name}`);
        process.exit(1);
    }
}

const steps = [
    {
        name: "Harvesting Data (README & package.json) from GitHub...",
        script: path.join(process.cwd(), 'scripts', 'intelligence', 'harvest.ts')
    },
    {
        name: "Analyzing Business Value with AI (this may take a while)...",
        script: path.join(process.cwd(), 'scripts', 'intelligence', 'analyze.ts')
    },
    {
        name: "Syncing DB and Generating Reports...",
        script: path.join(process.cwd(), 'scripts', 'intelligence', 'sync-db.ts')
    }
];

// Main Process
try {
    for (const step of steps) {
        runStep(step.name, step.script);
    }
    console.log("\n==================================================");
    console.log("✅ Portfolio Refresh Complete!");
    console.log("Check the Dashboard or docs/PORTFOLIO_SUMMARY.md for updates.");
} catch (error) {
    console.error("\nUnexpected Error in Pipeline:", error);
}
