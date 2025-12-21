const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test mit einem einzelnen Projekt
const TEST_PROJECT = {
    name: 'melody-maker', // Ändern Sie dies für andere Projekte
    priority: 1,
    currentReact: '^19.2.0',
    currentNext: '^15.1.6'
};

const BASE_DIR = 'C:\\CODE\\GIT';
const TARGET_REACT_VERSION = '19.2.3';
const TARGET_NEXT_VERSION = '16.1.0';

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🧪 Security Patch Test - Single Project                     ║
║  Project: ${TEST_PROJECT.name.padEnd(48)} ║
╚═══════════════════════════════════════════════════════════════╝
`);

const projectPath = path.join(BASE_DIR, TEST_PROJECT.name);

// Step 1: Check project exists
console.log(`\n1️⃣  Checking project directory...`);
if (!fs.existsSync(projectPath)) {
    console.log(`❌ Project not found: ${projectPath}`);
    console.log(`\n💡 Available projects in ${BASE_DIR}:`);
    const dirs = fs.readdirSync(BASE_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .slice(0, 20);
    dirs.forEach(d => console.log(`   - ${d}`));
    process.exit(1);
}
console.log(`✅ Project found: ${projectPath}`);

// Step 2: Check package.json
console.log(`\n2️⃣  Checking package.json...`);
const packageJsonPath = path.join(projectPath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.log(`❌ package.json not found`);
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentReact = packageJson.dependencies?.react;
const currentNext = packageJson.dependencies?.next;

console.log(`✅ package.json found`);
console.log(`   Current React: ${currentReact || 'Not found'}`);
console.log(`   Current Next.js: ${currentNext || 'Not found'}`);

// Step 3: Check if vulnerable
console.log(`\n3️⃣  Vulnerability check...`);
const isReactVulnerable = currentReact && currentReact.match(/19\.[0-2]\.0/);
const isNextVulnerable = currentNext && (currentNext.match(/15\.[0-4]\./) || currentNext.match(/16\.0\.[0-6]/));

if (isReactVulnerable) {
    console.log(`🔴 VULNERABLE React version detected: ${currentReact}`);
} else if (currentReact) {
    console.log(`✅ React version is safe: ${currentReact}`);
} else {
    console.log(`⚠️  No React dependency found`);
}

if (isNextVulnerable) {
    console.log(`🔴 VULNERABLE Next.js version detected: ${currentNext}`);
} else if (currentNext) {
    console.log(`✅ Next.js version is safe: ${currentNext}`);
}

if (!isReactVulnerable && !isNextVulnerable) {
    console.log(`\n✅ Project is already patched! No action needed.`);
    process.exit(0);
}

// Step 4: Git status
console.log(`\n4️⃣  Checking git status...`);
try {
    const gitStatus = execSync('git status --porcelain', { cwd: projectPath, encoding: 'utf8' });
    if (gitStatus.trim()) {
        console.log(`⚠️  Working directory has uncommitted changes:`);
        console.log(gitStatus);
        console.log(`\n💡 Please commit or stash changes before patching.`);
        process.exit(1);
    }
    console.log(`✅ Working directory clean`);
} catch (error) {
    console.log(`❌ Git error: ${error.message}`);
    process.exit(1);
}

// Step 5: Show what will be done
console.log(`\n5️⃣  Patch plan:`);
console.log(`   📦 Install React ${TARGET_REACT_VERSION}`);
console.log(`   📦 Install React-DOM ${TARGET_REACT_VERSION}`);
if (currentNext) {
    console.log(`   📦 Install Next.js ${TARGET_NEXT_VERSION}`);
}
console.log(`   🌿 Create branch: security/patch-cve-2025-55182`);
console.log(`   💾 Commit changes`);
console.log(`   🚀 Push to remote`);

console.log(`\n⏸️  DRY RUN MODE - No changes will be made`);
console.log(`\n💡 To execute the patch, run:`);
console.log(`   node scripts/security-patch-bulk.js`);
console.log(`\n   Or manually:`);
console.log(`   cd ${projectPath}`);
console.log(`   git checkout -b security/patch-cve-2025-55182`);
console.log(`   npm install react@${TARGET_REACT_VERSION} react-dom@${TARGET_REACT_VERSION}${currentNext ? ` next@${TARGET_NEXT_VERSION}` : ''}`);
console.log(`   npm run build`);
console.log(`   git add package.json package-lock.json`);
console.log(`   git commit -m "security: Patch CVE-2025-55182"`);
console.log(`   git push -u origin security/patch-cve-2025-55182`);

console.log(`\n✅ Test completed successfully!`);
