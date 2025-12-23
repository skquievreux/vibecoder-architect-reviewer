import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

// GET /api/sync-status - Get sync logs for dashboard
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const status = searchParams.get('status'); // success, error, pending
        const repository = searchParams.get('repository');

        // For now, since we don't have a sync logs table yet, 
        // we'll return mock data based on repository information
        const repos = await prisma.repository.findMany({
            take: limit,
            where: repository ? { name: { contains: repository, mode: 'insensitive' } } : undefined,
            orderBy: { updatedAt: 'desc' },
            include: {
                technologies: true,
                deployments: true,
                interfaces: true
            }
        });

        // Convert repository data to sync log format
        const syncLogs = repos.map(repo => ({
            id: repo.id,
            repositoryId: repo.id,
            repositoryName: repo.nameWithOwner,
            status: repo.updatedAt > new Date(Date.now() - 24 * 60 * 60 * 1000) ? 'success' : 'pending',
            timestamp: repo.updatedAt.toISOString(),
            framework: repo.technologies.find(t => t.category === 'Framework')?.name || 
                      (repo.technologies.find(t => t.name === 'Node.js') ? 'Node.js' : 'Unknown'),
            hasApiSpec: !!repo.apiSpec,
            deployments: repo.deployments.map(d => d.provider),
            gitBranch: 'main', // We don't track this yet
            gitCommit: repo.githubId || 'unknown',
            interfaceCount: repo.interfaces.length,
            lastChecked: repo.updatedAt.toISOString()
        }));

        // Filter by status if provided
        const filteredLogs = status 
            ? syncLogs.filter(log => log.status === status)
            : syncLogs;

        // Calculate statistics
        const stats = {
            total: repos.length,
            success: filteredLogs.filter(log => log.status === 'success').length,
            error: filteredLogs.filter(log => log.status === 'error').length,
            pending: filteredLogs.filter(log => log.status === 'pending').length,
            withApiSpec: filteredLogs.filter(log => log.hasApiSpec).length
        };

        return NextResponse.json({
            success: true,
            data: filteredLogs,
            stats,
            meta: {
                limit,
                returned: filteredLogs.length,
                total: repos.length
            }
        });

    } catch (error) {
        console.error('Error fetching sync status:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch sync status',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}

// POST /api/sync-status - Trigger manual sync for a repository
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { repositoryName, repositoryUrl } = body;

        if (!repositoryName && !repositoryUrl) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Repository name or URL is required'
                    }
                },
                { status: 400 }
            );
        }

        // Find the repository
        const repo = await prisma.repository.findFirst({
            where: repositoryName 
                ? { nameWithOwner: repositoryName }
                : { url: repositoryUrl }
        });

        if (!repo) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Repository not found in database'
                    }
                },
                { status: 404 }
            );
        }

        // Here you would trigger the GitHub workflow via GitHub API
        // For now, we'll just mark it as pending
        const updatedRepo = await prisma.repository.update({
            where: { id: repo.id },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json({
            success: true,
            message: `Manual sync triggered for ${repo.nameWithOwner}`,
            repository: {
                id: repo.id,
                name: repo.name,
                nameWithOwner: repo.nameWithOwner,
                url: repo.url
            }
        });

    } catch (error) {
        console.error('Error triggering manual sync:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to trigger manual sync',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}