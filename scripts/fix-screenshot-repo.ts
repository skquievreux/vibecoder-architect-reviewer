import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// FIX SPECIFIC REPO
const REPO_NAME = 'screenshotgallerysystem';
const REPO_PATH = path.join('C:\\CODE\\GIT', REPO_NAME);
const TEMPLATES_DIR = path.join(process.cwd(), 'workflow-templates');

const WORKFLOWS = [
    'ci.yml',
    'release.yml',
    'dashboard-sync.yml',
    'ecosystem-guard.yml',
    'rollout-standards.yml'
];

console.log(`🚀 Fixing conflicts for ${REPO_NAME}...`);

try {
    // 1. Reset everything to main to be clean
    console.log('  Testing branches...');
    let targetBranch = 'chore/add-workflow-templates';

    // Try to find which branch is active / exists remotely
    const branches = execSync('git branch -r', { cwd: REPO_PATH, encoding: 'utf-8' });
    if (branches.includes('origin/feature/add-workflow-templates')) {
        targetBranch = 'feature/add-workflow-templates';
    }
    // If the PR is on a specific branch, we should target that.
    // Assuming 'chore/add-workflow-templates' based on previous context, or allowing override.

    console.log(`  Targeting branch: ${targetBranch}`);

    // Checkout target branch
    execSync(`git checkout ${targetBranch}`, { cwd: REPO_PATH, stdio: 'pipe' });

    // Merge main with X ours strategy (Strongest conflict resolution)
    try {
        execSync('git pull origin main', { cwd: REPO_PATH, stdio: 'pipe' }); // First get revisions
        execSync('git merge origin/main -X ours -m "merge: force resolve with ours"', { cwd: REPO_PATH, stdio: 'pipe' });
    } catch (e: any) {
        console.log('  ⚠️ Merge reported conflict (expected). Resolving via overwrite...');
    }

    // 2. FORCE OVERWRITE FILES
    const targetDir = path.join(REPO_PATH, '.github', 'workflows');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    for (const wf of WORKFLOWS) {
        fs.copyFileSync(path.join(TEMPLATES_DIR, wf), path.join(targetDir, wf));
    }

    // Also remove fly-deploy.yml if it exists (known conflict source)
    const flyPath = path.join(targetDir, 'fly-deploy.yml');
    if (fs.existsSync(flyPath)) {
        fs.unlinkSync(flyPath);
        console.log('  🗑️ Removed conflicting fly-deploy.yml');
    }

    // 3. Commit & Force Push
    execSync('git add .', { cwd: REPO_PATH, stdio: 'pipe' });
    try {
        execSync('git commit -m "chore: force resolve conflicts by rewriting templates"', { cwd: REPO_PATH, stdio: 'pipe' });
    } catch (e) { }

    execSync(`git push -f origin ${targetBranch}`, { cwd: REPO_PATH, stdio: 'pipe' });
    console.log(`  ✅ Force pushed to ${targetBranch}`);

} catch (e: any) {
    console.error('❌ Error:', e.message);
}
