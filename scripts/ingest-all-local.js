const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GIT_ROOT = '/home/ladmin/Desktop/GIT';
const DASHBOARD_URL = 'http://localhost:3000';
const API_KEY = 'mock-api-key'; // Ingest API currently doesn't enforce key check for localhost or we need to add one

async function main() {
    console.log('🚀 Batch Ingesting Portfolio Data...');

    const repos = fs.readdirSync(GIT_ROOT);
    let successCount = 0;

    for (const repo of repos) {
        if (repo.startsWith('.') || repo === 'ArchitekturReview') continue;

        const repoPath = path.join(GIT_ROOT, repo);
        if (!fs.lstatSync(repoPath).isDirectory()) continue;

        // Check for package.json
        const packageJsonPath = path.join(repoPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) continue;

        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const nodeVersion = pkg.engines?.node || '';
            const reactVersion = pkg.dependencies?.react || '';

            // Read OpenAPI Spec
            let apiSpec = null;
            const openApiPaths = [
                path.join(repoPath, 'app/api/openapi.json'),
                path.join(repoPath, 'public/openapi.json'),
                path.join(repoPath, 'src/app/api/openapi.json')
            ];

            for (const p of openApiPaths) {
                if (fs.existsSync(p)) {
                    apiSpec = JSON.parse(fs.readFileSync(p, 'utf-8'));
                    break;
                }
            }

            const payload = {
                repoName: repo,
                nameWithOwner: `ladmin/${repo}`,
                repoUrl: `https://github.com/ladmin/${repo}`,
                description: pkg.description || '',
                apiSpec: apiSpec ? JSON.stringify(apiSpec) : null,
                packageJson: {
                    engines: { node: nodeVersion },
                    dependencies: { react: reactVersion }
                }
            };

            // Send to Dashboard
            console.log(`📤 Ingesting ${repo}...`);
            const response = await fetch(`${DASHBOARD_URL}/api/system/ingest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log(`✅ Success: ${repo}`);
                successCount++;
            } else {
                console.error(`❌ Failed: ${repo} (${response.status})`);
            }

        } catch (e) {
            console.error(`❌ Error processing ${repo}:`, e.message);
        }
    }

    console.log(`\n🎉 Batch Ingestion Complete.`);
    console.log(`   - Ingested: ${successCount}`);
}

main();
