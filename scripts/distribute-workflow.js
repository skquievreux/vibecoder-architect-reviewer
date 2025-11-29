const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_WORKFLOW = path.join(__dirname, '../.github/workflows/ecosystem-guard.yml');
const WORKFLOW_FILENAME = 'ecosystem-guard.yml';
const TARGET_ROOT = path.resolve(__dirname, '../../'); // Assuming dashboard is in a folder next to others

console.log(`🚀 Starting Ecosystem Distribution from ${TARGET_ROOT}`);

if (!fs.existsSync(SOURCE_WORKFLOW)) {
    console.error(`❌ Source workflow not found at ${SOURCE_WORKFLOW}`);
    process.exit(1);
}

const workflowContent = fs.readFileSync(SOURCE_WORKFLOW, 'utf-8');

// Get all directories in the parent folder
const repos = fs.readdirSync(TARGET_ROOT, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
    .map(dirent => dirent.name);

let updatedCount = 0;

repos.forEach(repo => {
    const repoPath = path.join(TARGET_ROOT, repo);
    const packageJsonPath = path.join(repoPath, 'package.json');

    // Only target JS/TS projects (those with package.json)
    if (fs.existsSync(packageJsonPath)) {
        const workflowsDir = path.join(repoPath, '.github', 'workflows');

        // Ensure .github/workflows exists
        if (!fs.existsSync(workflowsDir)) {
            fs.mkdirSync(workflowsDir, { recursive: true });
        }

        const targetFile = path.join(workflowsDir, WORKFLOW_FILENAME);
        fs.writeFileSync(targetFile, workflowContent);
        console.log(`✅ Installed guard in: ${repo}`);
        updatedCount++;
    } else {
        console.log(`Skipping ${repo} (no package.json)`);
    }
});

console.log(`\n🎉 Distribution complete! Updated ${updatedCount} repositories.`);
console.log(`Next step: Commit and push changes in each repository.`);
