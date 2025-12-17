import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// FIX SPECIFIC REPO & BRANCH
const REPO_NAME = 'screenshotgallerysystem';
const TARGET_BRANCH = 'chore/add-workflow-templates'; // PR #1

const REPO_PATH = path.join('C:\\CODE\\GIT', REPO_NAME);
const TEMPLATES_DIR = path.join(process.cwd(), 'workflow-templates');

const WORKFLOWS = [
    'ci.yml',
    'release.yml',
    'dashboard-sync.yml',
    'ecosystem-guard.yml',
    'rollout-standards.yml'
];

console.log(`🚀 Fixing conflicts for ${REPO_NAME} on branch ${TARGET_BRANCH}...`);

try {
    // 1. Checkout & Prepare
    console.log(`  Checkout ${TARGET_BRANCH}...`);
    try {
        execSync(`git checkout ${TARGET_BRANCH}`, { cwd: REPO_PATH, stdio: 'pipe' });
    } catch (e) {
        // If local checkout fails, maybe fetch and track remote
        execSync(`git fetch origin`, { cwd: REPO_PATH, stdio: 'pipe' });
        execSync(`git checkout -b ${TARGET_BRANCH} origin/${TARGET_BRANCH}`, { cwd: REPO_PATH, stdio: 'pipe' });
    }

    // Merge main with X ours strategy
    try {
        execSync('git pull origin main', { cwd: REPO_PATH, stdio: 'pipe' });
        execSync('git merge origin/main -X ours -m "merge: force resolve with ours"', { cwd: REPO_PATH, stdio: 'pipe' });
    } catch (e: any) {
        console.log('  ⚠️ Merge reported conflict. Resolving via overwrite...');
    }

    // 2. FORCE OVERWRITE FILES
    const targetDir = path.join(REPO_PATH, '.github', 'workflows');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    for (const wf of WORKFLOWS) {
        fs.copyFileSync(path.join(TEMPLATES_DIR, wf), path.join(targetDir, wf));
    }

    // Remove fly-deploy.yml conflict source
    const flyPath = path.join(targetDir, 'fly-deploy.yml');
    if (fs.existsSync(flyPath)) {
        fs.unlinkSync(flyPath);
        console.log('  🗑️ Removed conflicting fly-deploy.yml');
    }

    // 3. Commit & Force Push
    execSync('git add .', { cwd: REPO_PATH, stdio: 'pipe' });
    try {
        execSync('git commit -m "chore: force resolve conflicts in PR #1"', { cwd: REPO_PATH, stdio: 'pipe' });
    } catch (e) { }

    execSync(`git push -f origin ${TARGET_BRANCH}`, { cwd: REPO_PATH, stdio: 'pipe' });
    console.log(`  ✅ Force pushed to ${TARGET_BRANCH}`);

} catch (e: any) {
    console.error('❌ Error:', e.message);
}
