const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// OpenAPI-Spezifikationen für bekannte Projekte
const apiSpecs = {
    'vibecoder-architect-reviewer': {
        openapi: '3.0.0',
        info: {
            title: 'Vibecoder Architect Reviewer API',
            version: '0.11.1',
            description: 'Portfolio management and architecture review platform API',
            contact: {
                name: 'API Support',
                email: 'support@vibecoder.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server'
            },
            {
                url: 'https://vibecoder-architect-reviewer.vercel.app/api',
                description: 'Production server'
            }
        ],
        tags: [
            { name: 'Repositories', description: 'Repository management endpoints' },
            { name: 'AI', description: 'AI-powered features' },
            { name: 'DNS', description: 'DNS and domain management' },
            { name: 'Tasks', description: 'Task management' },
            { name: 'Providers', description: 'Provider management' },
            { name: 'System', description: 'System operations' }
        ],
        paths: {
            '/repos/{name}': {
                get: {
                    tags: ['Repositories'],
                    summary: 'Get repository details',
                    description: 'Retrieve detailed information about a specific repository',
                    parameters: [
                        {
                            name: 'name',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' },
                            description: 'Repository name'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Repository details',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            repo: { type: 'object' },
                                            technologies: { type: 'array' },
                                            interfaces: { type: 'array' },
                                            deployments: { type: 'array' },
                                            providers: { type: 'array' }
                                        }
                                    }
                                }
                            }
                        },
                        '404': { description: 'Repository not found' }
                    }
                },
                patch: {
                    tags: ['Repositories'],
                    summary: 'Update repository',
                    description: 'Update repository information',
                    parameters: [
                        {
                            name: 'name',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        customUrl: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Repository updated' },
                        '400': { description: 'Invalid request' }
                    }
                }
            },
            '/repos/{name}/canvas': {
                post: {
                    tags: ['Repositories'],
                    summary: 'Create/Update business canvas',
                    description: 'Create or update the business canvas for a repository',
                    parameters: [
                        {
                            name: 'name',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        valueProposition: { type: 'string' },
                                        customerSegments: { type: 'string' },
                                        revenueStreams: { type: 'string' },
                                        costStructure: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Canvas updated' },
                        '404': { description: 'Repository not found' }
                    }
                }
            },
            '/repos/{name}/providers': {
                post: {
                    tags: ['Repositories', 'Providers'],
                    summary: 'Link provider to repository',
                    parameters: [
                        {
                            name: 'name',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        providerId: { type: 'string' }
                                    },
                                    required: ['providerId']
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Provider linked' },
                        '404': { description: 'Repository or provider not found' }
                    }
                },
                delete: {
                    tags: ['Repositories', 'Providers'],
                    summary: 'Unlink provider from repository',
                    parameters: [
                        {
                            name: 'name',
                            in: 'path',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        providerId: { type: 'string' }
                                    },
                                    required: ['providerId']
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Provider unlinked' },
                        '404': { description: 'Repository or provider not found' }
                    }
                }
            },
            '/ai/tasks': {
                post: {
                    tags: ['AI', 'Tasks'],
                    summary: 'Generate tasks for all repositories',
                    description: 'Use AI to analyze repositories and generate maintenance tasks',
                    responses: {
                        '200': {
                            description: 'Tasks generated',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            tasksGenerated: { type: 'integer' }
                                        }
                                    }
                                }
                            }
                        },
                        '500': { description: 'AI service error' }
                    }
                }
            },
            '/ai/architect': {
                post: {
                    tags: ['AI'],
                    summary: 'Get architecture advice',
                    description: 'Chat with AI architect for recommendations',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        messages: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    role: { type: 'string', enum: ['user', 'assistant'] },
                                                    content: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'AI response',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/dns': {
                get: {
                    tags: ['DNS'],
                    summary: 'List Cloudflare zones',
                    description: 'Get all available Cloudflare DNS zones',
                    responses: {
                        '200': {
                            description: 'List of zones',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                name: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                post: {
                    tags: ['DNS'],
                    summary: 'Create DNS record',
                    description: 'Create a new DNS record in Cloudflare',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        zone_id: { type: 'string' },
                                        type: { type: 'string', enum: ['A', 'AAAA', 'CNAME', 'TXT'] },
                                        name: { type: 'string' },
                                        content: { type: 'string' },
                                        proxied: { type: 'boolean' }
                                    },
                                    required: ['zone_id', 'type', 'name', 'content']
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'DNS record created' },
                        '400': { description: 'Invalid request' }
                    }
                }
            },
            '/tasks': {
                get: {
                    tags: ['Tasks'],
                    summary: 'Get tasks for repository',
                    parameters: [
                        {
                            name: 'repositoryId',
                            in: 'query',
                            required: true,
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'List of tasks',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            tasks: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        id: { type: 'string' },
                                                        title: { type: 'string' },
                                                        status: { type: 'string', enum: ['OPEN', 'COMPLETED', 'IGNORED'] },
                                                        priority: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
                                                        type: { type: 'string', enum: ['SECURITY', 'MAINTENANCE', 'FEATURE'] }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                patch: {
                    tags: ['Tasks'],
                    summary: 'Update task status',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        status: { type: 'string', enum: ['OPEN', 'COMPLETED', 'IGNORED'] }
                                    },
                                    required: ['id', 'status']
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Task updated' },
                        '404': { description: 'Task not found' }
                    }
                }
            },
            '/providers': {
                get: {
                    tags: ['Providers'],
                    summary: 'List all providers',
                    responses: {
                        '200': {
                            description: 'List of providers',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                name: { type: 'string' },
                                                slug: { type: 'string' },
                                                category: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/system/sync': {
                post: {
                    tags: ['System'],
                    summary: 'Sync all repositories',
                    description: 'Run analyzer and update database with latest repository data',
                    responses: {
                        '200': {
                            description: 'Sync completed',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            message: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        '500': { description: 'Sync failed' }
                    }
                }
            }
        },
        components: {
            schemas: {
                Repository: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        fullName: { type: 'string' },
                        url: { type: 'string' },
                        description: { type: 'string' },
                        isPrivate: { type: 'boolean' },
                        customUrl: { type: 'string' }
                    }
                },
                Technology: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        category: { type: 'string' },
                        version: { type: 'string' }
                    }
                },
                Provider: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        category: { type: 'string' }
                    }
                }
            }
        }
    }
};

async function seedApiSpecs() {
    console.log('🔄 Seeding API specifications...\n');

    try {
        // Vibecoder Architect Reviewer
        const mainRepo = await prisma.repository.findFirst({
            where: {
                OR: [
                    { name: 'vibecoder-architect-reviewer' },
                    { nameWithOwner: { contains: 'vibecoder-architect-reviewer' } }
                ]
            }
        });

        if (mainRepo) {
            await prisma.repository.update({
                where: { id: mainRepo.id },
                data: {
                    apiSpec: JSON.stringify(apiSpecs['vibecoder-architect-reviewer'], null, 2)
                }
            });
            console.log('✅ Added API spec for vibecoder-architect-reviewer');
        } else {
            console.log('⚠️  vibecoder-architect-reviewer repository not found');
        }

        // Generische API-Specs für andere Projekte mit erkannten APIs
        const reposWithApis = await prisma.repository.findMany({
            where: {
                OR: [
                    { technologies: { some: { name: { in: ['Next.js', 'Express', 'Fastify'] } } } },
                    { interfaces: { some: { type: { contains: 'API' } } } }
                ]
            },
            include: {
                technologies: true,
                interfaces: true
            }
        });

        for (const repo of reposWithApis) {
            if (repo.apiSpec) continue; // Skip if already has spec

            const genericSpec = {
                openapi: '3.0.0',
                info: {
                    title: `${repo.name} API`,
                    version: '1.0.0',
                    description: repo.description || `API for ${repo.name}`
                },
                servers: [
                    {
                        url: repo.customUrl || repo.url,
                        description: 'Production server'
                    }
                ],
                paths: {},
                tags: []
            };

            await prisma.repository.update({
                where: { id: repo.id },
                data: {
                    apiSpec: JSON.stringify(genericSpec, null, 2)
                }
            });
            console.log(`✅ Added generic API spec for ${repo.name}`);
        }

        console.log('\n✅ API specification seeding complete!');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedApiSpecs()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
