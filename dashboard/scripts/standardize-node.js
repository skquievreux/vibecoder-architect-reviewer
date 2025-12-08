const fs = require('fs');
const path = require('path');
const readline = require('readline');

const targetDir = process.argv[2] || '../';
const absoluteTarget = path.resolve(targetDir);

const TARGET_NODE_ENGINE = ">=20.9.0";
const TARGET_NVMRC = "v20.18.0";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`🔧 Standardizing Node.js versions in: ${absoluteTarget}`);
console.log(`Target Engine: ${TARGET_NODE_ENGINE}`);
console.log(`Target .nvmrc: ${TARGET_NVMRC}`);

const run = () => {
    const repos = fs.readdirSync(absoluteTarget, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

    let updatedCount = 0;

    repos.forEach(repo => {
        const repoPath = path.join(absoluteTarget, repo);
        const packageJsonPath = path.join(repoPath, 'package.json');
        const nvmrcPath = path.join(repoPath, '.nvmrc');

        // 1. Update package.json
        if (fs.existsSync(packageJsonPath)) {
            try {
                const pkgContent = fs.readFileSync(packageJsonPath, 'utf-8');
                const pkg = JSON.parse(pkgContent);

                let changed = false;
                if (!pkg.engines) pkg.engines = {};

                if (pkg.engines.node !== TARGET_NODE_ENGINE) {
                    pkg.engines.node = TARGET_NODE_ENGINE;
                    changed = true;
                }

                if (changed) {
                    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
                    console.log(`[${repo}] Updated package.json engines`);
                    updatedCount++;
                }
            } catch (e) {
                console.error(`[${repo}] Failed to parse package.json`);
            }
        }

        // 2. Update .nvmrc
        let nvmChanged = false;
        if (fs.existsSync(nvmrcPath)) {
            const current = fs.readFileSync(nvmrcPath, 'utf-8').trim();
            if (current !== TARGET_NVMRC) {
                fs.writeFileSync(nvmrcPath, TARGET_NVMRC);
                nvmChanged = true;
            }
        } else {
            fs.writeFileSync(nvmrcPath, TARGET_NVMRC);
            nvmChanged = true;
        }

        if (nvmChanged) {
            console.log(`[${repo}] Updated .nvmrc`);
            updatedCount++;
        }
    });

    console.log(`✨ Done. Updated ${updatedCount} files.`);
    if (rl) rl.close();
};

if (process.argv.includes('--yes')) {
    run();
} else {
    rl.question('Are you sure you want to proceed? (y/n) ', (answer) => {
        if (answer.toLowerCase() !== 'y') {
            console.log("Aborted.");
            process.exit(0);
        }
        run();
    });
}
