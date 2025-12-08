const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const LOCAL_RELEASERC_PATH = path.join(__dirname, '../../.releaserc.json');

// Standalone Workflow Content (Installs dependencies at runtime)
const WORKFLOW_CONTENT = `name: Release

on:
  push:
    branches:
      - main
      - master

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
          cache: npm

      - name: Install Semantic Release & Plugins
        run: |
          npm install --no-save \\
            semantic-release \\
            @semantic-release/changelog \\
            @semantic-release/git \\
            @semantic-release/exec \\
            @semantic-release/commit-analyzer \\
            @semantic-release/release-notes-generator \\
            @semantic-release/npm \\
            @semantic-release/github \\
            conventional-changelog-conventionalcommits

      - name: Semantic Release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
`;

if (!GITHUB_TOKEN) {
    console.error("❌ Error: GITHUB_TOKEN not found in .env");
    process.exit(1);
}

if (!fs.existsSync(LOCAL_RELEASERC_PATH)) {
    console.error(`❌ Error: .releaserc.json not found at ${LOCAL_RELEASERC_PATH}`);
    process.exit(1);
}

const releasercContent = fs.readFileSync(LOCAL_RELEASERC_PATH, 'utf-8');
const releasercBase64 = Buffer.from(releasercContent).toString('base64');
const workflowBase64 = Buffer.from(WORKFLOW_CONTENT).toString('base64');

async function githubRequest(url, method = 'GET', body = null) {
    const headers = {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Semantic-Release-Distributor'
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

            // 1. Distribute .releaserc.json
            await putFile(repo, '.releaserc.json', releasercBase64, 'ci: add semantic-release config');

            // 2. Distribute .github/workflows/release.yml
            await putFile(repo, '.github/workflows/release.yml', workflowBase64, 'ci: add semantic-release workflow');

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

        // Only update if it's new or we want to overwrite (currently always overwriting)
        await githubRequest(fileUrl, 'PUT', {
            message: message,
            content: contentBase64,
            sha: sha
        });
        console.log(`   ✅ Updated ${path}`);
    } catch (err) {
        console.error(`   ❌ Failed to update ${path}: ${err.message}`);
        throw err; // Propagate to main loop if needed, allows counting errors
    }
}

distribute();
