import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from "@/lib/prisma";

// Enhanced Zod Schema for Ingestion Payload
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
        dependencies: z.record(z.string(), z.string()).optional(),
        framework: z.string().optional()
    }).optional(),
    fileStructure: z.array(z.string()).optional(),
    metadata: z.object({
        framework: z.string().optional(),
        detectedDeployments: z.array(z.string()).optional(),
        gitBranch: z.string().optional(),
        gitCommit: z.string().optional(),
        runId: z.string().optional(),
        timestamp: z.string().optional()
    }).optional()
});

// Master API Key Validation
const MASTER_API_KEY = "dashboard-master-2024";

function validateMasterKey(request: Request): boolean {
    const apiKey = request.headers.get('x-api-key');
    return apiKey === MASTER_API_KEY;
}

// Log sync events to database for dashboard display
async function logSyncEvent(repositoryId: string, status: 'success' | 'error', details: any) {
    try {
        // We'll create a sync log table later, for now just console log
        console.log(`SYNC_LOG: ${status.toUpperCase()} - Repo: ${repositoryId} - Details:`, details);
        
        // You could also write to a file or send to a logging service
        return true;
    } catch (error) {
        console.error('Failed to log sync event:', error);
        return false;
    }
}

export async function POST(request: Request) {
    try {
        // 1. Master Key Validation
        if (!validateMasterKey(request)) {
            await logSyncEvent('unknown', 'error', {
                error: 'Invalid API Key',
                headers: Object.fromEntries(request.headers.entries())
            });
            
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Invalid or missing API key',
                        timestamp: new Date().toISOString()
                    }
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        // 2. Validate with Zod (Fixed duplicate validation)
        const result = IngestSchema.safeParse(body);

        if (!result.success) {
            const errorDetails = {
                validationErrors: result.error.format(),
                receivedData: body,
                timestamp: new Date().toISOString()
            };
            
            await logSyncEvent(body.repoName || 'unknown', 'error', errorDetails);
            
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: errorDetails
                    }
                },
                { status: 400 }
            );
        }

        const data = result.data;

        // 3. Process Data
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
            
            console.log(`✅ Created new repository: ${repo.name}`);
        } else {
            await prisma.repository.update({
                where: { id: repo.id },
                data: {
                    updatedAt: new Date(),
                    apiSpec: data.apiSpec || undefined
                }
            });
            
            console.log(`🔄 Updated existing repository: ${repo.name}`);
        }

        // 4. Update Tech Stack (Enhanced)
        if (data.packageJson) {
            const nodeVersion = data.packageJson.engines?.node;
            const reactVersion = data.packageJson.dependencies?.['react'];
            const nextVersion = data.packageJson.dependencies?.['next'];
            const framework = data.packageJson.framework;

            // Update or create technologies
            const technologies = [];
            
            if (nodeVersion) {
                technologies.push({
                    repositoryId: repo.id,
                    name: 'Node.js',
                    category: 'Language',
                    version: nodeVersion
                });
            }
            if (reactVersion) {
                technologies.push({
                    repositoryId: repo.id,
                    name: 'React',
                    category: 'Framework',
                    version: reactVersion
                });
            }
            if (nextVersion) {
                technologies.push({
                    repositoryId: repo.id,
                    name: 'Next.js',
                    category: 'Framework',
                    version: nextVersion
                });
            }

            // Clean up old tech records and insert new ones
            await prisma.technology.deleteMany({
                where: { repositoryId: repo.id }
            });
            
            if (technologies.length > 0) {
                await prisma.technology.createMany({
                    data: technologies
                });
            }
        }

        // 5. Enhanced Deployment Detection
        const deployments = [];
        
        // From fileStructure (legacy)
        if (data.fileStructure) {
            if (data.fileStructure.includes('vercel.json')) deployments.push('Vercel');
            if (data.fileStructure.includes('fly.toml')) deployments.push('Fly.io');
            if (data.fileStructure.includes('Dockerfile')) deployments.push('Docker');
            if (data.fileStructure.includes('netlify.toml')) deployments.push('Netlify');
        }
        
        // From enhanced metadata
        if (data.metadata?.detectedDeployments) {
            deployments.push(...data.metadata.detectedDeployments);
        }

        // Remove duplicates and process
        const uniqueDeployments = [...new Set(deployments)];
        
        for (const provider of uniqueDeployments) {
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
                
                console.log(`🚀 Added deployment: ${provider} for ${repo.name}`);
            } else {
                await prisma.deployment.update({
                    where: { id: existing.id },
                    data: {
                        status: 'ACTIVE',
                        lastDeployedAt: new Date()
                    }
                });
            }
        }

        // 6. Log successful sync
        const successDetails = {
            repositoryId: repo.id,
            repositoryName: repo.name,
            framework: data.packageJson?.framework,
            hasApiSpec: !!data.apiSpec,
            deployments: uniqueDeployments,
            gitBranch: data.metadata?.gitBranch,
            gitCommit: data.metadata?.gitCommit,
            runId: data.metadata?.runId
        };
        
        await logSyncEvent(repo.id, 'success', successDetails);

        console.log(`🎉 Successfully synced: ${repo.nameWithOwner}`);

        return NextResponse.json({ 
            success: true, 
            repoId: repo.id,
            repository: {
                id: repo.id,
                name: repo.name,
                nameWithOwner: repo.nameWithOwner,
                framework: data.packageJson?.framework,
                deployments: uniqueDeployments
            },
            syncDetails: successDetails
        });

    } catch (error) {
        console.error('💥 Ingest Error:', error);
        
        const errorDetails = {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        };
        
        await logSyncEvent('unknown', 'error', errorDetails);
        
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to process ingestion',
                    details: errorDetails
                }
            },
            { status: 500 }
        );
    }
}

// Health check endpoint for monitoring
export async function GET() {
    return NextResponse.json({ 
        status: 'healthy',
        service: 'Dashboard API Ingest',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
}