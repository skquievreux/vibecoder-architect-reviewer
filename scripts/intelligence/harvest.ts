
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Configuration
const OUT_DIR = path.join(process.cwd(), 'data', 'intelligence', 'raw');
const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN || process.env.GITHUB_TOKEN;

async function fetchFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw', // Request raw content
                'User-Agent': 'Vibecoder-Harvester'
            }
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }

        return await response.text();
    } catch (error) {
        console.error(`Error fetching ${path} for ${owner}/${repo}:`, error);
        return null;
    }
}

async function main() {
    console.log("🚜 Starting Portfolio Harvester...");

    // Ensure output directory exists
    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    // Get all repositories
    const repos = await prisma.repository.findMany({
        select: {
            id: true,
            name: true,
            url: true,
            nameWithOwner: true
        }
    });

    console.log(`Found ${repos.length} repositories to harvest.`);

    let successCount = 0;
    let failCount = 0;

    for (const repo of repos) {
        console.log(`Processing ${repo.name}...`);

        // Parse owner and repo name
        let owner = 'skquievreux'; // Default fallback
        let repoName = repo.name;

        if (repo.nameWithOwner) {
            [owner, repoName] = repo.nameWithOwner.split('/');
        } else {
            // Try to parse from URL (e.g. https://github.com/skquievreux/repo)
            const match = repo.url.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (match) {
                owner = match[1];
            }
        }

        if (!GITHUB_TOKEN) {
            console.error("❌ GITHUB_ACCESS_TOKEN is missing! Cannot fetch private repos.");
            process.exit(1);
        }

        // Parallel fetch for speed
        const [readme, packageJson] = await Promise.all([
            fetchFileContent(owner, repoName, 'README.md'),
            fetchFileContent(owner, repoName, 'package.json')
        ]);

        // Parse JSON safely
        let parsedPackageJson = null;
        if (packageJson) {
            try {
                parsedPackageJson = JSON.parse(packageJson);
            } catch (e) {
                console.warn(`⚠️ Invalid JSON in package.json for ${repo.name}`);
            }
        }

        // Construct the data object
        const harvestData = {
            repositoryId: repo.id,
            name: repoName,
            owner: owner,
            harvestedAt: new Date().toISOString(),
            content: {
                readme: readme || null,
                packageJson: parsedPackageJson
            }
        };

        // Save to disk
        const filePath = path.join(OUT_DIR, `${repo.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(harvestData, null, 2));

        if (readme || packageJson) {
            console.log(`✅ Harvested data for ${repo.name}`);
            successCount++;
        } else {
            console.warn(`⚠️ No data found for ${repo.name} (checked README.md & package.json)`);
            failCount++;
        }
    }

    console.log(`\n🎉 Harvest Complete!`);
    console.log(`Successful: ${successCount}`);
    console.log(`Empty/Failed: ${failCount}`);
    console.log(`Data stored in: ${OUT_DIR}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
