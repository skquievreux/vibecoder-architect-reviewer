import { NextResponse } from 'next/server';

export async function GET() {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
    }

    try {
        // 1. Fetch all repos
        const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&type=all', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!reposRes.ok) throw new Error('Failed to fetch repos');
        const repos = await reposRes.json();

        // 2. Fetch package.json for each repo (parallel)
        const auditResults = await Promise.all(repos.map(async (repo: any) => {
            if (repo.archived) return null;

            try {
                const pkgRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/package.json`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3.raw' // Get raw content
                    }
                });

                if (pkgRes.status === 404) return { repo: repo.name, status: 'NO_PKG' };

                const pkg = await pkgRes.json();

                // 3. Fetch latest workflow run for ecosystem-guard.yml
                let buildStatus = 'UNKNOWN';
                try {
                    const runsRes = await fetch(`https://api.github.com/repos/${repo.full_name}/actions/workflows/ecosystem-guard.yml/runs?per_page=1`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    if (runsRes.ok) {
                        const runs = await runsRes.json();
                        if (runs.workflow_runs && runs.workflow_runs.length > 0) {
                            buildStatus = runs.workflow_runs[0].conclusion || runs.workflow_runs[0].status;
                        }
                    }
                } catch (e) { /* ignore workflow fetch error */ }

                // 4. Check Documentation (README & CHANGELOG)
                let readmeStatus = 'MISSING';
                let readmeLang = 'UNKNOWN';
                let changelogStatus = 'MISSING';

                try {
                    // Check README
                    const readmeRes = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
                        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3.raw' }
                    });
                    if (readmeRes.ok) {
                        const content = await readmeRes.text();
                        readmeStatus = content.length > 100 ? 'OK' : 'SHORT';
                        // Simple language detection
                        if (content.includes('Beschreibung') || content.includes('Inhalt') || content.includes('Funktionen')) {
                            readmeLang = 'DE';
                        } else {
                            readmeLang = 'EN';
                        }
                    }

                    // Check CHANGELOG
                    const changelogRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/CHANGELOG.md`, {
                        headers: { 'Authorization': `Bearer ${token}` } // HEAD request not easily supported by fetch wrapper logic here, using GET metadata
                    });
                    if (changelogRes.ok) changelogStatus = 'OK';

                } catch (e) { /* ignore docs error */ }

                // 5. Fetch Latest Release
                let latestVersion = 'NONE';
                try {
                    const releaseRes = await fetch(`https://api.github.com/repos/${repo.full_name}/releases/latest`, {
                        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
                    });
                    if (releaseRes.ok) {
                        const release = await releaseRes.json();
                        latestVersion = release.tag_name;
                    } else {
                        // Fallback to tags if no releases
                        const tagsRes = await fetch(`https://api.github.com/repos/${repo.full_name}/tags?per_page=1`, {
                            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
                        });
                        if (tagsRes.ok) {
                            const tags = await tagsRes.json();
                            if (tags.length > 0) latestVersion = tags[0].name;
                        }
                    }
                } catch (e) { /* ignore version error */ }

                return {
                    repo: repo.name,
                    node: pkg.engines?.node || 'MISSING',
                    ts: pkg.devDependencies?.typescript || 'MISSING',
                    supabase: pkg.dependencies?.['@supabase/supabase-js'] || 'MISSING',
                    build: buildStatus,
                    docs: {
                        readme: readmeStatus,
                        lang: readmeLang,
                        changelog: changelogStatus
                    },
                    version: latestVersion,
                    url: repo.html_url
                };
            } catch (e) {
                return { repo: repo.name, status: 'ERROR' };
            }
        }));

        // Filter out nulls (archived) and sort
        const cleanResults = auditResults.filter(r => r !== null).sort((a: any, b: any) => a.repo.localeCompare(b.repo));

        return NextResponse.json({ results: cleanResults });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
