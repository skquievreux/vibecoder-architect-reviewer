import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const REPO_NAME = 'Audio-Mastering'; // Folder name in C:\CODE\GIT
const REPO_PATH = path.join('C:\\CODE\\GIT', REPO_NAME);
const TEMPLATES_DIR = path.join(process.cwd(), 'workflow-templates');

const WORKFLOWS = [
    'ci.yml',
    'release.yml',
    'dashboard-sync.yml',
    'ecosystem-guard.yml',
    'rollout-standards.yml'
];

console.log(`🚀 Fixing conflicts for ${REPO_NAME} (PR #4)...`);

try {
    // 1. Detect Branch
    console.log('  🔍 Detecting branch...');
    let targetBranch = '';

    try {
        const branches = execSync('git branch -r', { cwd: REPO_PATH, encoding: 'utf-8' });

        if (branches.includes('origin/chore/enforce-versioning-standards')) {
            targetBranch = 'chore/enforce-versioning-standards';
        } else if (branches.includes('origin/chore/add-workflow-templates')) {
            targetBranch = 'chore/add-workflow-templates';
        } else if (branches.includes('origin/feature/add-workflow-templates')) {
            targetBranch = 'feature/add-workflow-templates';
        } else {
            // Fallback
            targetBranch = 'chore/add-workflow-templates';
            console.log('  ⚠️ Branch detection vague, trying default.');
        }
    } catch (e) {
        console.log('  ⚠️ Error listing branches, assuming chore/enforce-versioning-standards');
        targetBranch = 'chore/enforce-versioning-standards';
    }

    console.log(`  🎯 Targeting branch: ${targetBranch}`);

    // 2. Prepare Branch | Merge Main
    try {
        execSync(`git checkout ${targetBranch}`, { cwd: REPO_PATH, stdio: 'pipe' });
    } catch {
        execSync(`git fetch origin`, { cwd: REPO_PATH, stdio: 'pipe' });
        execSync(`git checkout -b ${targetBranch} origin/${targetBranch}`, { cwd: REPO_PATH, stdio: 'pipe' });
    }

    try {
        console.log('  Pulling main...');
        execSync('git pull origin main', { cwd: REPO_PATH, stdio: 'pipe' });
        // Attempt merge
        execSync('git merge origin/main', { cwd: REPO_PATH, stdio: 'pipe' });
    } catch (e) {
        console.log('  ⚠️ Conflict detected. Resolving...');

        // RESOLUTION STRATEGY:
        // A. Versioning files -> Take from MAIN (Source of Truth)
        execSync('git checkout origin/main -- package.json CHANGELOG.md package-lock.json', { cwd: REPO_PATH, stdio: 'pipe' });

        // B. Workflow files & Config -> Take from TEMPLATES (Our Standards)
        const targetDir = path.join(REPO_PATH, '.github', 'workflows');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        for (const wf of WORKFLOWS) {
            fs.copyFileSync(path.join(TEMPLATES_DIR, wf), path.join(targetDir, wf));
        }

        // Copy .releaserc.json to root
        const releaseConfig = path.join(TEMPLATES_DIR, '.releaserc.json');
        if (fs.existsSync(releaseConfig)) {
            fs.copyFileSync(releaseConfig, path.join(REPO_PATH, '.releaserc.json'));
        }
    }

    // 3. Commit & Push
    try {
        execSync('git add .', { cwd: REPO_PATH, stdio: 'pipe' });
        execSync('git commit -m "merge: resolve conflicts (main versions + standard workflows)"', { cwd: REPO_PATH, stdio: 'pipe' });
    } catch (e) { }

    execSync(`git push -f origin ${targetBranch}`, { cwd: REPO_PATH, stdio: 'pipe' });
    console.log(`  ✅ Force pushed to ${targetBranch}`);

} catch (e: any) {
    console.error('❌ Error:', e.message);
}
