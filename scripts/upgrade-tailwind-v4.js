#!/usr/bin/env node

/**
 * Upgrade Tailwind CSS to v4.0
 * 
 * Usage: node upgrade-tailwind-v4.js <repo-name>
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
        // console.log(`👉 Running: ${command}`);
        return execSync(command, { encoding: 'utf-8', stdio: 'inherit', ...options });
    } catch (error) {
        if (!options.ignoreError) throw error;
        return null;
    }
}

function cleanup() {
    if (fs.existsSync(repoPath)) {
        console.log('🧹 Cleaning up temporary directory...');
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
        try {
            run(`gh repo clone skquievreux/${repoName} ${repoPath}`);
        } catch (e) {
            console.error(`❌ Failed to clone skquievreux/${repoName}. Check your permissions or repo name.`);
            process.exit(1);
        }

        // Detect Default Branch
        let defaultBranch = 'main';
        try {
            const remoteShow = run('git remote show origin', { cwd: repoPath, stdio: 'pipe' });
            const match = remoteShow.match(/HEAD branch: (.*)/);
            if (match && match[1]) {
                defaultBranch = match[1];
                console.log(`👉 Detected default branch: ${defaultBranch}`);
            }
        } catch (e) {
            console.warn('⚠️ Could not detect default branch, defaulting to main');
        }

        // Detect Type
        const pkgPath = path.join(repoPath, 'package.json');
        if (!fs.existsSync(pkgPath)) {
            console.error('❌ No package.json found. Is this a JS/TS project?');
            cleanup();
            process.exit(1);
        }

        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        const isESM = pkg.type === 'module';

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
            'src/styles/globals.css',
            'src/styles/main.css',
            'app/globals.css',
            'src/app/globals.css',
            'styles/globals.css',
            'styles/main.css'
        ];

        let cssFileFound = false;
        for (const file of cssFiles) {
            const fullPath = path.join(repoPath, file);
            if (fs.existsSync(fullPath)) {
                console.log(`   Found CSS file: ${file}`);
                let content = fs.readFileSync(fullPath, 'utf-8');

                // Replace old directives with new import
                // We remove the lines entirely to avoid clutter
                content = content.replace(/@tailwind\s+base;?\n?/g, '');
                content = content.replace(/@tailwind\s+components;?\n?/g, '');
                content = content.replace(/@tailwind\s+utilities;?\n?/g, '');

                // Add new import at top if not present
                if (!content.includes('@import "tailwindcss";')) {
                    content = '@import "tailwindcss";\n' + content;
                }

                // Add theme config if needed (simplified check)
                // In v4, theme is often configured in CSS. We add a placeholder if it looks empty.
                if (!content.includes('@theme') && !content.includes('--color-')) {
                    // Only add if we think they might need it, otherwise keep it clean.
                    // For now, let's NOT force a theme block unless requested, to keep it minimal.
                    // content += '\n\n@theme {\n  /* Add your theme variables here */\n}\n';
                }

                fs.writeFileSync(fullPath, content);
                cssFileFound = true;
                console.log(`   ✅ Updated ${file}`);
                break; // Only update main css file
            }
        }

        if (!cssFileFound) console.warn('⚠️  No main CSS file found to update. You may need to add @import "tailwindcss"; manually.');

        // 3. Update Config (Vite or PostCSS)
        if (isVite) {
            console.log('⚙️  Updating Vite config...');
            const viteConfigPath = path.join(repoPath, 'vite.config.ts');
            const viteConfigJsPath = path.join(repoPath, 'vite.config.js');
            const targetVitePath = fs.existsSync(viteConfigPath) ? viteConfigPath : (fs.existsSync(viteConfigJsPath) ? viteConfigJsPath : null);

            if (targetVitePath) {
                let content = fs.readFileSync(targetVitePath, 'utf-8');
                if (!content.includes('@tailwindcss/vite')) {
                    // Robust import injection
                    if (content.includes('import { defineConfig }')) {
                        content = content.replace(/import\s*{\s*defineConfig\s*}\s*from\s*['"]vite['"];?/, 'import { defineConfig } from "vite";\nimport tailwindcss from "@tailwindcss/vite";');
                    } else if (content.includes('import {') && content.includes('} from "vite"')) {
                        // Generic import match
                        content = 'import tailwindcss from "@tailwindcss/vite";\n' + content;
                    } else {
                        // Fallback
                        content = 'import tailwindcss from "@tailwindcss/vite";\n' + content;
                    }

                    // Robust plugin injection
                    // Looks for plugins: [ ... ]
                    // We use a more flexible regex to catch plugins: [
                    if (content.match(/plugins:\s*\[/)) {
                        content = content.replace(/plugins:\s*\[/, 'plugins: [tailwindcss(), ');
                    } else {
                        console.warn('⚠️  Could not find "plugins: []" in vite config. Please add tailwindcss() manually.');
                        // Try to append to end of file as a comment if we can't find it
                        content += '\n// TODO: Add tailwindcss() to your Vite plugins list\n';
                    }

                    fs.writeFileSync(targetVitePath, content);
                    console.log(`   ✅ Updated ${path.basename(targetVitePath)}`);
                } else {
                    console.log(`   ℹ️  ${path.basename(targetVitePath)} already contains @tailwindcss/vite`);
                }
            } else {
                console.warn('⚠️  Vite project detected but no vite.config.{ts,js} found.');
            }
        } else {
            console.log('⚙️  Updating PostCSS config...');
            // Check for existing config files
            const possibleConfigs = ['postcss.config.js', 'postcss.config.mjs', 'postcss.config.cjs'];
            let existingConfig = possibleConfigs.find(c => fs.existsSync(path.join(repoPath, c)));

            const postcssPath = path.join(repoPath, existingConfig || (isESM ? 'postcss.config.js' : 'postcss.config.js'));

            let postcssContent;
            if (isESM || postcssPath.endsWith('.mjs')) {
                postcssContent = `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};`;
            } else {
                postcssContent = `module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};`;
            }

            fs.writeFileSync(postcssPath, postcssContent);
            console.log(`   ✅ Updated ${path.basename(postcssPath)}`);
        }

        // 4. Remove old config
        const oldConfig = path.join(repoPath, 'tailwind.config.js');
        const oldConfigTs = path.join(repoPath, 'tailwind.config.ts');

        [oldConfig, oldConfigTs].forEach(cfg => {
            if (fs.existsSync(cfg)) {
                console.log(`🗑️  Renaming legacy ${path.basename(cfg)} (migrated to CSS variables)...`);
                fs.renameSync(cfg, cfg + '.backup');
            }
        });

        // 5. Commit & PR
        console.log('💾 Committing changes...');
        run('git checkout -b upgrade/tailwind-v4', { cwd: repoPath });
        run('git add .', { cwd: repoPath });
        run('git commit -m "chore: upgrade to Tailwind CSS v4.0"', { cwd: repoPath });

        console.log('🚀 Pushing branch...');
        run(`git push -u origin upgrade/tailwind-v4`, { cwd: repoPath });

        console.log('🚀 Creating PR...');
        // Use single quotes for body to avoid shell expansion issues with backticks
        const prBody = 'Upgrades the project to Tailwind CSS v4.0 for better performance and simplified configuration.\\n\\n**Changes:**\\n- Installed `tailwindcss@next` and related packages\\n- Updated CSS entry point with `@import "tailwindcss";`\\n- Configured Vite/PostCSS plugin\\n- Renamed legacy `tailwind.config.js` to backup';

        run(`gh pr create --title "chore: Upgrade to Tailwind CSS v4.0" --body "${prBody}" --base ${defaultBranch} --head upgrade/tailwind-v4`, { cwd: repoPath });

        console.log('✅ Done!');
        cleanup();

    } catch (error) {
        console.error('❌ Failed:', error.message);
        cleanup();
        process.exit(1);
    }
}

main();
