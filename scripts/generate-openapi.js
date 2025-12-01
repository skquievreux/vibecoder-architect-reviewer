const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(process.cwd(), 'app');
const API_DIR = path.join(APP_DIR, 'api');
const OUTPUT_FILE = path.join(API_DIR, 'openapi.json');

const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Dashboard API',
        version: '1.0.0',
        description: 'API documentation for the Architecture Review Dashboard. \n\n**Authentication**:\n- **Public API**: Requires `x-api-key` header.\n- **Internal API**: Uses Session Cookies.'
    },
    components: {
        securitySchemes: {
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-api-key'
            },
            CookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'session-token' // Example
            }
        }
    },
    security: [
        { ApiKeyAuth: [] }
    ],
    paths: {}
};

function crawlRoutes(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            crawlRoutes(fullPath);
        } else if (item === 'route.ts' || item === 'route.js') {
            processRouteFile(fullPath);
        }
    });
}

function processRouteFile(filePath) {
    // Calculate route path from file path
    // e.g. .../app/api/users/route.ts -> /api/users
    let routePath = filePath.replace(APP_DIR, '').replace('/route.ts', '').replace('/route.js', '');

    // Handle dynamic routes: [id] -> {id}
    routePath = routePath.replace(/\[([^\]]+)\]/g, '{$1}');

    const content = fs.readFileSync(filePath, 'utf-8');
    const methods = [];

    if (content.includes('export async function GET')) methods.push('get');
    if (content.includes('export async function POST')) methods.push('post');
    if (content.includes('export async function PUT')) methods.push('put');
    if (content.includes('export async function PATCH')) methods.push('patch');
    if (content.includes('export async function DELETE')) methods.push('delete');

    // Simple Heuristic for Classification
    const isInternal = routePath.includes('/admin') || routePath.includes('/system') || routePath.includes('/auth');
    const tags = isInternal ? ['Internal'] : ['Public'];

    if (methods.length > 0) {
        openApiSpec.paths[routePath] = {};

        methods.forEach(method => {
            openApiSpec.paths[routePath][method] = {
                tags: tags,
                summary: `[${tags[0]}] ${method.toUpperCase()} ${routePath}`,
                security: isInternal ? [{ CookieAuth: [] }] : [{ ApiKeyAuth: [] }],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object'
                                }
                            }
                        }
                    },
                    '401': {
                        description: 'Unauthorized'
                    }
                }
            };

            // Add parameters for dynamic routes
            const params = routePath.match(/\{([^}]+)\}/g);
            if (params) {
                openApiSpec.paths[routePath][method].parameters = params.map(p => ({
                    name: p.replace(/[{}]/g, ''),
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                }));
            }
        });
    }
}

function main() {
    console.log('🚀 Generating OpenAPI Spec...');
    crawlRoutes(API_DIR);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(openApiSpec, null, 2));
    console.log(`✅ OpenAPI Spec generated at: ${OUTPUT_FILE}`);
}

main();
