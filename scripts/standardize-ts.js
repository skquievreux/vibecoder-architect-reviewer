const fs = require('fs');
const path = require('path');
const readline = require('readline');

const targetDir = process.argv[2] || '../';
const absoluteTarget = path.resolve(targetDir);

const TARGET_TS_VERSION = "^5.3.0";

let rl;
if (!process.argv.includes('--yes')) {
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}


console.log(`🔧 Standardizing TypeScript versions in: ${absoluteTarget}`);
console.log(`Target TypeScript: ${TARGET_TS_VERSION}`);

const run = () => {
    const repos = fs.readdirSync(absoluteTarget, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

    let updatedCount = 0;

    repos.forEach(repo => {
        const repoPath = path.join(absoluteTarget, repo);
        const packageJsonPath = path.join(repoPath, 'package.json');

        if (fs.existsSync(packageJsonPath)) {
            try {
                const pkgContent = fs.readFileSync(packageJsonPath, 'utf-8');
                const pkg = JSON.parse(pkgContent);

                if (pkg.devDependencies && pkg.devDependencies.typescript) {
                    if (pkg.devDependencies.typescript !== TARGET_TS_VERSION) {
                        pkg.devDependencies.typescript = TARGET_TS_VERSION;
                        fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
                        console.log(`[${repo}] Updated TypeScript to ${TARGET_TS_VERSION}`);
                        updatedCount++;
                    }
                }
            } catch (e) {
                console.error(`[${repo}] Failed to parse package.json`);
            }
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
