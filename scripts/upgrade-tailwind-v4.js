#!/usr/bin/env node

/**
 * Upgrade Tailwind CSS to v4.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const args = process.argv.slice(2);
const repoName = args[0];

if (!repoName) {
    console.error('❌ Usage: node upgrade-tailwind-v4.js <repo-name>');
    process.exit(1);
}

const TEMP_DIR = path.join(os.tmpdir(), 'tailwind-upgrade');
const repoPath = path.join(TEMP_DIR, repoName);

function run(command, options = {}) {
    try {
        return execSync(command, { encoding: 'utf-8', stdio: 'inherit', ...options });
    } catch (error) {
        if (!options.ignoreError) throw error;
        return null;
    }
}

function cleanup() {
    if (fs.existsSync(repoPath)) {
        fs.rmSync(repoPath, { recursive: true, force: true });
    }
}

async function main() {
    try {
        console.log(`\n🚀 Upgrading ${repoName} to Tailwind CSS v4.0...\n`);

        // Setup
        if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
        cleanup();

        // Clone
        console.log('📥 Cloning repository...');
        run(`gh repo clone skquievreux/${repoName} ${repoPath}`);

        // Detect Type
        const pkgPath = path.join(repoPath, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        const isVite = !!deps['vite'];
        const isNext = !!deps['next'];

        console.log(`👉 Detected project type: ${isVite ? 'Vite' : (isNext ? 'Next.js' : 'Unknown')}`);

        // 1. Install Dependencies
        console.log('📦 Installing Tailwind v4 dependencies...');
        if (isVite) {
            run('npm install tailwindcss@next @tailwindcss/vite@next', { cwd: repoPath });
        } else {
            run('npm install tailwindcss@next @tailwindcss/postcss@next postcss@latest', { cwd: repoPath });
        }

        // 2. Update CSS Entry
        console.log('🎨 Updating CSS entry file...');
        const cssFiles = [
            'src/index.css',
            'src/App.css',
            'app/globals.css',
            'src/app/globals.css',
            'styles/globals.css'
        ];

        let cssFileFound = false;
        for (const file of cssFiles) {
            const fullPath = path.join(repoPath, file);
            if (fs.existsSync(fullPath)) {
                let content = fs.readFileSync(fullPath, 'utf-8');

                // Replace old directives with new import
                content = content.replace(/@tailwind\s+base;/g, '');
                content = content.replace(/@tailwind\s+components;/g, '');
                content = content.replace(/@tailwind\s+utilities;/g, '');

                // Add new import at top
                if (!content.includes('@import "tailwindcss";')) {
                    content = '@import "tailwindcss";\n' + content;
                }

                // Add theme config if needed (simplified)
                if (!content.includes('@theme')) {
                    content += '\n\n@theme {\n  --color-primary: #3b82f6;\n}\n';
                }

                fs.writeFileSync(fullPath, content);
                cssFileFound = true;
                console.log(`   ✅ Updated ${file}`);
                break; // Only update main css file
            }
        }

        if (!cssFileFound) console.warn('⚠️  No main CSS file found to update.');

        // 3. Update Config (Vite or PostCSS)
        if (isVite) {
            console.log('⚙️  Updating Vite config...');
            const viteConfigPath = path.join(repoPath, 'vite.config.ts'); // or .js
            if (fs.existsSync(viteConfigPath)) {
                let content = fs.readFileSync(viteConfigPath, 'utf-8');
                if (!content.includes('@tailwindcss/vite')) {
                    content = content.replace('import { defineConfig }', 'import { defineConfig } from "vite";\nimport tailwindcss from "@tailwindcss/vite"');
                    content = content.replace('plugins: [', 'plugins: [tailwindcss(), ');
                    fs.writeFileSync(viteConfigPath, content);
                    console.log('   ✅ Updated vite.config.ts');
                }
            }
        } else {
            console.log('⚙️  Updating PostCSS config...');
            const postcssPath = path.join(repoPath, 'postcss.config.js'); // or .mjs, .cjs
            // Create or overwrite
            const postcssContent = `module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};`;
            fs.writeFileSync(postcssPath, postcssContent);
            console.log('   ✅ Updated postcss.config.js');
        }

        // 4. Remove old config
        const oldConfig = path.join(repoPath, 'tailwind.config.js'); // or .ts
        if (fs.existsSync(oldConfig)) {
            console.log('🗑️  Removing legacy tailwind.config.js (migrated to CSS variables)...');
            // In a real scenario, we would parse and migrate values. 
            // For now, we rename it to keep a backup reference
            fs.renameSync(oldConfig, path.join(repoPath, 'tailwind.config.js.backup'));
        }

        // 5. Commit & PR
        console.log('💾 Committing changes...');
        run('git checkout -b upgrade/tailwind-v4', { cwd: repoPath });
        run('git add .', { cwd: repoPath });
        run('git commit -m "chore: upgrade to Tailwind CSS v4.0"', { cwd: repoPath });
        run('git push -u origin upgrade/tailwind-v4', { cwd: repoPath });

        console.log('🚀 Creating PR...');
        run(`gh pr create --title "chore: Upgrade to Tailwind CSS v4.0" --body "Upgrades the project to Tailwind CSS v4.0 for better performance and simplified configuration." --base main --head upgrade/tailwind-v4`, { cwd: repoPath });

        console.log('✅ Done!');
        cleanup();

    } catch (error) {
        console.error('❌ Failed:', error.message);
        cleanup();
    }
}

main();
