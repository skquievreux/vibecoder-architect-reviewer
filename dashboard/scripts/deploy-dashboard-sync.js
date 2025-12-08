const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const WORKFLOW_SRC = path.join(__dirname, '../public/sample-dashboard-sync.yml');
const WORKFLOW_DEST = '.github/workflows/dashboard-sync.yml';

function getEnvVar(name) {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(new RegExp(`${name}=(.*)`));
        if (match) return match[1].trim().replace(/["']/g, '');
    }
    return process.env[name];
}

async function main() {
    console.log("🚀 Starting Dashboard Sync Deployment...");

    const dashboardUrl = getEnvVar('DASHBOARD_URL');
    const apiKey = getEnvVar('DASHBOARD_API_KEY');

    if (!dashboardUrl || dashboardUrl.includes('YOUR_DASHBOARD_URL')) {
        console.warn("⚠️ DASHBOARD_URL is missing or invalid in .env. Secrets will be set to placeholder.");
    }
    if (!apiKey) {
        console.error("❌ DASHBOARD_API_KEY not found in .env");
        process.exit(1);
    }

    if (!fs.existsSync(WORKFLOW_SRC)) {
        console.error(`❌ Source workflow not found at ${WORKFLOW_SRC}`);
        process.exit(1);
    }

    const workflowContent = fs.readFileSync(WORKFLOW_SRC, 'utf-8');
    const workflowBase64 = Buffer.from(workflowContent).toString('base64');

    try {
        // 1. Fetch Repositories
        console.log("Fetching repositories...");
        const reposJson = execSync('gh repo list --limit 200 --json name,nameWithOwner,isArchived,defaultBranchRef --source', { encoding: 'utf-8' });
        const repos = JSON.parse(reposJson);

        console.log(`Found ${repos.length} repositories.`);

        for (const repo of repos) {
            if (repo.isArchived) {
                console.log(`⏭️ Skipping archived: ${repo.name}`);
                continue;
            }

            console.log(`\nProcessing ${repo.nameWithOwner}...`);

            // 2. Create/Update Workflow File via API
            try {
                // Check if file exists to get SHA
                let sha = null;
                try {
                    const fileRes = execSync(`gh api repos/${repo.nameWithOwner}/contents/${WORKFLOW_DEST}`, { stdio: 'pipe', encoding: 'utf-8' });
                    const fileData = JSON.parse(fileRes);
                    sha = fileData.sha;
                } catch (e) {
                    // File doesn't exist
                }

                // Create/Update
                const body = JSON.stringify({
                    message: 'ci: add dashboard sync workflow',
                    content: workflowBase64,
                    sha: sha,
                    branch: repo.defaultBranchRef ? repo.defaultBranchRef.name : 'main'
                });

                execSync(`gh api repos/${repo.nameWithOwner}/contents/${WORKFLOW_DEST} -X PUT --input -`, { input: body, stdio: 'pipe' });
                console.log(`  ✅ Workflow file updated`);

            } catch (e) {
                console.error(`  ❌ Failed to update workflow: ${e.message}`);
            }

            // 3. Set Secrets
            try {
                execSync(`gh secret set DASHBOARD_URL -b "${dashboardUrl || 'https://placeholder.com'}" -R ${repo.nameWithOwner}`);
                execSync(`gh secret set DASHBOARD_API_KEY -b "${apiKey}" -R ${repo.nameWithOwner}`);
                console.log(`  ✅ Secrets updated`);
            } catch (e) {
                console.error(`  ❌ Failed to set secrets: ${e.message}`);
            }
        }

        console.log("\n🎉 Deployment Complete!");

    } catch (e) {
        console.error("❌ Fatal Error:", e.message);
        console.error("Ensure 'gh' CLI is installed and authenticated.");
    }
}

main();
