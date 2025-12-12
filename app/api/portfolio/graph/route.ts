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
        const capabilityNodes = new Set<string>();

        // 1. Create Repo Nodes
        repos.forEach(repo => {
            nodes.push({
                id: repo.id,
                type: 'repoNode',
                data: {
                    label: repo.name,
                    description: repo.description,
                    capabilities: repo.capabilities.map(c => c.name),
                    categories: Array.from(new Set(repo.capabilities.map(c => c.category || 'Uncategorized')))
                },
                position: { x: 0, y: 0 }
            });

            // 2. Create Capability Nodes and connect repos to them
            repo.capabilities.forEach(cap => {
                const capId = `capability-${cap.name}`;

                if (!capabilityNodes.has(capId)) {
                    nodes.push({
                        id: capId,
                        type: 'serviceNode',
                        data: {
                            label: cap.name,
                            category: cap.category
                        },
                        position: { x: 0, y: 0 }
                    });
                    capabilityNodes.add(capId);
                }

                // Connect repo to capability
                edges.push({
                    id: `${repo.id}-${capId}`,
                    source: repo.id,
                    target: capId,
                    type: 'default',
                    animated: false,
                    style: { stroke: '#8b5cf6', strokeWidth: 1.5 }
                });
            });

            // 3. Create Edges for Repo Connections (Shared DB etc)
            repo.outgoingConnections.forEach(conn => {
                edges.push({
                    id: `${conn.sourceRepoId}-${conn.targetRepoId}`,
                    source: conn.sourceRepoId,
                    target: conn.targetRepoId,
                    type: 'smoothstep',
                    animated: true,
                    label: conn.type.replace('SHARED_', ''),
                    style: { stroke: '#10b981', strokeWidth: 2 }
                });
            });

            // 4. Create Service Nodes from Interfaces (e.g. OpenAI, Supabase)
            repo.interfaces.forEach(iface => {
                let serviceName = 'Unknown';
                try {
                    const details = JSON.parse(iface.details || '{}');
                    serviceName = details.service || details.framework || details.orm || iface.type;
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
