import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const REPO_NAME = 'SVG-Grafik'; // Local folder name
const REPO_PATH = path.join('C:\\CODE\\GIT', REPO_NAME);
const TEMPLATES_DIR = path.join(process.cwd(), 'workflow-templates');

const WORKFLOWS = [
    'ci.yml',
    'release.yml',
    'dashboard-sync.yml',
    'ecosystem-guard.yml',
    'rollout-standards.yml'
];

console.log(`🚀 Fixing conflicts for ${REPO_NAME} (PR #6)...`);

try {
    // 1. Detect Branch
    console.log('  🔍 Detecting branch...');
    let targetBranch = '';

    // Check remote branches to find which one exists
    const branches = execSync('git branch -r', { cwd: REPO_PATH, encoding: 'utf-8' });

    // Priorities based on our previous scripts
    if (branches.includes('origin/chore/add-workflow-templates')) {
        targetBranch = 'chore/add-workflow-templates';
    } else if (branches.includes('origin/feature/add-workflow-templates')) {
        targetBranch = 'feature/add-workflow-templates';
    } else if (branches.includes('origin/chore/enforce-versioning-standards')) {
        targetBranch = 'chore/enforce-versioning-standards';
    } else {
        // Fallback: Try to guess or fail
        console.log('  ⚠️ Could not auto-detect standard branch. Defaulting to chore/add-workflow-templates');
        targetBranch = 'chore/add-workflow-templates';
    }

    console.log(`  🎯 Targeting branch: ${targetBranch}`);

    // 2. Prepare Branch
    try {
        execSync(`git checkout ${targetBranch}`, { cwd: REPO_PATH, stdio: 'pipe' });
    } catch (e) {
        execSync(`git fetch origin`, { cwd: REPO_PATH, stdio: 'pipe' });
        execSync(`git checkout -b ${targetBranch} origin/${targetBranch}`, { cwd: REPO_PATH, stdio: 'pipe' });
    }

    // Merge main (expect conflicts)
    try {
        execSync('git pull origin main', { cwd: REPO_PATH, stdio: 'pipe' });
        execSync('git merge origin/main -X ours -m "merge: force resolve conflicts"', { cwd: REPO_PATH, stdio: 'pipe' });
    } catch (e) {
        console.log('  ⚠️ Merge reported conflict. Resolving via overwrite...');
    }

    // 3. FORCE OVERWRITE FILES
    const targetDir = path.join(REPO_PATH, '.github', 'workflows');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    for (const wf of WORKFLOWS) {
        fs.copyFileSync(path.join(TEMPLATES_DIR, wf), path.join(targetDir, wf));
    }

    // Also copy .releaserc.json to root if it exists in templates
    const releaseConfig = path.join(TEMPLATES_DIR, '.releaserc.json');
    if (fs.existsSync(releaseConfig)) {
        fs.copyFileSync(releaseConfig, path.join(REPO_PATH, '.releaserc.json'));
    }

    // Remove common conflict files if they interfere (e.g. old workflows)
    // We can list files in .github/workflows and remove those that are not in our list
    // (Optional, but safe for standardization)

    // 4. Commit & Force Push
    execSync('git add .', { cwd: REPO_PATH, stdio: 'pipe' });
    try {
        execSync('git commit -m "chore: force resolve conflicts in PR #6"', { cwd: REPO_PATH, stdio: 'pipe' });
    } catch (e) { }

    // Force push to update the PR
    execSync(`git push -f origin ${targetBranch}`, { cwd: REPO_PATH, stdio: 'pipe' });
    console.log(`  ✅ Force pushed to ${targetBranch}`);

} catch (e: any) {
    console.error('❌ Error:', e.message);
}
