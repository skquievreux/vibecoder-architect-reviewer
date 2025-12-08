const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const WORK_DIR = path.join(os.tmpdir(), 'react-verify');
const REPOS_TO_VERIFY = [
    'Google-Visual-Story-Generator-',
    'visualimagecomposer',
    'playlist_generator',
    'Audio-Transkriptor',
    'OsteoConnect'
];

async function main() {
    console.log("🔍 Verifying React 19.2 Upgrades...\n");

    if (!fs.existsSync(WORK_DIR)) {
        fs.mkdirSync(WORK_DIR);
    }

    const results = [];

    for (const repoName of REPOS_TO_VERIFY) {
        const repoPath = path.join(WORK_DIR, repoName);

        try {
            // Cleanup
            if (fs.existsSync(repoPath)) {
                fs.rmSync(repoPath, { recursive: true, force: true });
            }

            console.log(`Checking ${repoName}...`);

            // Clone the branch
            const repoUrl = `https://github.com/skquievreux/${repoName}`;
            execSync(`git clone --depth 1 --branch fix/react-19-2-upgrade ${repoUrl} ${repoPath}`, { stdio: 'ignore' });

            // Read package.json
            const pkgPath = path.join(repoPath, 'package.json');
            if (!fs.existsSync(pkgPath)) {
                results.push({ repo: repoName, status: 'ERROR', message: 'No package.json' });
                continue;
            }

            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };

            const reactVersion = deps.react || 'N/A';
            const reactDomVersion = deps['react-dom'] || 'N/A';

            if (reactVersion.includes('19.2') && reactDomVersion.includes('19.2')) {
                console.log(`  ✅ React: ${reactVersion}, React-DOM: ${reactDomVersion}`);
                results.push({ repo: repoName, status: 'SUCCESS', react: reactVersion });
            } else {
                console.log(`  ❌ React: ${reactVersion}, React-DOM: ${reactDomVersion}`);
                results.push({ repo: repoName, status: 'FAILED', react: reactVersion });
            }

        } catch (e) {
            console.log(`  ❌ Error: ${e.message.split('\n')[0]}`);
            results.push({ repo: repoName, status: 'ERROR', message: e.message.split('\n')[0] });
        }
    }

    console.log("\n=== VERIFICATION SUMMARY ===");
    console.table(results);

    // Cleanup
    if (fs.existsSync(WORK_DIR)) {
        fs.rmSync(WORK_DIR, { recursive: true, force: true });
    }
}

main();
