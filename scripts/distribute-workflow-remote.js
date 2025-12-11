require('dotenv').config({ path: '.env' });
const fs = require('fs');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const WORKFLOW_PATH = path.join(__dirname, '../.github/workflows/ecosystem-guard.yml');

if (!GITHUB_TOKEN) {
    console.error("❌ Error: GITHUB_TOKEN not found in .env");
    process.exit(1);
}

if (!fs.existsSync(WORKFLOW_PATH)) {
    console.error(`❌ Error: Workflow file not found at ${WORKFLOW_PATH}`);
    process.exit(1);
}

const workflowContent = fs.readFileSync(WORKFLOW_PATH, 'utf-8');
const workflowBase64 = Buffer.from(workflowContent).toString('base64');

async function githubRequest(url, method = 'GET', body = null) {
    const headers = {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Ecosystem-Migration-Script'
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText} - ${url}`);
    }
    return response.json();
}

async function distribute() {
    try {
        console.log("🔄 Fetching repositories...");
        // Fetch all repos for the authenticated user (including private)
        const user = await githubRequest('https://api.github.com/user');
        console.log(`👤 Authenticated as: ${user.login}`);

        let repos = [];
        let page = 1;
        while (true) {
            const pageRepos = await githubRequest(`https://api.github.com/user/repos?per_page=100&page=${page}&type=all`);
            if (pageRepos.length === 0) break;
            repos = repos.concat(pageRepos);
            page++;
        }

        console.log(`📦 Found ${repos.length} repositories.`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const repo of repos) {
            if (repo.archived) {
                console.log(`⏭️ Skipping archived repo: ${repo.name}`);
                skipCount++;
                continue;
            }

            console.log(`🚀 Processing ${repo.name}...`);
            const fileUrl = `https://api.github.com/repos/${repo.full_name}/contents/.github/workflows/ecosystem-guard.yml`;

            try {
                // Check if file exists to get SHA
                let sha = null;
                try {
                    const existingFile = await githubRequest(fileUrl);
                    sha = existingFile.sha;
                } catch (e) {
                    // File doesn't exist, that's fine
                }

                // Create or Update file
                await githubRequest(fileUrl, 'PUT', {
                    message: 'ci: add ecosystem guard workflow (automated)',
                    content: workflowBase64,
                    sha: sha // Include SHA if updating
                });

                console.log(`✅ Installed/Updated in ${repo.name}`);
                successCount++;
            } catch (err) {
                console.error(`❌ Failed to update ${repo.name}: ${err.message}`);
                errorCount++;
            }
        }

        console.log("\n🎉 Distribution Complete!");
        console.log(`✅ Success: ${successCount}`);
        console.log(`⏭️ Skipped: ${skipCount}`);
        console.log(`❌ Errors: ${errorCount}`);

    } catch (error) {
        console.error("❌ Fatal Error:", error.message);
    }
}

distribute();
