const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPOS_DIR = '/tmp/tailwind-analysis';
const GITHUB_USER = 'skquievreux';

// List of repos to check (can be dynamic, but starting with known list)
const REPOS = [
    "vibecoder-architect-reviewer", // Dashboard itself
    "melody-maker",
    "techeroes-quiz",
    "VoiceStage",
    "albumpromotion",
    "sound-bowl-echoes",
    "art-vibe-gen",
    "birdie-flight-revamp",
    "bit-blast-studio",
    "inspect-whisper",
    "ai-portfolio-fly-website",
    "broetchen-wochenende-bestellung",
    "agent-dialogue-manager",
    "clip-sync-collab",
    "visual-flyer-snap",
    "inspect-sync-scribe",
    "youtube-landing-page"
];

async function main() {
    if (!fs.existsSync(REPOS_DIR)) fs.mkdirSync(REPOS_DIR, { recursive: true });

    const results = [];

    console.log('🔍 Analyzing Tailwind versions...\n');

    for (const repo of REPOS) {
        const repoPath = path.join(REPOS_DIR, repo);

        // Clone if not exists (shallow clone for speed)
        if (!fs.existsSync(repoPath)) {
            try {
                execSync(`gh repo clone ${GITHUB_USER}/${repo} ${repoPath} -- --depth 1`, { stdio: 'ignore' });
            } catch (e) {
                console.error(`❌ Failed to clone ${repo}`);
                continue;
            }
        }

        // Analyze package.json
        const pkgPath = path.join(repoPath, 'package.json');
        if (!fs.existsSync(pkgPath)) {
            results.push({ name: repo, status: 'NO_PACKAGE_JSON' });
            continue;
        }

        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        const tailwindVersion = deps['tailwindcss'] || 'NOT_FOUND';
        const isVite = !!deps['vite'];
        const isNext = !!deps['next'];

        let status = 'UNKNOWN';
        if (tailwindVersion === 'NOT_FOUND') status = 'NO_TAILWIND';
        else if (tailwindVersion.includes('4.') || tailwindVersion.includes('^4')) status = 'V4_ALREADY';
        else status = 'NEEDS_UPGRADE';

        results.push({
            name: repo,
            version: tailwindVersion,
            type: isVite ? 'Vite' : (isNext ? 'Next.js' : 'Other'),
            status
        });

        process.stdout.write('.');
    }

    console.log('\n\n📊 Analysis Results:');
    console.table(results);

    // Save results
    fs.writeFileSync('tailwind-status.json', JSON.stringify(results, null, 2));
    console.log('\nSaved to tailwind-status.json');
}

main();
