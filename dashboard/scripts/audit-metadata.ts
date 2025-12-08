
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

const prisma = new PrismaClient();

async function checkUrl(url: string) {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'VibeCoderBot/1.0' },
            timeout: 5000
        });
        if (!res.ok) return { url, ok: false, status: res.status, image: null };

        const html = await res.text();
        const root = parse(html);
        const image = root.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
            root.querySelector('meta[name="twitter:image"]')?.getAttribute('content');

        return { url, ok: true, status: res.status, image: image || null };
    } catch (e: any) {
        return { url, ok: false, status: e.message, image: null };
    }
}

async function main() {
    console.log("🔍 Starting Ecosystem Metadata Audit...");

    // Get all deployments (using latest deployment per repo ideally, or just all active ones)
    // Simplified: Get all repositories with deployments
    const repos = await prisma.repository.findMany({
        include: { deployments: true, providers: true }
    });

    let total = 0;
    let missing = 0;

    console.log(`Found ${repos.length} repositories.`);

    for (const repo of repos) {
        let targetUrl = repo.customUrl;
        if (!targetUrl && repo.deployments.length > 0) {
            targetUrl = repo.deployments[0].url;
            if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;
        }

        if (targetUrl) {
            process.stdout.write(`Checking ${repo.name} (${targetUrl})... `);
            const result = await checkUrl(targetUrl);
            total++;

            if (!result.ok) {
                console.log(`❌ FAIL (${result.status})`);
            } else if (!result.image) {
                console.log(`⚠️  MISSING OG:IMAGE`);
                missing++;
            } else {
                console.log(`✅ OK`);
            }
        }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Checked: ${total}`);
    console.log(`Missing Metadata: ${missing}`);
    console.log(`Compliance: ${Math.round(((total - missing) / total) * 100)}%`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
