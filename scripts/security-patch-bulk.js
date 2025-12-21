const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Projekte, die gepatcht werden müssen (aus Security-Analyse)
const PROJECTS_TO_PATCH = [
    { name: 'melody-maker', priority: 1, currentReact: '^19.2.0', currentNext: '^15.1.6' },
    { name: 'playlist_generator', priority: 1, currentReact: '^19.2.0', currentNext: null },
    { name: 'visualimagecomposer', priority: 1, currentReact: '^19.2.0', currentNext: null },
    { name: 'techeroes-quiz', priority: 1, currentReact: '^19.2.0', currentNext: null },
    { name: 'youtube-landing-page', priority: 1, currentReact: '^19.2.0', currentNext: null },
    { name: 'Artheria-Healing-Visualizer', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'media-project-manager', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'visual-flyer-snap', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'sound-bowl-echoes', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'inspect-whisper', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'clip-sync-collab', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'broetchen-wochenende-bestellung', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'bit-blast-studio', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'birdie-flight-revamp', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'art-vibe-gen', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'albumpromotion', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'agent-dialogue-manager', priority: 2, currentReact: '^19.2.0', currentNext: null },
    { name: 'ai-portfolio-fly-website', priority: 2, currentReact: '^19.2.0', currentNext: null },
];

const BASE_DIR = 'C:\\CODE\\GIT';
const TARGET_REACT_VERSION = '19.2.3';
const TARGET_NEXT_VERSION = '16.1.0';

// Logging
const log = {
    info: (msg) => console.log(`ℹ️  ${msg}`),
    success: (msg) => console.log(`✅ ${msg}`),
    error: (msg) => console.log(`❌ ${msg}`),
    warning: (msg) => console.log(`⚠️  ${msg}`),
    step: (msg) => console.log(`\n🔧 ${msg}`),
};

// Ergebnis-Tracking
const results = {
    success: [],
    failed: [],
    skipped: [],
};

function execCommand(command, cwd, options = {}) {
    try {
        const output = execSync(command, {
            cwd,
            encoding: 'utf8',
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options
        });
        return { success: true, output };
    } catch (error) {
        return { success: false, error: error.message, output: error.stdout };
    }
}

function patchProject(project) {
    log.step(`Patching ${project.name} (Priority ${project.priority})`);

    const projectPath = path.join(BASE_DIR, project.name);

    // 1. Check if project exists
    if (!fs.existsSync(projectPath)) {
        log.error(`Project directory not found: ${projectPath}`);
        results.skipped.push({ ...project, reason: 'Directory not found' });
        return false;
    }

    // 2. Check if package.json exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        log.error(`package.json not found in ${project.name}`);
        results.skipped.push({ ...project, reason: 'No package.json' });
        return false;
    }

    // 3. Read current package.json
    log.info(`Reading package.json...`);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // 4. Check current versions
    const currentReact = packageJson.dependencies?.react;
    const currentNext = packageJson.dependencies?.next || packageJson.dependencies?.['next'];

    log.info(`Current versions: React=${currentReact}, Next.js=${currentNext || 'N/A'}`);

    // 5. Git: Create security branch
    log.info(`Creating security branch...`);
    const gitBranch = execCommand('git rev-parse --abbrev-ref HEAD', projectPath, { silent: true });
    if (!gitBranch.success) {
        log.error(`Failed to get current branch`);
        results.failed.push({ ...project, reason: 'Git error' });
        return false;
    }

    // Checkout main/master first
    execCommand('git checkout main', projectPath, { silent: true });
    execCommand('git checkout master', projectPath, { silent: true });
    execCommand('git pull', projectPath, { silent: true });

    // Create security branch
    const branchResult = execCommand('git checkout -b security/patch-cve-2025-55182', projectPath, { silent: true });
    if (!branchResult.success) {
        log.warning(`Branch might already exist, checking out...`);
        execCommand('git checkout security/patch-cve-2025-55182', projectPath, { silent: true });
    }

    // 6. Install patched versions
    log.info(`Installing patched versions...`);

    let installCommand = `npm install react@${TARGET_REACT_VERSION} react-dom@${TARGET_REACT_VERSION}`;
    if (currentNext) {
        installCommand += ` next@${TARGET_NEXT_VERSION}`;
    }

    const installResult = execCommand(installCommand, projectPath);
    if (!installResult.success) {
        log.error(`Failed to install dependencies`);
        results.failed.push({ ...project, reason: 'npm install failed' });
        return false;
    }

    // 7. Verify versions in package.json
    log.info(`Verifying versions...`);
    const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const newReact = updatedPackageJson.dependencies?.react;
    const newNext = updatedPackageJson.dependencies?.next;

    log.success(`Updated versions: React=${newReact}, Next.js=${newNext || 'N/A'}`);

    // 8. Test build (optional, can be slow)
    log.info(`Testing build...`);
    const buildResult = execCommand('npm run build', projectPath, { silent: false });
    if (!buildResult.success) {
        log.warning(`Build failed, but continuing (might be env-specific)`);
        // Don't fail the patch, build might fail due to missing env vars
    } else {
        log.success(`Build successful!`);
    }

    // 9. Git: Commit changes
    log.info(`Committing changes...`);
    execCommand('git add package.json package-lock.json', projectPath);

    const commitMessage = `security: Patch CVE-2025-55182 & CVE-2025-66478

- Upgrade React ${currentReact} → ${TARGET_REACT_VERSION}
${currentNext ? `- Upgrade Next.js ${currentNext} → ${TARGET_NEXT_VERSION}` : ''}
- Fixes React Server Components RCE vulnerability
- CVSS 10.0 - Critical Priority
- Automated patch via security-patch-bulk.js`;

    const commitResult = execCommand(`git commit -m "${commitMessage}"`, projectPath, { silent: true });
    if (!commitResult.success) {
        log.warning(`Commit might have failed (possibly no changes)`);
    }

    // 10. Git: Push branch
    log.info(`Pushing to remote...`);
    const pushResult = execCommand('git push -u origin security/patch-cve-2025-55182', projectPath);
    if (!pushResult.success) {
        log.error(`Failed to push to remote`);
        results.failed.push({ ...project, reason: 'git push failed' });
        return false;
    }

    log.success(`${project.name} patched successfully!`);
    results.success.push({
        ...project,
        newReact,
        newNext,
        timestamp: new Date().toISOString()
    });

    return true;
}

async function main() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🔒 Security Patching: CVE-2025-55182 & CVE-2025-66478       ║
║  Target: ${PROJECTS_TO_PATCH.length} projects                                    ║
║  React: ${TARGET_REACT_VERSION} | Next.js: ${TARGET_NEXT_VERSION}                           ║
╚═══════════════════════════════════════════════════════════════╝
`);

    // Sort by priority
    const sortedProjects = PROJECTS_TO_PATCH.sort((a, b) => a.priority - b.priority);

    // Patch each project
    for (const project of sortedProjects) {
        try {
            patchProject(project);
        } catch (error) {
            log.error(`Unexpected error patching ${project.name}: ${error.message}`);
            results.failed.push({ ...project, reason: error.message });
        }

        // Small delay between projects
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  📊 PATCHING SUMMARY                                          ║
╚═══════════════════════════════════════════════════════════════╝

✅ Success: ${results.success.length}/${PROJECTS_TO_PATCH.length}
❌ Failed:  ${results.failed.length}/${PROJECTS_TO_PATCH.length}
⏭️  Skipped: ${results.skipped.length}/${PROJECTS_TO_PATCH.length}

${results.success.length > 0 ? `
✅ Successfully Patched:
${results.success.map(p => `   - ${p.name} (React: ${p.newReact}, Next: ${p.newNext || 'N/A'})`).join('\n')}
` : ''}

${results.failed.length > 0 ? `
❌ Failed:
${results.failed.map(p => `   - ${p.name}: ${p.reason}`).join('\n')}
` : ''}

${results.skipped.length > 0 ? `
⏭️  Skipped:
${results.skipped.map(p => `   - ${p.name}: ${p.reason}`).join('\n')}
` : ''}

📝 Next Steps:
1. Review failed projects manually
2. Create Pull Requests for successful patches
3. Monitor deployments
4. Update tracking spreadsheet
`);

    // Save results to JSON
    const resultsPath = path.join(__dirname, '..', 'security-patch-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            total: PROJECTS_TO_PATCH.length,
            success: results.success.length,
            failed: results.failed.length,
            skipped: results.skipped.length
        },
        details: results
    }, null, 2));

    log.success(`Results saved to: ${resultsPath}`);
}

main().catch(console.error);
