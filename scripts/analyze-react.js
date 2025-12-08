const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('/tmp/repos.json', 'utf-8'));
const repos = Array.isArray(rawData) ? rawData : (rawData.repos || []);

const reactRepos = repos
    .map(r => ({
        name: r.repo.name,
        react: r.technologies.find(t => t.name === 'React')?.version || null,
        nextjs: r.technologies.find(t => t.name === 'Next.js')?.version || null,
        isPrivate: r.repo.isPrivate,
        url: r.repo.url
    }))
    .filter(r => r.react !== null)
    .sort((a, b) => {
        // Sort by React version
        const versionA = a.react || '';
        const versionB = b.react || '';
        return versionA.localeCompare(versionB);
    });

console.log('\n=== REACT VERSION ANALYSIS ===\n');
console.log(`Total repositories with React: ${reactRepos.length}\n`);

// Group by version
const byVersion = {};
reactRepos.forEach(r => {
    const version = r.react;
    if (!byVersion[version]) byVersion[version] = [];
    byVersion[version].push(r);
});

// Display grouped results
Object.keys(byVersion).sort().forEach(version => {
    const repos = byVersion[version];
    console.log(`\n📦 React ${version} (${repos.length} repos):`);
    repos.forEach(r => {
        console.log(`  - ${r.name} ${r.nextjs ? `(Next.js ${r.nextjs})` : ''}`);
    });
});

// Identify migration candidates
console.log('\n\n=== MIGRATION PRIORITIES ===\n');

const needsUpgrade = reactRepos.filter(r => {
    const v = r.react;
    return !v.includes('19.2');
});

console.log(`🔴 HIGH PRIORITY - Upgrade to React 19.2.0: ${needsUpgrade.length} repos\n`);

// Categorize by current version
const react18 = needsUpgrade.filter(r => r.react.includes('18'));
const react19_1 = needsUpgrade.filter(r => r.react.includes('19.1'));
const react19_0 = needsUpgrade.filter(r => r.react.includes('19.0'));

if (react18.length > 0) {
    console.log(`\n⚠️  React 18.x → 19.2.0 (${react18.length} repos - CRITICAL):`);
    react18.forEach(r => console.log(`  - ${r.name}`));
}

if (react19_0.length > 0) {
    console.log(`\n⚠️  React 19.0.x → 19.2.0 (${react19_0.length} repos):`);
    react19_0.forEach(r => console.log(`  - ${r.name}`));
}

if (react19_1.length > 0) {
    console.log(`\n⚠️  React 19.1.x → 19.2.0 (${react19_1.length} repos):`);
    react19_1.forEach(r => console.log(`  - ${r.name}`));
}

const upToDate = reactRepos.filter(r => r.react.includes('19.2'));
console.log(`\n\n✅ Already on React 19.2.0: ${upToDate.length} repos`);

// Export migration list
const migrationList = needsUpgrade.map(r => ({
    name: r.name,
    currentReact: r.react,
    targetReact: '^19.2.0',
    nextjs: r.nextjs,
    url: r.url
}));

fs.writeFileSync('/tmp/react-migration-list.json', JSON.stringify(migrationList, null, 2));
console.log(`\n📄 Migration list saved to: /tmp/react-migration-list.json`);
