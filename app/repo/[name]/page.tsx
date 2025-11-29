"use client";

import { Card, Title, Text, Badge, Grid, DonutChart, List, ListItem } from "@tremor/react";
import { useState, useEffect } from "react";
import { ArrowLeft, Github, Globe, ExternalLink, Calendar, Code, Database, Server, Shield } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Technology = {
    id: string;
    name: string;
    category: string;
    version: string | null;
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
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [repoName]);

    useEffect(() => {
        if (repoData?.deployments && repoData.deployments.length > 0) {
            // Check for custom domain (Cloudflare)
            const target = repoData.deployments[0].url.replace(/^https?:\/\//, '').replace(/\/$/, '');
            fetch(`/api/dns?target=${target}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        setCustomDomain(data[0].name);
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
        <main className="p-10 bg-slate-50 min-h-screen relative">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* ... Header ... */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-slate-600" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <Title className="text-3xl font-bold text-slate-900">{repo.name}</Title>
                                <Badge color={repo.isPrivate ? "slate" : "blue"}>{repo.isPrivate ? "Private" : "Public"}</Badge>
                                {isOutdated && <Badge color="orange">Outdated</Badge>}
                            </div>
                            <Text className="mt-1">{repo.description || "No description provided."}</Text>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium">
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
                                        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-medium ${repo.customUrl ? 'bg-indigo-600 hover:bg-indigo-700' : (customDomain ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700')}`}
                                    >
                                        <Globe size={18} />
                                        {repo.customUrl ? "Custom Link" : (customDomain ? customDomain : "Live Site")}

                                        {/* Status Dot */}
                                        {linkStatus && (
                                            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${linkStatus.reachable ? 'bg-green-400' : 'bg-red-500'}`} />
                                        )}
                                    </a>
                                    {/* Tooltip */}
                                    {linkStatus && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            {linkStatus.reachable ? `Online (${linkStatus.status})` : `Offline (${linkStatus.status})`} • {linkStatus.latency}ms
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        setManualUrl(repo.customUrl || activeUrl || "");
                                        setIsEditUrlModalOpen(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
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
                    <Card>
                        <Title className="mb-4">Statistics</Title>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Calendar size={16} />
                                <span>Created: {new Date(repo.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Calendar size={16} />
                                <span>Last Push: {new Date(repo.pushedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Calendar size={16} />
                                <span>Updated: {new Date(repo.updatedAt).toLocaleDateString()}</span>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <Text className="mb-2 font-medium">Languages</Text>
                                <div className="flex flex-wrap gap-2">
                                    {repo.languages && repo.languages.map((l, i) => (
                                        <Badge key={i} color="slate" size="xs">{l.node.name}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tech Stack */}
                    <Card className="md:col-span-2">
                        <Title className="mb-4">Technology Stack</Title>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {technologies.length === 0 ? (
                                <Text>No technologies detected.</Text>
                            ) : (
                                technologies.map(tech => (
                                    <div key={tech.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-md border border-slate-200">
                                                <Code size={16} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{tech.name}</div>
                                                <div className="text-xs text-slate-500 capitalize">{tech.category || "Tool"}</div>
                                            </div>
                                        </div>
                                        {tech.version && (
                                            <Badge color="blue" size="xs">v{tech.version}</Badge>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </Grid>

                <Grid numItems={1} numItemsMd={2} className="gap-6">
                    {/* Interfaces */}
                    <Card>
                        <Title className="mb-4">Detected Interfaces</Title>
                        {interfaces.length === 0 ? (
                            <Text>No external interfaces detected.</Text>
                        ) : (
                            <List>
                                {interfaces.map((iface, idx) => {
                                    const serviceName = (iface.details?.service || iface.type).toLowerCase();
                                    const dashboardUrl = Object.entries(DASHBOARD_URLS).find(([key]) => serviceName.includes(key))?.[1];

                                    const content = (
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="mt-1">
                                                {iface.type === 'database_connection' ? <Database size={16} className="text-blue-500" /> :
                                                    iface.type === 'cloud_service' ? <Server size={16} className="text-orange-500" /> :
                                                        <Globe size={16} className="text-green-500" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900 flex items-center gap-2">
                                                    {iface.details?.service || iface.type.replace('_', ' ')}
                                                    {dashboardUrl && <ExternalLink size={12} className="text-slate-400" />}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {iface.direction} • {iface.details?.variable ? `Via ${iface.details.variable}` : 'Inferred'}
                                                </div>
                                            </div>
                                        </div>
                                    );

                                    return (
                                        <ListItem key={idx} className="p-0">
                                            {dashboardUrl ? (
                                                <a
                                                    href={dashboardUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex w-full p-4 hover:bg-slate-50 transition-colors rounded-lg -m-4"
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

                    {/* Environment Variables (Inferred) */}
                    <Card>
                        <Title className="mb-4">Environment Signals</Title>
                        <Text className="mb-4 text-xs text-slate-500">
                            These variables were detected in the codebase and suggest potential configuration or secrets.
                            Values are NOT stored, only variable names.
                        </Text>
                        <div className="flex flex-wrap gap-2">
                            {interfaces.filter(i => i.details?.variable).map((iface, idx) => (
                                <code key={idx} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-700 font-mono">
                                    {iface.details.variable}
                                </code>
                            ))}
                            {interfaces.length === 0 && <Text className="italic text-slate-400">No specific variables detected.</Text>}
                        </div>
                    </Card>
                </Grid>
            </div>

            {/* DNS Connection Modal */}
            {isDnsModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsDnsModalOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100">
                            <Title>Connect Custom Domain</Title>
                            <Text>Create a CNAME record pointing to this deployment.</Text>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Zone</label>
                                <select
                                    className="w-full p-2 border border-slate-200 rounded-lg"
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subdomain</label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border border-slate-200 rounded-l-lg"
                                        placeholder="app"
                                        value={subdomain}
                                        onChange={(e) => setSubdomain(e.target.value)}
                                    />
                                    <span className="p-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-slate-500 text-sm">
                                        .{zones.find(z => z.id === selectedZone)?.name || '...'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                                <p><strong>Target:</strong> {targetDeployment?.url}</p>
                                <p><strong>Record:</strong> CNAME {subdomain}.{zones.find(z => z.id === selectedZone)?.name}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-2">
                            <button
                                onClick={() => setIsDnsModalOpen(false)}
                                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConnectDomain}
                                disabled={!selectedZone || !subdomain || creatingRecord}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creatingRecord ? "Creating..." : "Create Record"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit URL Modal */}
            {isEditUrlModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditUrlModalOpen(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100">
                            <Title>Edit Live Site URL</Title>
                            <Text>Manually override the live site link for this repository.</Text>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-slate-200 rounded-lg"
                                    placeholder="https://example.com"
                                    value={manualUrl}
                                    onChange={(e) => setManualUrl(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 mt-1">Leave empty to use auto-detected URL.</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditUrlModalOpen(false)}
                                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveUrl}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
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
