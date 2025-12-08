const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
// Pick up the LOCAL modified workflow file from the root
const LOCAL_WORKFLOW_PATH = path.join(__dirname, '../../.github/workflows/ecosystem-guard.yml');

if (!GITHUB_TOKEN) {
    console.error("❌ Error: GITHUB_TOKEN not found in .env");
    process.exit(1);
}

if (!fs.existsSync(LOCAL_WORKFLOW_PATH)) {
    console.error(`❌ Error: Workflow file not found at ${LOCAL_WORKFLOW_PATH}`);
    process.exit(1);
}

const workflowContent = fs.readFileSync(LOCAL_WORKFLOW_PATH, 'utf-8');
const workflowBase64 = Buffer.from(workflowContent).toString('base64');

async function githubRequest(url, method = 'GET', body = null) {
    const headers = {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Ecosystem-Guard-Distributor'
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
            await putFile(repo, '.github/workflows/ecosystem-guard.yml', workflowBase64, 'ci: update ecosystem guard (remove release job)');
            successCount++;
        }

        console.log("\n🎉 Distribution Complete!");
        console.log(`✅ Success: ${successCount}`);
        console.log(`⏭️ Skipped: ${skipCount}`);
        console.log(`❌ Errors: ${errorCount}`);

    } catch (error) {
        console.error("❌ Fatal Error:", error.message);
    }
}

async function putFile(repo, path, contentBase64, message) {
    const fileUrl = `https://api.github.com/repos/${repo.full_name}/contents/${path}`;
    try {
        let sha = null;
        try {
            const existingFile = await githubRequest(fileUrl);
            sha = existingFile.sha;
        } catch (e) {
            // File doesn't exist
        }

        await githubRequest(fileUrl, 'PUT', {
            message: message,
            content: contentBase64,
            sha: sha
        });
        console.log(`   ✅ Updated ${path}`);
    } catch (err) {
        console.error(`   ❌ Failed to update ${path}: ${err.message}`);
        throw err;
    }
}

distribute();
