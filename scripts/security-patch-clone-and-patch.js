const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load analysis results
const analysisPath = path.join(__dirname, '..', 'pending-patches-analysis.json');
const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

const BASE_DIR = 'C:\\CODE\\GIT';
const TARGET_REACT_VERSION = '19.2.3';
const TARGET_NEXT_VERSION = '16.1.0';

const log = {
    info: (msg) => console.log(`ℹ️  ${msg}`),
    success: (msg) => console.log(`✅ ${msg}`),
    error: (msg) => console.log(`❌ ${msg}`),
    warning: (msg) => console.log(`⚠️  ${msg}`),
    step: (msg) => console.log(`\n🔧 ${msg}`),
};

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

async function cloneAndPatchProject(project) {
    log.step(`Processing ${project.name}`);

    const projectPath = path.join(BASE_DIR, project.name);

    // 1. Clone repository
    log.info(`Cloning from ${project.url}...`);

    if (fs.existsSync(projectPath)) {
        log.warning(`Directory already exists, pulling latest changes...`);
        execCommand('git pull', projectPath, { silent: true });
    } else {
        const cloneResult = execCommand(`git clone ${project.url} ${projectPath}`, BASE_DIR);
        if (!cloneResult.success) {
            log.error(`Failed to clone repository`);
            results.failed.push({ ...project, reason: 'Clone failed', error: cloneResult.error });
            return false;
        }
    }

    log.success(`Repository cloned/updated`);

    // 2. Check package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        log.error(`No package.json found`);
        results.skipped.push({ ...project, reason: 'No package.json' });
        return false;
    }

    // 3. Read current versions
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentReact = packageJson.dependencies?.react;
    const currentNext = packageJson.dependencies?.next;

    log.info(`Current versions: React=${currentReact || 'N/A'}, Next.js=${currentNext || 'N/A'}`);

    // 4. Create security branch
    log.info(`Creating security branch...`);
    execCommand('git checkout main', projectPath, { silent: true });
    execCommand('git checkout master', projectPath, { silent: true });
    execCommand('git pull', projectPath, { silent: true });

    const branchResult = execCommand('git checkout -b security/patch-cve-2025-55182', projectPath, { silent: true });
    if (!branchResult.success) {
        log.warning(`Branch might already exist, checking out...`);
        execCommand('git checkout security/patch-cve-2025-55182', projectPath, { silent: true });
    }

    // 5. Install patched versions
    log.info(`Installing patched versions...`);

    let installCommand = `npm install react@${TARGET_REACT_VERSION} react-dom@${TARGET_REACT_VERSION}`;
    if (currentNext || project.next) {
        installCommand += ` next@${TARGET_NEXT_VERSION}`;
    }

    const installResult = execCommand(installCommand, projectPath);
    if (!installResult.success) {
        log.error(`Failed to install dependencies`);
        results.failed.push({ ...project, reason: 'npm install failed' });
        return false;
    }

    // 6. Verify versions
    const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const newReact = updatedPackageJson.dependencies?.react;
    const newNext = updatedPackageJson.dependencies?.next;

    log.success(`Updated versions: React=${newReact}, Next.js=${newNext || 'N/A'}`);

    // 7. Test build (optional)
    log.info(`Testing build...`);
    const buildResult = execCommand('npm run build', projectPath, { silent: false });
    if (!buildResult.success) {
        log.warning(`Build failed, but continuing (might be env-specific)`);
    } else {
        log.success(`Build successful!`);
    }

    // 8. Commit changes
    log.info(`Committing changes...`);
    execCommand('git add package.json package-lock.json', projectPath);

    const commitMessage = `security: Patch CVE-2025-55182 & CVE-2025-66478

- Upgrade React ${currentReact || 'N/A'} → ${TARGET_REACT_VERSION}
${currentNext || project.next ? `- Upgrade Next.js ${currentNext || project.next} → ${TARGET_NEXT_VERSION}` : ''}
- Fixes React Server Components RCE vulnerability
- CVSS 10.0 - Critical Priority
- Automated patch via security-patch-clone-and-patch.js`;

    execCommand(`git commit -m "${commitMessage}"`, projectPath, { silent: true });

    // 9. Push to remote
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
║  🔒 Clone & Patch: CVE-2025-55182 & CVE-2025-66478           ║
║  Projects to clone: ${analysis.details.needsCloning.length}                                  ║
╚═══════════════════════════════════════════════════════════════╝
`);

    const projectsToClone = analysis.details.needsCloning;

    if (projectsToClone.length === 0) {
        console.log(`✅ No projects need cloning. All done!`);
        return;
    }

    console.log(`\n📋 Projects to process:`);
    projectsToClone.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} (${p.isPrivate ? 'Private' : 'Public'})`);
    });

    console.log(`\n⚠️  IMPORTANT:`);
    console.log(`   - Make sure you have GitHub authentication configured`);
    console.log(`   - Private repos require SSH keys or GitHub CLI auth`);
    console.log(`   - This will take ~5 minutes per project`);
    console.log(`\n🚀 Starting in 5 seconds...`);

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Process each project
    for (const project of projectsToClone) {
        try {
            await cloneAndPatchProject(project);
        } catch (error) {
            log.error(`Unexpected error: ${error.message}`);
            results.failed.push({ ...project, reason: error.message });
        }

        // Small delay between projects
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Summary
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  📊 CLONE & PATCH SUMMARY                                     ║
╚═══════════════════════════════════════════════════════════════╝

✅ Success: ${results.success.length}/${projectsToClone.length}
❌ Failed:  ${results.failed.length}/${projectsToClone.length}
⏭️  Skipped: ${results.skipped.length}/${projectsToClone.length}

${results.success.length > 0 ? `
✅ Successfully Patched:
${results.success.map(p => `   - ${p.name}
     React: ${p.newReact}
     Next: ${p.newNext || 'N/A'}
     Branch: security/patch-cve-2025-55182`).join('\n')}
` : ''}

${results.failed.length > 0 ? `
❌ Failed:
${results.failed.map(p => `   - ${p.name}: ${p.reason}`).join('\n')}
` : ''}

📝 Next Steps:
1. Create Pull Requests for successful patches
2. Review failed projects manually
3. Monitor deployments
4. Update security tracking
`);

    // Save results
    const resultsPath = path.join(__dirname, '..', 'clone-patch-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            total: projectsToClone.length,
            success: results.success.length,
            failed: results.failed.length,
            skipped: results.skipped.length
        },
        details: results
    }, null, 2));

    log.success(`Results saved to: ${resultsPath}`);
}

main().catch(console.error);
