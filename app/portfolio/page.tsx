"use client";

import { Card, Title, Text, Badge, Grid, Tab, TabList, TabGroup, TabPanels, TabPanel } from "@tremor/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, Layers, Box, Cpu, Image as ImageIcon, Music, Globe, Database, Share2, Briefcase } from "lucide-react";
import Link from "next/link";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

// --- Types ---
type RepoInfo = {
    repoName: string;
    description: string;
    url: string;
    source: string;
    canvas?: any;
};

type PortfolioData = Record<string, Record<string, RepoInfo[]>>;

// --- Icons & Colors ---
const CATEGORY_ICONS: Record<string, any> = {
    'AI': Cpu,
    'MEDIA': ImageIcon,
    'WEB': Globe,
    'INFRA': Database,
    'BUSINESS': Layers,
    'Uncategorized': Box
};

const CATEGORY_COLORS: Record<string, string> = {
    'AI': 'violet',
    'MEDIA': 'pink',
    'WEB': 'blue',
    'INFRA': 'slate',
    'BUSINESS': 'emerald',
    'Uncategorized': 'gray'
};

// --- Custom Nodes ---
const RepoNode = ({ data }: NodeProps) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-xl bg-slate-900/90 border border-slate-700 w-[320px] hover:border-violet-500 transition-colors backdrop-blur-sm">
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-slate-500" />
            <div className="flex items-start">
                <div className="p-2 rounded bg-slate-800 text-slate-400 mr-3">
                    <Box size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-100 truncate">{data.label}</div>
                    <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{data.description || 'No description'}</div>
                </div>
            </div>
            {data.capabilities && data.capabilities.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                    {data.capabilities.slice(0, 4).map((cap: string) => (
                        <span key={cap} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                            {cap}
                        </span>
                    ))}
                    {data.capabilities.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">
                            +{data.capabilities.length - 4}
                        </span>
                    )}
                </div>
            )}
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-slate-500" />
        </div>
    );
};

const ServiceNode = ({ data }: NodeProps) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-full bg-emerald-900/50 border border-emerald-500/50 min-w-[100px] text-center">
            <Handle type="target" position={Position.Top} className="!bg-emerald-500" />
            <div className="text-xs font-bold text-emerald-300">{data.label}</div>
            <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
        </div>
    );
};

const CompactRepoNode = ({ data }: NodeProps) => {
    return (
        <div className="px-3 py-2 shadow-md rounded-lg bg-slate-900 border border-slate-700 w-[180px] hover:border-violet-500 transition-colors flex items-center gap-2">
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-500" />
            <div className="p-1.5 rounded bg-slate-800 text-slate-400">
                <Box size={14} />
            </div>
            <div className="text-xs font-bold text-slate-200 truncate flex-1">{data.label}</div>
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-500" />
        </div>
    );
};

const nodeTypes = {
    repoNode: RepoNode,
    compactRepoNode: CompactRepoNode,
    serviceNode: ServiceNode,
};

// --- Layout Helper ---
const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB', isCompact = false) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = isCompact ? 200 : 350;
    const nodeHeight = isCompact ? 60 : 150;

    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: 100,
        nodesep: 50
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'TB' ? 'top' : 'left';
        node.sourcePosition = direction === 'TB' ? 'bottom' : 'right';

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes: layoutedNodes, edges };
};


export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);

    // Graph State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Controls State
    const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');
    const [isCompact, setIsCompact] = useState(false);
    const [showServices, setShowServices] = useState(true);
    const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(['ALL']));

    // Store initial graph data to reset to
    const [initialNodes, setInitialNodes] = useState<any[]>([]);
    const [initialEdges, setInitialEdges] = useState<any[]>([]);



    // Helper to process graph based on current settings
    const processGraph = useCallback((baseNodes: any[], baseEdges: any[]) => {
        let filteredNodes = baseNodes;
        let filteredEdges = baseEdges;

        // 1. Filter Nodes
        if (!activeCategories.has('ALL')) {
            filteredNodes = filteredNodes.filter(n => {
                if (n.type === 'serviceNode') return true; // Always show services (unless toggled off below)
                const nodeCats = n.data.categories || ['Uncategorized'];
                return nodeCats.some((c: string) => activeCategories.has(c));
            });
        }

        if (!showServices) {
            filteredNodes = filteredNodes.filter(n => n.type !== 'serviceNode');
        }

        // Filter Edges: Only keep edges where both source and target exist
        let nodeIds = new Set(filteredNodes.map((n: any) => n.id));
        filteredEdges = filteredEdges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

        // Optional: Remove orphan service nodes if we want to be strict
        // But for now, let's keep them if they were allowed by the first pass

        // Re-calculate nodeIds in case we want to be safe
        nodeIds = new Set(filteredNodes.map((n: any) => n.id));

        // 2. Update Node Types for Compact Mode
        const sizedNodes = filteredNodes.map(n => ({
            ...n,
            type: n.type === 'serviceNode' ? 'serviceNode' : (isCompact ? 'compactRepoNode' : 'repoNode')
        }));

        // 3. Layout
        return getLayoutedElements(sizedNodes, filteredEdges, layoutDirection, isCompact);
    }, [layoutDirection, isCompact, showServices, activeCategories]);

    // Re-process when settings change
    useEffect(() => {
        if (initialNodes.length > 0) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = processGraph(initialNodes, initialEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }
    }, [processGraph, initialNodes, initialEdges, setNodes, setEdges]);

    useEffect(() => {
        // Fetch List Data
        fetch('/api/portfolio')
            .then(res => res.json())
            .then(data => {
                setPortfolio(data.portfolio);
            })
            .catch(console.error);

        // Fetch Graph Data
        fetch('/api/portfolio/graph')
            .then(res => res.json())
            .then(data => {
                console.log("Graph Data Fetched:", data);
                if (data.nodes && data.edges) {
                    console.log("Setting Initial Nodes:", data.nodes.length);
                    setInitialNodes(data.nodes);
                    setInitialEdges(data.edges);
                    // Initial Layout happens in the useEffect above
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Graph Fetch Error:", err);
                setLoading(false);
            });
    }, [setNodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle Node Click
    const onNodeClick = useCallback((event: any, node: any) => {
        setSelectedNodeId(node.id);

        // Find connected edges and nodes
        const connectedEdgeIds = new Set();
        const connectedNodeIds = new Set();
        connectedNodeIds.add(node.id);

        initialEdges.forEach(edge => {
            if (edge.source === node.id || edge.target === node.id) {
                connectedEdgeIds.add(edge.id);
                connectedNodeIds.add(edge.source);
                connectedNodeIds.add(edge.target);
            }
        });

        // Update Nodes Style
        setNodes(nds => nds.map(n => {
            const isConnected = connectedNodeIds.has(n.id);
            return {
                ...n,
                style: {
                    ...n.style,
                    opacity: isConnected ? 1 : 0.1,
                    filter: isConnected ? 'none' : 'grayscale(100%)',
                    transition: 'all 0.3s ease'
                }
            };
        }));

        // Update Edges Style
        setEdges(eds => eds.map(e => {
            const isConnected = connectedEdgeIds.has(e.id);
            return {
                ...e,
                style: {
                    ...e.style,
                    opacity: isConnected ? 1 : 0.05,
                    stroke: isConnected ? '#8b5cf6' : '#334155',
                    strokeWidth: isConnected ? 2 : 1,
                },
                animated: isConnected
            };
        }));
    }, [initialEdges, setNodes, setEdges]);

    // Reset View
    const resetView = useCallback(() => {
        setSelectedNodeId(null);
        setNodes(initialNodes.map(n => ({ ...n, style: { ...n.style, opacity: 1, filter: 'none' } })));
        setEdges(initialEdges.map(e => ({ ...e, style: { ...e.style, opacity: 1, stroke: '#64748b', strokeWidth: 1 }, animated: false })));
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    if (loading) {
        return (
            <main className="p-10 bg-slate-950 min-h-screen flex items-center justify-center">
                <Text className="text-slate-400">Loading Portfolio...</Text>
            </main>
        );
    }

    return (
        <main className="p-10 bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <Title className="text-3xl font-bold text-white">Portfolio Capabilities</Title>
                            <Text className="text-slate-400">Functional analysis of the system landscape.</Text>
                        </div>
                    </div>
                    {selectedNodeId && (
                        <button
                            onClick={resetView}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-medium transition-colors border border-slate-700"
                        >
                            Reset View
                        </button>
                    )}
                </div>

                <TabGroup>
                    <TabList className="mt-8">
                        <Tab icon={Layers}>Capability Matrix</Tab>
                        <Tab icon={Share2}>Interconnection Graph</Tab>
                        <Tab icon={Briefcase}>Business Canvas</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            {/* List View */}
                            <div className="space-y-10 mt-6">
                                {portfolio && Object.entries(portfolio).map(([category, capabilities]) => {
                                    const Icon = CATEGORY_ICONS[category] || Box;
                                    const color = CATEGORY_COLORS[category] || 'gray';

                                    return (
                                        <section key={category} className="space-y-4">
                                            <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                                                <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
                                                    <Icon size={24} />
                                                </div>
                                                <h2 className="text-xl font-bold text-white">{category} Capabilities</h2>
                                            </div>

                                            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                                                {Object.entries(capabilities).map(([capName, repos]) => (
                                                    <Card key={capName} className="glass-card hover:border-slate-600 transition-colors">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <h3 className="text-lg font-semibold text-slate-200">{capName}</h3>
                                                            <Badge color={color} size="xs">{repos.length} Repos</Badge>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {repos.map((repo, idx) => (
                                                                <div key={idx} className="group">
                                                                    <Link href={`/repo/${repo.repoName}`} className="block">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                                                                                {repo.repoName}
                                                                            </span>
                                                                            <span className="text-xs text-slate-600 group-hover:text-slate-500">
                                                                                {repo.source.replace('package:', '')}
                                                                            </span>
                                                                        </div>
                                                                    </Link>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Card>
                                                ))}
                                            </Grid>
                                        </section>
                                    );
                                })}
                            </div>
                        </TabPanel>
                        <TabPanel>
                            {/* Graph View */}
                            <div className="mt-6 space-y-4">
                                {/* Controls Toolbar */}
                                <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Layout</span>
                                        <div className="flex bg-slate-800 rounded-md p-1">
                                            <button
                                                onClick={() => setLayoutDirection('TB')}
                                                className={`px-3 py-1 text-xs font-medium rounded ${layoutDirection === 'TB' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                Vertical
                                            </button>
                                            <button
                                                onClick={() => setLayoutDirection('LR')}
                                                className={`px-3 py-1 text-xs font-medium rounded ${layoutDirection === 'LR' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                Horizontal
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-px h-8 bg-slate-800 mx-2"></div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">View</span>
                                        <button
                                            onClick={() => setIsCompact(!isCompact)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded border ${isCompact ? 'bg-violet-500/10 border-violet-500 text-violet-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                                        >
                                            Compact Mode
                                        </button>
                                        <button
                                            onClick={() => setShowServices(!showServices)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded border ${showServices ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                                        >
                                            Show Services
                                        </button>
                                    </div>

                                    <div className="w-px h-8 bg-slate-800 mx-2"></div>

                                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">Filter</span>
                                        {Object.keys(CATEGORY_ICONS).map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    const newCats = new Set(activeCategories);
                                                    if (newCats.has('ALL')) {
                                                        newCats.clear();
                                                        newCats.add(cat);
                                                    } else if (newCats.has(cat)) {
                                                        newCats.delete(cat);
                                                        if (newCats.size === 0) newCats.add('ALL');
                                                    } else {
                                                        newCats.add(cat);
                                                    }
                                                    setActiveCategories(newCats);
                                                }}
                                                className={`px-2 py-1 text-[10px] font-medium rounded border whitespace-nowrap ${!activeCategories.has('ALL') && activeCategories.has(cat)
                                                    ? `bg-${CATEGORY_COLORS[cat] || 'slate'}-500/20 border-${CATEGORY_COLORS[cat] || 'slate'}-500 text-${CATEGORY_COLORS[cat] || 'slate'}-300`
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setActiveCategories(new Set(['ALL']))}
                                            className={`px-2 py-1 text-[10px] font-medium rounded border whitespace-nowrap ${activeCategories.has('ALL')
                                                ? 'bg-slate-100 text-slate-900 border-white'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[800px] w-full border border-slate-800 rounded-lg bg-slate-900/50 relative">
                                    <ReactFlow
                                        nodes={nodes}
                                        edges={edges}
                                        onNodesChange={onNodesChange}
                                        onEdgesChange={onEdgesChange}
                                        onNodeClick={onNodeClick}
                                        nodeTypes={nodeTypes}
                                        fitView
                                        attributionPosition="bottom-right"
                                        minZoom={0.1}
                                        maxZoom={1.5}
                                        style={{ width: '100%', height: '100%' }}
                                    >
                                        <MiniMap
                                            nodeStrokeColor={(n) => {
                                                if (n.type === 'serviceNode') return '#10b981';
                                                return '#64748b';
                                            }}
                                            nodeColor={(n) => {
                                                if (n.type === 'serviceNode') return '#064e3b';
                                                return '#1e293b';
                                            }}
                                            style={{ backgroundColor: '#1e293b' }}
                                        />
                                        <Controls className="bg-slate-800 border-slate-700 text-white" />
                                        <Background color="#334155" gap={20} size={1} />
                                    </ReactFlow>
                                    <div className="absolute bottom-4 left-4 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 backdrop-blur-sm">
                                        <p>🖱️ Click node to highlight connections</p>
                                        <p>🖱️ Drag to pan • 📜 Scroll to zoom</p>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            {/* Business Canvas View */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {portfolio && Object.values(portfolio).flatMap(cat => Object.values(cat)).flat().filter((r, i, a) => a.findIndex(t => t.repoName === r.repoName) === i && r.canvas).map((repo) => {
                                    const canvas = repo.canvas;
                                    const valueProp = JSON.parse(canvas.valueProposition || '[]');
                                    const customers = JSON.parse(canvas.customerSegments || '[]');
                                    const revenue = JSON.parse(canvas.revenueStreams || '[]');
                                    const costs = JSON.parse(canvas.costStructure || '[]');

                                    return (
                                        <Card key={repo.repoName} className="glass-card border-t-4 border-t-violet-500">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-bold text-white">{repo.repoName}</h3>
                                                <p className="text-xs text-slate-400 line-clamp-2">{repo.description}</p>
                                            </div>

                                            <div className="space-y-4 text-sm">
                                                <div>
                                                    <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">Value Proposition</div>
                                                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                                                        {valueProp.length > 0 ? valueProp.map((v: string) => <li key={v}>{v}</li>) : <li className="text-slate-600 italic">None detected</li>}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Customer Segments</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {customers.length > 0 ? customers.map((c: string) => <Badge key={c} size="xs" color="blue">{c}</Badge>) : <span className="text-slate-600 italic">Unknown</span>}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                                                    <div>
                                                        <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Revenue</div>
                                                        <ul className="space-y-0.5">
                                                            {revenue.length > 0 ? revenue.map((r: string) => (
                                                                <li key={r} className="text-emerald-300 text-xs flex items-center">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                                                    {r}
                                                                </li>
                                                            )) : <li className="text-slate-600 italic text-xs">None</li>}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">Costs</div>
                                                        <ul className="space-y-0.5">
                                                            {costs.length > 0 ? costs.map((c: string) => (
                                                                <li key={c} className="text-rose-300 text-xs flex items-center">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                                                                    {c}
                                                                </li>
                                                            )) : <li className="text-slate-600 italic text-xs">Unknown</li>}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </main>
    );
}
