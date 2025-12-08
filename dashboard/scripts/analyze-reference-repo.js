const fs = require('fs');
const path = require('path');

const REPO_PATH = '/home/ladmin/Desktop/GIT/youtube-landing-page';

function crawl(dir, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return [];
    let results = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            if (file.startsWith('.') || file === 'node_modules') return;
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results.push({ path: filePath, type: 'dir' });
                results = results.concat(crawl(filePath, depth + 1, maxDepth));
            } else {
                results.push({ path: filePath, type: 'file' });
            }
        });
    } catch (e) {
        console.error(`Error accessing ${dir}:`, e.message);
    }
    return results;
}

function main() {
    console.log(`🔍 Analyzing Reference Repo: ${REPO_PATH}`);

    if (!fs.existsSync(REPO_PATH)) {
        console.error("❌ Repository not found!");
        return;
    }

    // 1. Structure Analysis
    console.log('\n--- File Structure (Key Directories) ---');
    const files = crawl(REPO_PATH);
    const apiFiles = files.filter(f => f.path.includes('/api/') || f.path.includes('/docs/') || f.path.toLowerCase().includes('readme') || f.path.includes('openapi'));

    apiFiles.forEach(f => {
        console.log(path.relative(REPO_PATH, f.path));
    });

    // 2. Content Analysis (Sample)
    console.log('\n--- Content Sampling ---');
    const readmePath = path.join(REPO_PATH, 'README.md');
    if (fs.existsSync(readmePath)) {
        console.log('📄 README.md found. First 10 lines:');
        console.log(fs.readFileSync(readmePath, 'utf-8').split('\n').slice(0, 10).join('\n'));
    }

    // Check for OpenAPI/Swagger
    const openApi = files.find(f => f.path.toLowerCase().includes('openapi') || f.path.toLowerCase().includes('swagger'));
    if (openApi) {
        console.log(`\n📄 Found API Spec: ${path.relative(REPO_PATH, openApi.path)}`);
    }

    // Check one API route for pattern
    const apiRoute = files.find(f => f.path.includes('/api/') && f.path.endsWith('route.ts'));
    if (apiRoute) {
        console.log(`\n📄 Sample API Route: ${path.relative(REPO_PATH, apiRoute.path)}`);
        console.log(fs.readFileSync(apiRoute.path, 'utf-8'));
    }
}

main();
