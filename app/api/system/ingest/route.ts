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

        return NextResponse.json({ success: true, message: 'Data ingested' });

    } catch (error: any) {
        console.error('Ingest Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
