const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Projekte, die noch gepatcht werden müssen
const PENDING_PROJECTS = [
    'playlist_generator',
    'visualimagecomposer',
    'youtube-landing-page',
    'Artheria-Healing-Visualizer',
    'media-project-manager',
    'visual-flyer-snap',
    'sound-bowl-echoes',
    'inspect-whisper',
    'clip-sync-collab',
    'broetchen-wochenende-bestellung',
    'bit-blast-studio',
    'birdie-flight-revamp',
    'art-vibe-gen',
    'albumpromotion',
    'agent-dialogue-manager',
    'ai-portfolio-fly-website',
];

async function analyzePendingProjects() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  📋 Analyzing Pending Security Patches                       ║
║  Projects: ${PENDING_PROJECTS.length}                                            ║
╚═══════════════════════════════════════════════════════════════╝
`);

    const results = {
        localExists: [],
        needsCloning: [],
        notInDatabase: [],
        alreadySafe: [],
    };

    for (const projectName of PENDING_PROJECTS) {
        console.log(`\n🔍 Analyzing: ${projectName}`);

        // 1. Check in database
        const repo = await prisma.repository.findFirst({
            where: {
                name: {
                    equals: projectName,
                    mode: 'insensitive'
                }
            },
            include: {
                technologies: true
            }
        });

        if (!repo) {
            console.log(`   ❌ Not found in database`);
            results.notInDatabase.push(projectName);
            continue;
        }

        console.log(`   ✅ Found in database`);
        console.log(`   📦 GitHub: ${repo.url || 'N/A'}`);
        console.log(`   🔒 Private: ${repo.isPrivate ? 'Yes' : 'No'}`);

        // 2. Check React/Next.js versions
        const reactTech = repo.technologies.find(t =>
            ['React', 'react'].includes(t.name)
        );
        const nextTech = repo.technologies.find(t =>
            ['Next.js', 'next', 'NextJS'].includes(t.name)
        );

        console.log(`   ⚛️  React: ${reactTech?.version || 'N/A'}`);
        console.log(`   📦 Next.js: ${nextTech?.version || 'N/A'}`);

        // 3. Check if vulnerable
        const isReactVulnerable = reactTech?.version &&
            reactTech.version.match(/19\.[0-2]\.0/);
        const isNextVulnerable = nextTech?.version &&
            (nextTech.version.match(/15\.[0-4]\./) ||
                nextTech.version.match(/16\.0\.[0-6]/));

        if (!isReactVulnerable && !isNextVulnerable) {
            console.log(`   ✅ Already safe!`);
            results.alreadySafe.push({
                name: projectName,
                react: reactTech?.version,
                next: nextTech?.version,
                url: repo.url
            });
            continue;
        }

        console.log(`   🔴 VULNERABLE - Needs patching`);

        // 4. Check if exists locally
        const localPath = path.join('C:\\CODE\\GIT', projectName);
        const exists = fs.existsSync(localPath);

        if (exists) {
            console.log(`   ✅ Exists locally: ${localPath}`);
            results.localExists.push({
                name: projectName,
                path: localPath,
                react: reactTech?.version,
                next: nextTech?.version,
                url: repo.url
            });
        } else {
            console.log(`   ⬇️  Needs cloning from: ${repo.url}`);
            results.needsCloning.push({
                name: projectName,
                url: repo.url,
                isPrivate: repo.isPrivate,
                react: reactTech?.version,
                next: nextTech?.version
            });
        }
    }

    // Summary
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  📊 ANALYSIS SUMMARY                                          ║
╚═══════════════════════════════════════════════════════════════╝

✅ Already Safe: ${results.alreadySafe.length}/${PENDING_PROJECTS.length}
📁 Exists Locally: ${results.localExists.length}/${PENDING_PROJECTS.length}
⬇️  Needs Cloning: ${results.needsCloning.length}/${PENDING_PROJECTS.length}
❌ Not in Database: ${results.notInDatabase.length}/${PENDING_PROJECTS.length}

${results.alreadySafe.length > 0 ? `
✅ Already Safe (No Action Needed):
${results.alreadySafe.map(p => `   - ${p.name} (React: ${p.react || 'N/A'}, Next: ${p.next || 'N/A'})`).join('\n')}
` : ''}

${results.localExists.length > 0 ? `
📁 Exists Locally (Ready to Patch):
${results.localExists.map(p => `   - ${p.name}
     Path: ${p.path}
     React: ${p.react} → 19.2.3
     Next: ${p.next || 'N/A'} → 16.1.0`).join('\n')}
` : ''}

${results.needsCloning.length > 0 ? `
⬇️  Needs Cloning:
${results.needsCloning.map(p => `   - ${p.name}
     URL: ${p.url}
     Private: ${p.isPrivate ? 'Yes (needs auth)' : 'No'}
     React: ${p.react} → 19.2.3
     Next: ${p.next || 'N/A'} → 16.1.0`).join('\n')}
` : ''}

${results.notInDatabase.length > 0 ? `
❌ Not in Database (Skip):
${results.notInDatabase.map(p => `   - ${p}`).join('\n')}
` : ''}
`);

    // Generate action plan
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🎯 ACTION PLAN                                               ║
╚═══════════════════════════════════════════════════════════════╝

${results.localExists.length > 0 ? `
STEP 1: Patch Local Projects (${results.localExists.length} projects)
────────────────────────────────────────────────────────────────
Run: node scripts/security-patch-local.js

This will patch:
${results.localExists.map(p => `  - ${p.name}`).join('\n')}
` : ''}

${results.needsCloning.length > 0 ? `
STEP 2: Clone & Patch Remote Projects (${results.needsCloning.length} projects)
────────────────────────────────────────────────────────────────
Option A - Automated (Recommended):
  Run: node scripts/security-patch-clone-and-patch.js

Option B - Manual:
${results.needsCloning.map((p, i) => `
  ${i + 1}. ${p.name}:
     git clone ${p.url} C:\\CODE\\GIT\\${p.name}
     cd C:\\CODE\\GIT\\${p.name}
     git checkout -b security/patch-cve-2025-55182
     npm install react@19.2.3 react-dom@19.2.3 next@16.1.0
     npm run build
     git add package.json package-lock.json
     git commit -m "security: Patch CVE-2025-55182"
     git push -u origin security/patch-cve-2025-55182
`).join('\n')}
` : ''}

${results.alreadySafe.length === PENDING_PROJECTS.length ? `
🎉 ALL PROJECTS ARE ALREADY SAFE!
No further action needed.
` : ''}
`);

    // Save results
    const resultsPath = path.join(__dirname, '..', 'pending-patches-analysis.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            total: PENDING_PROJECTS.length,
            alreadySafe: results.alreadySafe.length,
            localExists: results.localExists.length,
            needsCloning: results.needsCloning.length,
            notInDatabase: results.notInDatabase.length
        },
        details: results
    }, null, 2));

    console.log(`\n✅ Analysis saved to: ${resultsPath}`);

    await prisma.$disconnect();
}

analyzePendingProjects().catch(console.error);
