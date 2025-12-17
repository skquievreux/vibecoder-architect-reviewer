import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { execSync } from 'child_process';

const envPath = path.join(process.cwd(), '.env.local');
let githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (fs.existsSync(envPath) && !githubToken) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        const match = line.match(/^(GITHUB_TOKEN|GH_TOKEN)=(.*)$/);
        if (match) {
            githubToken = match[2].trim().replace(/^["']|["']$/g, '');
            break;
        }
    }
}

const REPOS_DIR = 'C:\\CODE\\GIT';
const TEMPLATES_DIR = path.join(process.cwd(), 'workflow-templates');
const BRANCH_NAME = 'chore/enforce-versioning-standards'; // New branch name for this specific rollout
const USERNAME = 'skquievreux';

// Map files to their destination relative to repo root
const FILES_TO_DEPLOY = [
    { src: 'ci.yml', dest: '.github/workflows/ci.yml' },
    { src: 'release.yml', dest: '.github/workflows/release.yml' },
    { src: 'dashboard-sync.yml', dest: '.github/workflows/dashboard-sync.yml' },
    { src: 'ecosystem-guard.yml', dest: '.github/workflows/ecosystem-guard.yml' },
    { src: 'rollout-standards.yml', dest: '.github/workflows/rollout-standards.yml' },
    { src: '.releaserc.json', dest: '.releaserc.json' } // Semantic Release config goes to root!
];

if (!githubToken) {
    console.error('❌ Error: GITHUB_TOKEN not found');
    process.exit(1);
}

const IGNORE_REPOS = ['.github', 'Organisation-Repo', '.github-org-temp', 'vibecoder-architect-reviewer'];

async function main() {
    console.log('🚀 Deploying Versioning Standards & Configs...');

    const dirs = fs.readdirSync(REPOS_DIR);

    for (const dir of dirs) {
        if (IGNORE_REPOS.includes(dir)) continue;

        const repoPath = path.join(REPOS_DIR, dir);
        if (!fs.existsSync(path.join(repoPath, '.git'))) continue;

        console.log(`\n📦 Processing: ${dir}`);

        try {
            // 1. Prepare Branch
            try {
                execSync('git checkout main', { cwd: repoPath, stdio: 'pipe' });
                execSync('git pull origin main', { cwd: repoPath, stdio: 'pipe' });
            } catch (e) {
                try {
                    execSync('git checkout master', { cwd: repoPath, stdio: 'pipe' });
                    execSync('git pull origin master', { cwd: repoPath, stdio: 'pipe' });
                } catch (ex) { console.log('  ⚠️ Pull failed, proceeding anyway'); }
            }

            try { execSync(`git branch -D ${BRANCH_NAME}`, { cwd: repoPath, stdio: 'pipe' }); } catch (e) { }
            execSync(`git checkout -b ${BRANCH_NAME}`, { cwd: repoPath, stdio: 'pipe' });

            // 2. FORCE COPY Files to correct locations
            for (const file of FILES_TO_DEPLOY) {
                const srcPath = path.join(TEMPLATES_DIR, file.src);
                const destPath = path.join(repoPath, file.dest);

                // Ensure directory exists
                const destDir = path.dirname(destPath);
                if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

                // Copy
                if (fs.existsSync(srcPath)) {
                    fs.copyFileSync(srcPath, destPath);
                } else {
                    console.log(`  ⚠️ Warning: Source file ${file.src} not found`);
                }
            }

            // 3. Commit
            let hasChanges = false;
            try {
                const status = execSync('git status --porcelain', { cwd: repoPath, encoding: 'utf-8' });
                if (status.trim().length > 0) {
                    execSync('git add .', { cwd: repoPath, stdio: 'pipe' }); // Add all changes (including root files)
                    execSync('git commit -m "chore: enforce versioning standards and release config"', { cwd: repoPath, stdio: 'pipe' });
                    hasChanges = true;
                }
            } catch (e) { }

            // 4. Force Push
            if (hasChanges) {
                execSync(`git push -f origin ${BRANCH_NAME}`, { cwd: repoPath, stdio: 'pipe' });
                console.log('  🚀 Pushed config update');
            } else {
                console.log('  ⚠️ No changes (already up to date)');
                continue; // No need for PR if no changes
            }

            // 5. Create PR
            await createPR(dir, BRANCH_NAME, 'main');

        } catch (err: any) {
            console.error(`  ❌ Error processing ${dir}: ${err.message}`);
        }
    }
}

async function createPR(repoName: string, head: string, base: string) {
    return new Promise<void>((resolve, reject) => {
        const data = JSON.stringify({
            title: 'chore: configure semantic release standards',
            body: 'Adds .releaserc.json to standardizes versioning across the organization. This ensures automated version bumps work correctly without manual conflicts.',
            head: head,
            base: base
        });

        const options = {
            hostname: 'api.github.com',
            path: `/repos/${USERNAME}/${repoName}/pulls`,
            method: 'POST',
            headers: {
                'User-Agent': 'Node.js Script',
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                if (res.statusCode === 201) {
                    const json = JSON.parse(body);
                    console.log(`  🎉 PR Created: ${json.html_url}`);
                    resolve();
                } else if (res.statusCode === 422) {
                    const json = JSON.parse(body);
                    if (base === 'main' && json.errors && json.errors[0].message.includes('base')) {
                        createPR(repoName, head, 'master').then(resolve);
                        return;
                    }
                    console.log('  ℹ️  PR likely already exists');
                    resolve();
                } else {
                    resolve();
                }
            });
        });

        req.on('error', (e) => { resolve(); });
        req.write(data);
        req.end();
    });
}

main().catch(console.error);
