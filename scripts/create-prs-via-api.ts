import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { execSync } from 'child_process';

// 1. Manuelles Laden der .env.local (ohne 'dotenv' Package)
const envPath = path.join(process.cwd(), '.env.local');
let githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (fs.existsSync(envPath) && !githubToken) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        const match = line.match(/^(GITHUB_TOKEN|GH_TOKEN)=(.*)$/);
        if (match) {
            githubToken = match[2].trim().replace(/^["']|["']$/g, ''); // Quotes entfernen
            break;
        }
    }
}

const REPOS_DIR = 'C:\\CODE\\GIT';
const TEMPLATES_DIR = path.join(process.cwd(), 'workflow-templates');
const BRANCH_NAME = 'chore/add-workflow-templates';
const USERNAME = 'skquievreux';

const WORKFLOWS = [
    'ci.yml',
    'release.yml',
    'dashboard-sync.yml',
    'ecosystem-guard.yml',
    'rollout-standards.yml'
];

if (!githubToken) {
    console.error('❌ Error: GITHUB_TOKEN not found in .env.local or environment');
    console.error('Please ensure GITHUB_TOKEN=ghp_... is set in .env.local');
    process.exit(1);
}

const IGNORE_REPOS = ['.github', 'Organisation-Repo', '.github-org-temp', 'vibecoder-architect-reviewer'];

async function main() {
    console.log('🚀 Starting Conflict Resolution & PR Creation Script (Dependency-Free)...');

    const dirs = fs.readdirSync(REPOS_DIR);

    for (const dir of dirs) {
        if (IGNORE_REPOS.includes(dir)) continue;

        const repoPath = path.join(REPOS_DIR, dir);
        if (!fs.existsSync(path.join(repoPath, '.git'))) continue;

        console.log(`\n📦 Processing: ${dir}`);

        try {
            // 1. Resolve Conflicts: Reset branch to fresh state from main
            console.log('  🔧 Preparing branch...');

            // Checkout main and pull
            try {
                execSync('git checkout main', { cwd: repoPath, stdio: 'pipe' });
                execSync('git pull origin main', { cwd: repoPath, stdio: 'pipe' });
            } catch (e) {
                // Fallback to master if main doesn't exist
                try {
                    execSync('git checkout master', { cwd: repoPath, stdio: 'pipe' });
                    execSync('git pull origin master', { cwd: repoPath, stdio: 'pipe' });
                } catch (ex) {
                    console.log('  ⚠️ Could not checkout main/master, skipping pull');
                }
            }

            // Re-create feature branch (Force delete old one to clear conflicts)
            try {
                execSync(`git branch -D ${BRANCH_NAME}`, { cwd: repoPath, stdio: 'pipe' });
            } catch (e) { }

            execSync(`git checkout -b ${BRANCH_NAME}`, { cwd: repoPath, stdio: 'pipe' });

            // 2. FORCE overwrite templates
            const targetDir = path.join(repoPath, '.github', 'workflows');
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            for (const wf of WORKFLOWS) {
                fs.copyFileSync(path.join(TEMPLATES_DIR, wf), path.join(targetDir, wf));
            }

            // 3. Commit
            let hasChanges = false;
            try {
                // Check status
                const status = execSync('git status --porcelain', { cwd: repoPath, encoding: 'utf-8' });
                if (status.trim().length > 0) {
                    execSync('git add .github/workflows', { cwd: repoPath, stdio: 'pipe' });
                    execSync('git commit -m "chore: enforce organization workflow templates"', { cwd: repoPath, stdio: 'pipe' });
                    hasChanges = true;
                }
            } catch (e) { console.log('  ⚠️ Commit error (maybe empty): ' + e); }

            // 4. Force Push (fixes "branch has conflicts" on PR by updating head)
            if (hasChanges) {
                execSync(`git push -f origin ${BRANCH_NAME}`, { cwd: repoPath, stdio: 'pipe' });
                console.log('  🚀 Pushed fresh branch');
            } else {
                console.log('  ⚠️ No changes (files match), pushing anyway to be sure');
                execSync(`git push -f origin ${BRANCH_NAME}`, { cwd: repoPath, stdio: 'pipe' });
            }

            // 5. Create PR via API
            await createPR(dir, BRANCH_NAME, 'main'); // Try main first

        } catch (err: any) {
            console.error(`  ❌ Error processing ${dir}: ${err.message}`);
        }
    }
}

async function createPR(repoName: string, head: string, base: string) {
    return new Promise<void>((resolve, reject) => {
        const data = JSON.stringify({
            title: 'chore: add organization workflow templates',
            body: 'Automated PR to enforce Organization Workflow Standards (ADR-011).',
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
                    // Check if it failed because base branch is 'master' not 'main'
                    const json = JSON.parse(body);
                    if (base === 'main' && json.errors && json.errors[0].message.includes('base')) {
                        console.log('  ⚠️ Main branch not found, retrying with master...');
                        createPR(repoName, head, 'master').then(resolve);
                        return;
                    }
                    if (json.errors && json.errors[0].message.includes('A pull request already exists')) {
                        console.log('  ℹ️  PR already exists');
                        resolve();
                        return;
                    }

                    console.error(`  ❌ API 422: ${json.message} - ${JSON.stringify(json.errors)}`);
                    resolve();
                } else {
                    console.error(`  ❌ API Error ${res.statusCode}: ${body}`);
                    resolve();
                }
            });
        });

        req.on('error', (e) => {
            console.error(`  ❌ Request error: ${e}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

main().catch(console.error);
