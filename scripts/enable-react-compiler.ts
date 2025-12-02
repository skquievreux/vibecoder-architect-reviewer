import * as fs from 'fs';
import * as path from 'path';

const targetDir = process.argv[2] || '../';
const absoluteTarget = path.resolve(targetDir);

console.log(`🔧 Enabling React Compiler in: ${absoluteTarget}`);

const run = () => {
    const repos = fs.readdirSync(absoluteTarget, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

    let updatedCount = 0;

    repos.forEach(repo => {
        const repoPath = path.join(absoluteTarget, repo);
        const nextConfigTsPath = path.join(repoPath, 'next.config.ts');
        const nextConfigJsPath = path.join(repoPath, 'next.config.js');

        if (fs.existsSync(nextConfigTsPath)) {
            try {
                let content = fs.readFileSync(nextConfigTsPath, 'utf-8');

                // Check if already enabled
                if (content.includes('reactCompiler: true')) {
                    console.log(`[${repo}] React Compiler already enabled.`);
                    return;
                }

                // Regex to find the config object
                // Looking for "const nextConfig: NextConfig = {"
                const configRegex = /const nextConfig:\s*NextConfig\s*=\s*{/;

                if (configRegex.test(content)) {
                    content = content.replace(configRegex, 'const nextConfig: NextConfig = {\n  reactCompiler: true,');
                    fs.writeFileSync(nextConfigTsPath, content);
                    console.log(`[${repo}] Enabled React Compiler in next.config.ts`);
                    updatedCount++;
                } else {
                    console.warn(`[${repo}] Could not parse next.config.ts structure.`);
                }

            } catch (e) {
                console.error(`[${repo}] Failed to read next.config.ts`);
            }
        } else if (fs.existsSync(nextConfigJsPath)) {
            console.warn(`[${repo}] Found next.config.js. Please migrate to next.config.ts to enable React Compiler automatically.`);
        }
    });

    console.log(`✨ Done. Updated ${updatedCount} files.`);
};

run();
