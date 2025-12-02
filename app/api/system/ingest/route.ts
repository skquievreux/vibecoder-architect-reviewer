import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Define Zod Schema for Ingestion Payload
const IngestSchema = z.object({
    repoName: z.string().min(1, "Repository name is required"),
    nameWithOwner: z.string().min(1, "Full name (owner/name) is required"),
    repoUrl: z.string().url("Invalid repository URL"),
    description: z.string().optional(),
    isPrivate: z.boolean().optional(),
    apiSpec: z.string().nullable().optional(),
    packageJson: z.object({
        engines: z.object({
            node: z.string().optional()
        }).optional(),
        dependencies: z.record(z.string(), z.string()).optional()
    }).optional(),
    fileStructure: z.array(z.string()).optional()
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Validate with Zod
        console.log('IngestSchema:', IngestSchema);
        console.log('IngestSchema type:', typeof IngestSchema);
        if (IngestSchema && typeof IngestSchema.safeParse === 'function') {
            const result = IngestSchema.safeParse(body);
            // ... rest of logic
        } else {
            console.error('IngestSchema is invalid or safeParse is missing');
            throw new Error('Zod Schema Error');
        }
        const result = IngestSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: result.error.format()
                    }
                },
                { status: 400 }
            );
        }

        const data = result.data;

        // 2. Process Data
        // Find or Create Repository
        let repo = await prisma.repository.findFirst({
            where: { name: data.repoName }
        });

        if (!repo) {
            repo = await prisma.repository.create({
                data: {
                    name: data.repoName,
                    fullName: data.nameWithOwner,
                    nameWithOwner: data.nameWithOwner,
                    url: data.repoUrl,
                    isPrivate: data.isPrivate || false,
                    description: data.description || '',
                    apiSpec: data.apiSpec || null,
                    updatedAt: new Date(),
                    pushedAt: new Date(),
                }
            });
        } else {
            await prisma.repository.update({
                where: { id: repo.id },
                data: {
                    updatedAt: new Date(),
                    apiSpec: data.apiSpec || undefined
                }
            });
        }

        // Update Tech Stack (Node/React)
        if (data.packageJson) {
            const nodeVersion = data.packageJson.engines?.node;
            const reactVersion = data.packageJson.dependencies?.['react'];

            if (nodeVersion) {
                await prisma.technology.create({
                    data: {
                        repositoryId: repo.id,
                        name: 'Node.js',
                        category: 'Language',
                        version: nodeVersion
                    }
                });
            }
            if (reactVersion) {
                await prisma.technology.create({
                    data: {
                        repositoryId: repo.id,
                        name: 'React',
                        category: 'Framework',
                        version: reactVersion
                    }
                });
            }
        }

        // Deployment Detection Logic
        if (data.fileStructure) {
            const deployments = [];
            if (data.fileStructure.includes('vercel.json')) deployments.push('Vercel');
            if (data.fileStructure.includes('fly.toml')) deployments.push('Fly.io');
            if (data.fileStructure.includes('Dockerfile')) deployments.push('Docker');
            if (data.fileStructure.includes('netlify.toml')) deployments.push('Netlify');

            for (const provider of deployments) {
                // Check if deployment exists to avoid duplicates
                const existing = await prisma.deployment.findFirst({
                    where: { repositoryId: repo.id, provider: provider }
                });

                if (!existing) {
                    await prisma.deployment.create({
                        data: {
                            repositoryId: repo.id,
                            provider: provider,
                            status: 'ACTIVE',
                            lastDeployedAt: new Date()
                        }
                    });
                }
            }
        }

        return NextResponse.json({ success: true, repoId: repo.id });

    } catch (error) {
        console.error('Ingest Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to process ingestion',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}
