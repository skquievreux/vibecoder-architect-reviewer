"use client";

import { Card, Title, Text, Badge, Grid, DonutChart, List, ListItem } from "@tremor/react";
import { useState, useEffect } from "react";
import { ArrowLeft, Github, Globe, ExternalLink, Calendar, Code, Database, Server, Shield, CheckCircle, Circle, Play, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Technology = {
    id: string;
    name: string;
    category: string;
    version: string | null;
};

type Task = {
    id: string;
    title: string;
    status: 'OPEN' | 'COMPLETED' | 'IGNORED';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    type: 'SECURITY' | 'MAINTENANCE' | 'FEATURE';
};

type Interface = {
    type: string;
    direction: string;
    details: any;
};

type Deployment = {
    id: string;
    provider: string;
    url: string;
    status: string;
    lastDeployedAt: string;
};

type Repository = {
    repo: {
        name: string;
        fullName: string;
        nameWithOwner: string;
        url: string;
        description: string;
        isPrivate: boolean;
        updatedAt: string;
        pushedAt: string;
        createdAt: string;
        languages: { size: number; node: { name: string } }[];
        customUrl?: string | null;
    };
    technologies: Technology[];
    interfaces: Interface[];
    deployments: Deployment[];
};

const DASHBOARD_URLS: Record<string, string> = {
    "supabase": "https://supabase.com/dashboard",
    "openai": "https://platform.openai.com",
    "vercel": "https://vercel.com/dashboard",
    "stripe": "https://dashboard.stripe.com",
    "aws": "https://console.aws.amazon.com",
    "fly.io": "https://fly.io/dashboard",
    "firebase": "https://console.firebase.google.com",
    "s3": "https://s3.console.aws.amazon.com/s3/home",
    "redis": "https://redis.io/insight",
};


export default function RepoDetail() {
    const params = useParams();
    const repoName = params.name as string;
    const [repoData, setRepoData] = useState<Repository | null>(null);
    const [loading, setLoading] = useState(true);

    const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
    const [zones, setZones] = useState<{ id: string, name: string }[]>([]);
    const [selectedZone, setSelectedZone] = useState("");
    const [subdomain, setSubdomain] = useState("");
    const [targetDeployment, setTargetDeployment] = useState<Deployment | null>(null);
    const [creatingRecord, setCreatingRecord] = useState(false);
    const [customDomain, setCustomDomain] = useState<string | null>(null);

    // New State for Link Verification
    const [isEditUrlModalOpen, setIsEditUrlModalOpen] = useState(false);
    const [manualUrl, setManualUrl] = useState("");
    const [linkStatus, setLinkStatus] = useState<{ reachable: boolean; status: number; latency: number } | null>(null);
    const [checkingLink, setCheckingLink] = useState(false);

    // Task Management State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [generatingTasks, setGeneratingTasks] = useState(false);

    const fetchTasks = async (repoId: string) => {
        setLoadingTasks(true);
        try {
            const res = await fetch(`/api/tasks?repositoryId=${repoId}`);
            const data = await res.json();
            if (data.tasks) setTasks(data.tasks);
        } catch (e) {
            console.error("Failed to fetch tasks", e);
        } finally {
            setLoadingTasks(false);
        }
    };

    const generateTasks = async () => {
        if (!repoData) return;
        setGeneratingTasks(true);
        try {
            // Trigger AI generation (global, but we filter for this repo in UI or backend could be optimized)
            // Ideally backend should accept a single repo ID to optimize, but our current implementation scans all.
            // For simplicity/demo, we call the main endpoint.
            const res = await fetch('/api/ai/tasks', { method: 'POST' });
            if (res.ok) {
                await fetchTasks(repoData.repo.name); // Re-fetch tasks. Wait, backend uses ID, but our API uses repoId query param which matches DB field.
                // Actually fetchTasks needs the ID from repoData which we have.
                // But wait, repoData.repo doesn't have ID in the type definition above?
                // Let's check the type definition. It's missing 'id' in 'repo' object in type Repository.
                // However, the API returns the full object.
                // We should use the ID if available, or fetch by name if we adjusted the API.
                // The API /api/tasks uses repositoryId.
                // Let's assume repoData has the ID at the top level or inside repo.
                // Looking at the API /api/repos/[name], it returns { repo: ... }.
                // Let's reload the page to be safe or just fetch.
                window.location.reload();
            }
        } catch (e) {
            alert("Failed to generate tasks");
        } finally {
            setGeneratingTasks(false);
        }
    };

    const toggleTaskStatus = async (task: Task) => {
        const newStatus = task.status === 'OPEN' ? 'COMPLETED' : 'OPEN';
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

        try {
            await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: task.id, status: newStatus })
            });
        } catch (e) {
            console.error("Failed to update task", e);
            // Revert
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
        }
    };

    useEffect(() => {
        if (!repoName) return;

        fetch(`/api/repos/${repoName}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((data) => {
                setRepoData(data);
                setLoading(false);
                if (data.repo.customUrl) {
                    setManualUrl(data.repo.customUrl);
                }
                // Fetch tasks using the ID from the response (we need to cast or trust it's there)
                // The API /api/repos/[name] returns the repo object which likely has the ID.
                // Let's verify the API response structure if needed, but usually it returns the full Prisma object.
                if ((data.repo as any).id) {
                    fetchTasks((data.repo as any).id);
                }
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [repoName]);

    const [dnsRecords, setDnsRecords] = useState<any[]>([]);

    useEffect(() => {
        if (repoData?.deployments && repoData.deployments.length > 0) {
            // Check for custom domain (Cloudflare)
            const target = repoData.deployments[0].url.replace(/^https?:\/\//, '').replace(/\/$/, '');
            fetch(`/api/dns?target=${target}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setDnsRecords(data);
                        if (data.length > 0) {
                            setCustomDomain(data[0].name);
                        }
                    }
                })
                .catch(err => console.error("Failed to check custom domain", err));
        }
    }, [repoData]);

    // Check Link Health
    useEffect(() => {
        const targetUrl = repoData?.repo.customUrl || (customDomain ? `https://${customDomain}` : repoData?.deployments[0]?.url);

        if (targetUrl) {
            setCheckingLink(true);
            fetch(`/api/check-link?url=${encodeURIComponent(targetUrl)}`)
                .then(res => res.json())
                .then(data => {
                    setLinkStatus(data);
                    setCheckingLink(false);
                })
                .catch(() => setCheckingLink(false));
        }
    }, [repoData, customDomain]);

    useEffect(() => {
        if (isDnsModalOpen && zones.length === 0) {
            fetch("/api/dns")
                .then(res => res.json())
                .then(data => setZones(data))
                .catch(err => console.error("Failed to load zones", err));
        }
    }, [isDnsModalOpen]);

    if (loading) return <div className="p-10">Loading repository details...</div>;
    if (!repoData) return <div className="p-10">Repository not found</div>;

    const { repo, technologies, interfaces, deployments } = repoData;
    const isOutdated = new Date(repo.updatedAt) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // Determine the active URL
    const activeUrl = repo.customUrl || (customDomain ? `https://${customDomain}` : (deployments.length > 0 ? (deployments[0].url.startsWith('http') ? deployments[0].url : `https://${deployments[0].url}`) : null));

    const handleConnectDomain = async () => {
        if (!selectedZone || !subdomain || !targetDeployment) return;
        setCreatingRecord(true);

        try {
            let content = targetDeployment.url.replace(/^https?:\/\//, '');
            if (content.endsWith('/')) content = content.slice(0, -1);

            const res = await fetch("/api/dns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    zone_id: selectedZone,
                    type: "CNAME",
                    name: subdomain,
                    content: content,
                    proxied: true,
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Successfully created ${subdomain}.${zones.find(z => z.id === selectedZone)?.name}`);
                setIsDnsModalOpen(false);
                setSubdomain("");
                setSelectedZone("");
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert("Failed to create record");
        } finally {
            setCreatingRecord(false);
        }
    };

    const handleSaveUrl = async () => {
        try {
            const res = await fetch(`/api/repos/${repoName}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customUrl: manualUrl })
            });
            if (res.ok) {
                setRepoData(prev => prev ? { ...prev, repo: { ...prev.repo, customUrl: manualUrl } } : null);
                setIsEditUrlModalOpen(false);
            } else {
                alert("Failed to save URL");
            }
        } catch (e) {
            alert("Error saving URL");
        }
    };

    return (
        <main className="p-10 bg-slate-950 min-h-screen relative">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* ... Header ... */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <Title className="text-3xl font-bold text-white">{repo.name}</Title>
                                <Badge color={repo.isPrivate ? "slate" : "violet"}>{repo.isPrivate ? "Private" : "Public"}</Badge>
                                {isOutdated && <Badge color="amber">Outdated</Badge>}
                            </div>
                            <Text className="mt-1 text-slate-400">{repo.description || "No description provided."}</Text>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors text-slate-200 font-medium">
                            <Github size={18} />
                            GitHub
                        </a>
                        {activeUrl && (
                            <div className="flex gap-2 items-center">
                                <div className="relative group">
                                    <a
                                        href={activeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-[0_0_10px_rgba(124,58,237,0.3)] ${repo.customUrl ? 'bg-violet-600 hover:bg-violet-700' : (customDomain ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-cyan-600 hover:bg-cyan-700')}`}
                                    >
                                        <Globe size={18} />
                                        {repo.customUrl ? "Custom Link" : (customDomain ? customDomain : "Live Site")}

                                        {/* Status Dot */}
                                        {linkStatus && (
                                            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${linkStatus.reachable ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                                        )}
                                    </a>
                                    {/* Tooltip */}
                                    {linkStatus && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
                                            {linkStatus.reachable ? `Online (${linkStatus.status})` : `Offline (${linkStatus.status})`} • {linkStatus.latency}ms
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        setManualUrl(repo.customUrl || activeUrl || "");
                                        setIsEditUrlModalOpen(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    title="Edit Link"
                                >
                                    <Code size={18} />
                                </button>

                                {deployments.length > 0 && !repo.customUrl && !customDomain && (
                                    <button
                                        onClick={() => {
                                            setTargetDeployment(deployments[0]);
                                            setIsDnsModalOpen(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors font-medium shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                                    >
                                        <Shield size={18} />
                                        Connect Domain
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ... Grids ... */}
                <Grid numItems={1} numItemsMd={3} className="gap-6">
                    {/* Stats Card */}
                    <Card className="glass-card">
                        <Title className="mb-4 text-white">Statistics</Title>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <Calendar size={16} className="text-violet-400" />
                                <span>Created: {new Date(repo.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <Calendar size={16} className="text-violet-400" />
                                <span>Last Push: {new Date(repo.pushedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <Calendar size={16} className="text-violet-400" />
                                <span>Updated: {new Date(repo.updatedAt).toLocaleDateString()}</span>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <Text className="mb-2 font-medium text-slate-300">Languages</Text>
                                <div className="flex flex-wrap gap-2">
                                    {repo.languages && repo.languages.map((l, i) => (
                                        <Badge key={i} color="slate" size="xs" className="bg-slate-800 text-slate-300">{l.node.name}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tech Stack */}
                    <Card className="md:col-span-2 glass-card">
                        <Title className="mb-4 text-white">Technology Stack</Title>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {technologies.length === 0 ? (
                                <Text className="text-slate-500">No technologies detected.</Text>
                            ) : (
                                technologies.map(tech => (
                                    <div key={tech.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-violet-500/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-800 rounded-md border border-slate-700 text-violet-400">
                                                <Code size={16} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-200">{tech.name}</div>
                                                <div className="text-xs text-slate-500 capitalize">{tech.category || "Tool"}</div>
                                            </div>
                                        </div>
                                        {tech.version && (
                                            <Badge color="violet" size="xs">v{tech.version}</Badge>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </Grid>

                <Grid numItems={1} className="gap-6">
                    <Card className="glass-card">
                        <div className="flex justify-between items-center mb-4">
                            <Title className="text-white">Automated Tasks</Title>
                            <button
                                onClick={generateTasks}
                                disabled={generatingTasks}
                                className="flex items-center gap-2 px-3 py-1.5 bg-violet-900/30 text-violet-300 border border-violet-500/30 rounded-lg hover:bg-violet-900/50 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <Play size={14} />
                                {generatingTasks ? "Generating..." : "Generate Tasks"}
                            </button>
                        </div>

                        {loadingTasks ? (
                            <Text className="text-slate-400">Loading tasks...</Text>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle size={32} className="mx-auto mb-2 opacity-20" />
                                <Text className="text-slate-500">No open tasks. Good job!</Text>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${task.status === 'COMPLETED' ? 'bg-slate-900/30 border-slate-800 opacity-60' : 'bg-slate-900/50 border-slate-800 hover:border-violet-500/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleTaskStatus(task)}
                                                className={`p-1 rounded-full transition-colors ${task.status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-500 hover:text-violet-400'
                                                    }`}
                                            >
                                                {task.status === 'COMPLETED' ? <CheckCircle size={20} /> : <Circle size={20} />}
                                            </button>
                                            <div>
                                                <div className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                                                    {task.title}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge size="xs" color={task.priority === 'HIGH' ? 'rose' : task.priority === 'MEDIUM' ? 'amber' : 'slate'}>
                                                        {task.priority}
                                                    </Badge>
                                                    <Badge size="xs" color="slate" className="bg-slate-800 text-slate-400">
                                                        {task.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </Grid>

                <Grid numItems={1} numItemsMd={2} className="gap-6">
                    {/* Interfaces */}
                    <Card className="glass-card">
                        <Title className="mb-4 text-white">Detected Interfaces</Title>
                        {interfaces.length === 0 ? (
                            <Text className="text-slate-500">No external interfaces detected.</Text>
                        ) : (
                            <List>
                                {interfaces.map((iface, idx) => {
                                    const serviceName = (iface.details?.service || iface.type).toLowerCase();
                                    const dashboardUrl = Object.entries(DASHBOARD_URLS).find(([key]) => serviceName.includes(key))?.[1];

                                    const content = (
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="mt-1">
                                                {iface.type === 'database_connection' ? <Database size={16} className="text-cyan-400" /> :
                                                    iface.type === 'cloud_service' ? <Server size={16} className="text-amber-400" /> :
                                                        <Globe size={16} className="text-emerald-400" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-200 flex items-center gap-2">
                                                    {iface.details?.service || iface.type.replace('_', ' ')}
                                                    {dashboardUrl && <ExternalLink size={12} className="text-slate-500" />}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {iface.direction} • {iface.details?.variable ? `Via ${iface.details.variable}` : 'Inferred'}
                                                </div>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <ListItem key={idx} className="p-0 border-slate-800">
                                            {dashboardUrl ? (
                                                <a
                                                    href={dashboardUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex w-full p-4 hover:bg-slate-800/50 transition-colors rounded-lg -m-4"
                                                >
                                                    {content}
                                                </a>
                                            ) : (
                                                <div className="w-full p-4 -m-4">
                                                    {content}
                                                </div>
                                            )}
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
                    </Card>

                    {/* DNS & Domains */}
                    <Card className="glass-card">
                        <div className="flex justify-between items-center mb-4">
                            <Title className="text-white">DNS & Domains</Title>
                            {deployments.length > 0 && (
                                <button
                                    onClick={() => {
                                        setTargetDeployment(deployments[0]);
                                        setIsDnsModalOpen(true);
                                    }}
                                    className="text-xs px-2 py-1 bg-violet-900/30 text-violet-300 border border-violet-500/30 rounded hover:bg-violet-900/50 transition-colors"
                                >
                                    + Add Record
                                </button>
                            )}
                        </div>

                        {dnsRecords.length === 0 ? (
                            <Text className="text-slate-500">No custom domains linked.</Text>
                        ) : (
                            <div className="space-y-2">
                                {dnsRecords.map((record: any) => (
                                    <div key={record.id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <Globe size={16} className="text-emerald-400" />
                                            <div>
                                                <a href={`https://${record.name}`} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-200 hover:text-violet-400 hover:underline transition-colors">
                                                    {record.name}
                                                </a>
                                                <div className="text-xs text-slate-500">{record.type} • {record.proxied ? 'Proxied' : 'DNS Only'}</div>
                                            </div>
                                        </div>
                                        <Badge size="xs" color="emerald">Active</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Environment Variables (Inferred) */}
                    <Card className="glass-card">
                        <Title className="mb-4 text-white">Environment Signals</Title>
                        <Text className="mb-4 text-xs text-slate-500">
                            These variables were detected in the codebase and suggest potential configuration or secrets.
                            Values are NOT stored, only variable names.
                        </Text>
                        <div className="flex flex-wrap gap-2">
                            {interfaces.filter(i => i.details?.variable).map((iface, idx) => (
                                <code key={idx} className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-violet-300 font-mono">
                                    {iface.details.variable}
                                </code>
                            ))}
                            {interfaces.length === 0 && <Text className="italic text-slate-600">No specific variables detected.</Text>}
                        </div>
                    </Card>
                </Grid>
            </div>

            {/* DNS Connection Modal */}
            {isDnsModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsDnsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-800">
                            <Title className="text-white">Connect Custom Domain</Title>
                            <Text className="text-slate-400">Create a CNAME record pointing to this deployment.</Text>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Select Zone</label>
                                <select
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-violet-500"
                                    value={selectedZone}
                                    onChange={(e) => setSelectedZone(e.target.value)}
                                >
                                    <option value="">-- Select a domain --</option>
                                    {zones.map(z => (
                                        <option key={z.id} value={z.id}>{z.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Subdomain</label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-l-lg text-slate-200 focus:outline-none focus:border-violet-500"
                                        placeholder="app"
                                        value={subdomain}
                                        onChange={(e) => setSubdomain(e.target.value)}
                                    />
                                    <span className="p-2 bg-slate-800 border border-l-0 border-slate-700 rounded-r-lg text-slate-400 text-sm">
                                        .{zones.find(z => z.id === selectedZone)?.name || '...'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-800/50 rounded-lg text-sm text-slate-300 border border-slate-700">
                                <p><strong>Target:</strong> {targetDeployment?.url}</p>
                                <p><strong>Record:</strong> CNAME {subdomain}.{zones.find(z => z.id === selectedZone)?.name}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl flex justify-end gap-2">
                            <button
                                onClick={() => setIsDnsModalOpen(false)}
                                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConnectDomain}
                                disabled={!selectedZone || !subdomain || creatingRecord}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                            >
                                {creatingRecord ? "Creating..." : "Create Record"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit URL Modal */}
            {isEditUrlModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsEditUrlModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-800">
                            <Title className="text-white">Edit Live Site URL</Title>
                            <Text className="text-slate-400">Manually override the live site link for this repository.</Text>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">URL</label>
                                <input
                                    type="text"
                                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-violet-500"
                                    placeholder="https://example.com"
                                    value={manualUrl}
                                    onChange={(e) => setManualUrl(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-1">Leave empty to use auto-detected URL.</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditUrlModalOpen(false)}
                                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveUrl}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
