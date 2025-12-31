import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const GITHUB_TOKEN_VAR = 'GITHUB_TOKEN';
const PACKAGE_NAME = '@quievreux/ui';
const NOM_REGISTRY = 'https://npm.pkg.github.com';
const NPMRC_CONTENT = `legacy-peer-deps=true
@quievreux:registry=${NOM_REGISTRY}
//npm.pkg.github.com/:_authToken=\${${GITHUB_TOKEN_VAR}}
`;

const TARGET_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('../');

console.log(`🚀 Starting Enhanced UI Rollout to: ${TARGET_DIR}`);

if (!process.env[GITHUB_TOKEN_VAR]) {
    console.warn(`⚠️  WARNING: ${GITHUB_TOKEN_VAR} environment variable is NOT set. npm install might fail.`);
}

const getDirectories = (source: string) =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

// Helper to find file in repo
const findFile = (dir: string, possibilities: string[]): string | null => {
    for (const p of possibilities) {
        const fullPath = path.join(dir, p);
        if (fs.existsSync(fullPath)) return fullPath;
    }
    // Deep search for globals.css only if not found in root/src
    if (possibilities.includes('app/globals.css')) {
        // simple heuristic search
        if (fs.existsSync(path.join(dir, 'src/app/globals.css'))) return path.join(dir, 'src/app/globals.css');
    }
    return null;
};

const repos = getDirectories(TARGET_DIR);

repos.forEach(repo => {
    const repoPath = path.join(TARGET_DIR, repo);
    const packageJsonPath = path.join(repoPath, 'package.json');
    const npmrcPath = path.join(repoPath, '.npmrc');
    const githubWorkflowsDir = path.join(repoPath, '.github', 'workflows');

    // Skip if not a JS/TS project
    if (!fs.existsSync(packageJsonPath)) return;

    console.log(`\n📦 Processing: ${repo}`);

    try {
        // 1. Create/Update .npmrc
        // console.log(`   - Configuring .npmrc...`);
        fs.writeFileSync(npmrcPath, NPMRC_CONTENT);

        // 2. Update CI workflows
        if (fs.existsSync(githubWorkflowsDir)) {
            const workflows = fs.readdirSync(githubWorkflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

            workflows.forEach(workflow => {
                const workflowPath = path.join(githubWorkflowsDir, workflow);
                let content = fs.readFileSync(workflowPath, 'utf8');

                if (content.includes('npm ci') || content.includes('npm install')) {
                    let modified = false;

                    // Inject Permissions
                    if (!content.includes('packages: read')) {
                        if (!content.includes('permissions:')) {
                            content = content.replace(/(runs-on:.*?\n)/, '$1    permissions:\n      contents: read\n      packages: read\n');
                            modified = true;
                        } else if (!content.includes('packages: read')) {
                            content = content.replace(/(permissions:.*?\n)/, '$1      packages: read\n');
                            modified = true;
                        }
                    }

                    // Inject GITHUB_TOKEN env to npm install/ci
                    if (!content.includes('NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}')) {
                        content = content.replace(/(run:\s*npm\s+(?:ci|install)[^\n]*)/, '$1\n      env:\n        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n        NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}');
                        if (content.includes('uses: actions/setup-node') && !content.includes('registry-url:')) {
                            content = content.replace(/(uses:\s*actions\/setup-node.*?\n\s+with:\n)/s, '$1        registry-url: \'https://npm.pkg.github.com\'\n');
                        }
                        modified = true;
                    }

                    if (modified) {
                        fs.writeFileSync(workflowPath, content);
                        // console.log(`   - Updated workflow: ${workflow}`);
                    }
                }
            });
        }

        // 3. Install Package
        process.stdout.write(`   - Installing ${PACKAGE_NAME}... `);
        try {
            execSync(`npm install ${PACKAGE_NAME}`, { cwd: repoPath, stdio: 'pipe' });
            console.log(`✅`);
        } catch (e: any) {
            console.log(`❌ (Manual install required)`);
        }

        // 4. Update Tailwind Config
        const tailwindConfigPath = findFile(repoPath, ['tailwind.config.ts', 'tailwind.config.js', 'tailwind.config.mjs']);
        if (tailwindConfigPath) {
            let content = fs.readFileSync(tailwindConfigPath, 'utf8');
            let modified = false;

            // Add Content Path
            if (!content.includes('@quievreux/ui/dist')) {
                // Ensure content array exists
                if (content.includes('content: [')) {
                    content = content.replace(/content:\s*\[/, 'content: [\n        "./node_modules/@quievreux/ui/dist/**/*.{js,mjs}",');
                    modified = true;
                }
            }

            // Add Colors
            if (!content.includes('--q-color-primary')) {
                // This regex looks for extend: { then colors: {
                if (content.includes('colors: {')) {
                    content = content.replace(/colors:\s*\{/, 'colors: {\n                primary: "hsl(var(--q-color-primary))",\n                secondary: "hsl(var(--q-color-secondary))",');
                    modified = true;
                } else if (content.includes('extend: {')) {
                    // Create colors block if missing inside extend
                    content = content.replace(/extend:\s*\{/, 'extend: {\n            colors: {\n                primary: "hsl(var(--q-color-primary))",\n                secondary: "hsl(var(--q-color-secondary))",\n            },');
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(tailwindConfigPath, content);
                console.log(`   - Updated Tailwind config`);
            }
        }

        // 5. Update CSS
        const cssPath = findFile(repoPath, ['app/globals.css', 'styles/globals.css', 'src/index.css']);
        if (cssPath) {
            let content = fs.readFileSync(cssPath, 'utf8');
            if (!content.includes('@quievreux/ui/styles')) {
                // Prepend to top
                content = `@import '@quievreux/ui/styles';\n` + content;
                fs.writeFileSync(cssPath, content);
                console.log(`   - Updated CSS globals`);
            }
        }

    } catch (err: any) {
        console.error(`   ❌ Error processing ${repo}:`, err.message);
    }
});

console.log('\n✨ Rollout process complete.');
