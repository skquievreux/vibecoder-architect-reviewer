import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const repos = await prisma.repository.findMany({
            include: {
                capabilities: true,
                outgoingConnections: true,
                interfaces: true
            }
        });

        const nodes: any[] = [];
        const edges: any[] = [];
        const serviceNodes = new Set<string>();

        // 1. Create Repo Nodes
        repos.forEach(repo => {
            nodes.push({
                id: repo.id,
                type: 'repoNode', // Custom type we'll define in frontend
                data: {
                    label: repo.name,
                    description: repo.description,
                    capabilities: repo.capabilities.map(c => c.name),
                    categories: Array.from(new Set(repo.capabilities.map(c => c.category || 'Uncategorized')))
                },
                position: { x: 0, y: 0 } // Layout will handle this
            });

            // 2. Create Edges for Repo Connections (Shared DB etc)
            repo.outgoingConnections.forEach(conn => {
                edges.push({
                    id: `${conn.sourceRepoId}-${conn.targetRepoId}`,
                    source: conn.sourceRepoId,
                    target: conn.targetRepoId,
                    type: 'smoothstep',
                    animated: true,
                    label: conn.type.replace('SHARED_', '')
                });
            });

            // 3. Create Service Nodes from Interfaces (e.g. OpenAI, Supabase)
            // This visualizes the "Hub" effect better than just linking repos
            repo.interfaces.forEach(iface => {
                let serviceName = 'Unknown';
                try {
                    const details = JSON.parse(iface.details || '{}');
                    serviceName = details.service || iface.type;
                } catch (e) {
                    serviceName = iface.type || 'Unknown';
                }

                if (serviceName && serviceName !== 'Unknown') {
                    const serviceId = `service-${serviceName}`;

                    if (!serviceNodes.has(serviceId)) {
                        nodes.push({
                            id: serviceId,
                            type: 'serviceNode',
                            data: { label: serviceName },
                            position: { x: 0, y: 0 }
                        });
                        serviceNodes.add(serviceId);
                    }

                    edges.push({
                        id: `${repo.id}-${serviceId}`,
                        source: repo.id,
                        target: serviceId,
                        type: 'default',
                        animated: false,
                        style: { stroke: '#64748b', strokeDasharray: '5,5' }
                    });
                }
            });
        });

        return NextResponse.json({ nodes, edges });
    } catch (error) {
        console.error('Failed to fetch graph:', error);
        return NextResponse.json({ error: 'Failed to fetch graph' }, { status: 500 });
    }
}
