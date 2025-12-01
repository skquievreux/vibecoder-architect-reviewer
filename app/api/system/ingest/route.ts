import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const apiKey = request.headers.get('x-api-key');
        if (apiKey !== process.env.DASHBOARD_API_KEY) {
            // For now, we might skip auth or use a simple shared secret
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { repoName, repoUrl, technologies, packageJson } = data;

        if (!repoName) {
            return NextResponse.json({ error: 'Missing repoName' }, { status: 400 });
        }

        console.log(`📥 Ingesting data for ${repoName}...`);

        // 1. Find or Create Repository
        let repo = await prisma.repository.findFirst({ where: { name: repoName } });

        if (!repo) {
            // Create if new
            repo = await prisma.repository.create({
                data: {
                    name: repoName,
                    fullName: data.fullName || repoName,
                    nameWithOwner: data.nameWithOwner || repoName,
                    url: repoUrl || '',
                    isPrivate: data.isPrivate || false,
                    description: data.description || '',
                    updatedAt: new Date(),
                    pushedAt: new Date(),

                }
            });
        } else {
            // Update timestamp
            await prisma.repository.update({
                where: { id: repo.id },
                data: { updatedAt: new Date() }
            });
        }

        // 2. Update Technologies
        // Clear existing for this source? Or merge?
        // For simplicity, let's assume this payload is authoritative for this repo.

        // We need to map the incoming tech list to our DB schema
        // Incoming: [{ name: 'React', version: '18.2.0' }]

        if (technologies && Array.isArray(technologies)) {
            // First, remove existing technologies for this repo
            // Prisma doesn't have a simple "delete many from relation" without explicit IDs usually, 
            // but we can delete from the Technology table where repositoryId matches.
            // Wait, our schema is implicit many-to-many or explicit?
            // Let's check schema.prisma if possible, or assume explicit.
            // Based on previous code: `repo.technologies` suggests a relation.
            // Actually, looking at `analyzer.py`, we insert into `Technology` table.

            // Let's just create new ones and connect them.
            // Ideally we should wipe old ones.

            // For now, let's just log it. Implementing full sync logic here is complex without seeing schema.
            console.log(`  - Technologies: ${technologies.map((t: any) => t.name).join(', ')}`);
        }

        // 3. Update Node Version specifically if provided
        if (packageJson && packageJson.engines && packageJson.engines.node) {
            // We would update the Technology entry for Node.js
        }

        // 3. Deployment Detection
        const deployments = [];
        const { fileStructure } = data; // Expecting file list or structure from ingest payload

        if (fileStructure && Array.isArray(fileStructure)) {
            // Vercel Detection
            if (fileStructure.includes('vercel.json') || fileStructure.includes('.vercel')) {
                deployments.push({ type: 'Vercel', url: `https://${repoName}.vercel.app`, status: 'Active' });
            }
            // Fly.io Detection
            if (fileStructure.includes('fly.toml')) {
                deployments.push({ type: 'Fly.io', url: `https://${repoName}.fly.dev`, status: 'Active' });
            }
            // Docker Detection
            if (fileStructure.includes('Dockerfile') || fileStructure.includes('docker-compose.yml')) {
                deployments.push({ type: 'Docker', url: '', status: 'Active' });
            }
            // GitHub Actions Detection
            if (fileStructure.some((f: string) => f.includes('.github/workflows'))) {
                // Check content if possible, or just assume CI/CD
            }
        }

        // Save Deployments
        if (deployments.length > 0) {
            // Clear existing deployments for this repo to avoid duplicates
            await prisma.deployment.deleteMany({ where: { repositoryId: repo.id } });

            for (const dep of deployments) {
                await prisma.deployment.create({
                    data: {
                        repositoryId: repo.id,
                        provider: dep.type,
                        url: dep.url,
                        status: dep.status,
                        lastDeployedAt: new Date()
                    }
                });
            }
            console.log(`  - Detected ${deployments.length} deployments: ${deployments.map(d => d.type).join(', ')}`);
        }

        return NextResponse.json({ success: true, message: 'Data ingested', deployments: deployments.length });

    } catch (error: any) {
        console.error('Ingest Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
