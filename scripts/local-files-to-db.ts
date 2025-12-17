
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load env explicitly if needed, but dotenv-cli handles it usually
const prisma = new PrismaClient();

const TARGET_ROOT = process.argv[2] || '../'; // Parent folder by default
const ALLOWED_FILES = [
    'openapi.json', 'public/openapi.json', 'docs/openapi.json', 'swagger.json',
    'package.json', 'fly.toml', 'vercel.json'
];

async function main() {
    const absoluteTarget = path.resolve(TARGET_ROOT);
    console.log(`🚀 Scanning local repositories in: ${absoluteTarget}`);

    if (!fs.existsSync(absoluteTarget)) {
        console.error(`Target directory ${absoluteTarget} does not exist.`);
        return;
    }

    const directories = fs.readdirSync(absoluteTarget, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

    console.log(`Found ${directories.length} potential repositories.`);

    let updatedCount = 0;

    for (const dirName of directories) {
        const repoPath = path.join(absoluteTarget, dirName);
        console.log(`\n📂 Checking ${dirName}...`);

        // Check package.json
        const pkgPath = path.join(repoPath, 'package.json');
        let pkgJson: any = null;
        if (fs.existsSync(pkgPath)) {
            try {
                pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            } catch {
                console.warn(`  - Invalid package.json in ${dirName}`);
            }
        }

        // Find API Spec
        let apiSpec: string | null = null;
        const specCandidates = ['openapi.json', 'public/openapi.json', 'docs/openapi.json', 'swagger.json'];
        for (const candidate of specCandidates) {
            const specPath = path.join(repoPath, candidate);
            if (fs.existsSync(specPath)) {
                try {
                    apiSpec = fs.readFileSync(specPath, 'utf8');
                    // Check validity
                    JSON.parse(apiSpec);
                    console.log(`  ✅ Found OpenAPI Spec: ${candidate}`);
                    break;
                } catch {
                    console.warn(`  - Found ${candidate} but it was invalid JSON.`);
                    apiSpec = null; // invalid
                }
            }
        }

        // Deployments
        const deployments = [];
        if (fs.existsSync(path.join(repoPath, 'fly.toml'))) deployments.push('Fly.io');
        if (fs.existsSync(path.join(repoPath, 'vercel.json'))) deployments.push('Vercel');
        if (fs.existsSync(path.join(repoPath, 'Dockerfile'))) deployments.push('Docker');

        // Prepare Data for Upsert
        // We match by Name OR NameWithOwner OR URL. 
        // GitHub URL construction:
        // We assume User/Org is 'skquievreux' or whatever is in .git config, but let's assume we match by NAME first.

        // Prepare Data for Upsert
        // We match by Name. If not found, we CREATE it as a "Local" repository.

        try {
            const desc = pkgJson?.description || '';
            const techStack = [];
            if (pkgJson?.dependencies?.react) techStack.push('React');
            if (pkgJson?.dependencies?.next) techStack.push('Next.js');
            if (pkgJson?.dependencies?.['@nestjs/core']) techStack.push('NestJS');
            if (pkgJson?.dependencies?.typescript || pkgJson?.devDependencies?.typescript) techStack.push('TypeScript');
            if (pkgJson?.dependencies?.tailwindcss) techStack.push('Tailwind');
            if (fs.existsSync(path.join(repoPath, 'Dockerfile'))) techStack.push('Docker');

            // Upsert Logic
            let targetId = `local-${dirName}`;

            // Check if repo already exists by name (to avoid duplicates if it has a real githubId)
            const existingByName = await prisma.repository.findFirst({ where: { name: dirName } });
            if (existingByName && existingByName.githubId) {
                targetId = existingByName.githubId;
            }

            // Upsert Repository
            const repo = await prisma.repository.upsert({
                where: { githubId: targetId },
                update: {
                    apiSpec: apiSpec ? apiSpec : undefined,
                    description: desc || undefined,
                    updatedAt: new Date()
                },
                create: {
                    githubId: targetId,
                    name: dirName,
                    fullName: `local/${dirName}`,
                    nameWithOwner: `local/${dirName}`,
                    url: `local://${dirName}`, // Placeholder URL
                    description: desc,
                    isPrivate: true,
                    apiSpec: apiSpec,
                    defaultBranch: 'main'
                }
            });

            // Update Technologies
            if (techStack.length > 0) {
                await prisma.technology.deleteMany({ where: { repositoryId: repo.id } });
                for (const tech of techStack) {
                    await prisma.technology.create({
                        data: {
                            repositoryId: repo.id,
                            name: tech,
                            category: 'LANGUAGE',
                            version: 'detected'
                        }
                    });
                }
            }

            console.log(`  ✅ Synced: ${dirName} ${apiSpec ? '(with OpenAPI)' : ''}`);
            updatedCount++;

        } catch (dbError: any) {
            console.error(`  ❌ Database Error for ${dirName}: ${dbError.message}`);
        }
    }

    console.log(`\n✨ Done. Synced ${updatedCount} repositories to Cloud DB.`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
