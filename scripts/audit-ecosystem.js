const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] || '../'; // Default to parent dir
const absoluteTarget = path.resolve(targetDir);

console.log(`🔍 Auditing Ecosystem in: ${absoluteTarget}`);

if (!fs.existsSync(absoluteTarget)) {
    console.error("Target directory does not exist.");
    process.exit(1);
}

const repos = fs.readdirSync(absoluteTarget, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
    .map(dirent => dirent.name);

console.log(`Found ${repos.length} directories.`);

const results = [];

repos.forEach(repo => {
    const repoPath = path.join(absoluteTarget, repo);
    const packageJsonPath = path.join(repoPath, 'package.json');
    const nvmrcPath = path.join(repoPath, '.nvmrc');

    let nodeEngine = 'MISSING';
    let nvmrc = 'MISSING';
    let tsVersion = 'MISSING';
    let nextVersion = 'MISSING';

    if (fs.existsSync(packageJsonPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            if (pkg.engines && pkg.engines.node) {
                nodeEngine = pkg.engines.node;
            }

            if (pkg.devDependencies && pkg.devDependencies.typescript) {
                tsVersion = pkg.devDependencies.typescript;
            }

            if (pkg.dependencies && pkg.dependencies.next) {
                nextVersion = pkg.dependencies.next;
            }
        } catch (e) {
            nodeEngine = 'ERROR';
        }
    } else {
        nodeEngine = 'NO_PKG_JSON';
    }

    if (fs.existsSync(nvmrcPath)) {
        nvmrc = fs.readFileSync(nvmrcPath, 'utf-8').trim();
    }

    results.push({
        Repo: repo,
        NodeEngine: nodeEngine,
        Nvmrc: nvmrc,
        TypeScript: tsVersion,
        NextJS: nextVersion
    });
});

// Print Table
console.table(results);

// Save to CSV
const csvContent = [
    'Repo,NodeEngine,Nvmrc,TypeScript,NextJS',
    ...results.map(r => `${r.Repo},${r.NodeEngine},${r.Nvmrc},${r.TypeScript},${r.NextJS}`)
].join('\n');

const outputPath = path.join(process.cwd(), 'ecosystem-audit.csv');
fs.writeFileSync(outputPath, csvContent);
console.log(`✅ Audit saved to ${outputPath}`);
