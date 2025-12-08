const fs = require('fs');
const path = require('path');
const readline = require('readline');

const targetDir = process.argv[2] || '../';
const absoluteTarget = path.resolve(targetDir);

const TARGET_SUPABASE_VERSION = "^2.49.4";

let rl;
if (!process.argv.includes('--yes')) {
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

console.log(`🔧 Standardizing Supabase versions in: ${absoluteTarget}`);
console.log(`Target Supabase: ${TARGET_SUPABASE_VERSION}`);

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
                let modified = false;

                if (pkg.dependencies && pkg.dependencies['@supabase/supabase-js']) {
                    if (pkg.dependencies['@supabase/supabase-js'] !== TARGET_SUPABASE_VERSION) {
                        pkg.dependencies['@supabase/supabase-js'] = TARGET_SUPABASE_VERSION;
                        modified = true;
                    }
                }

                if (modified) {
                    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
                    console.log(`[${repo}] Updated @supabase/supabase-js to ${TARGET_SUPABASE_VERSION}`);
                    updatedCount++;
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
