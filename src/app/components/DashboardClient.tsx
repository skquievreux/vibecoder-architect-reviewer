"use client";

import { Card, Title, Text, Badge, Grid, Select, SelectItem, MultiSelect, MultiSelectItem, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@tremor/react";
import { useState, useEffect } from "react";
import { Search, Server, Database, Code, Globe, ExternalLink, AlertTriangle, RefreshCw, LayoutGrid, List, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Sparkles, Activity, Star } from "lucide-react";
import { Icon } from "@squievreux/ui";
import Link from "next/link";
import FavoriteButton from "./FavoriteButton";
import { useSession } from "next-auth/react";

// Types based on our analysis script output
type Technology = {
    id: string;
    name: string;
    category: string;
    version: string | null;
};
type Deployment = {
    id: string;
    provider: string;
    url: string;
};

type Task = {
    id: string;
    priority: string;
    status: string;
};

type Interface = {
    type: string;
    details: any;
};

type Repository = {
    repo: {
        id: string;
        name: string;
        description: string | null;
        isPrivate: boolean;
        updatedAt: string | Date; // Server sends string
        pushedAt: string | Date | null; // Server sends string or null
        url: string;
    };
    technologies: Technology[];
    deployments: Deployment[];
    tasks: Task[];
    interfaces: Interface[];
};

interface DashboardClientProps {
    initialRepos: Repository[];
}

export default function DashboardClient({ initialRepos }: DashboardClientProps) {
    const { data: session, status } = useSession();
    const [repos, setRepos] = useState<Repository[]>(initialRepos);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    // Replace sortOption with sortConfig
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'updated', direction: 'desc' });
    const [filterStatus, setFilterStatus] = useState<'all' | 'private' | 'supabase' | 'outdated' | 'critical' | 'favorites'>('all');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [enriching, setEnriching] = useState(false);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const handleSync = async () => {
        if (syncing) return;
        setSyncing(true);
        try {
            const res = await fetch('/api/system/sync', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                alert('Data synced successfully! Reloading...');
                window.location.reload();
            } else {
                alert('Sync failed: ' + data.error);
            }
        } catch (err) {
            alert('Sync failed: Network error');
        } finally {
            setSyncing(false);
        }
    };

    const handleEnrich = async () => {
        if (enriching) return;
        setEnriching(true);
        try {
            const res = await fetch('/api/ai/describe', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                window.location.reload();
            } else {
                alert('Enrichment failed: ' + data.error);
            }
        } catch (err) {
            alert('Enrichment failed: Network error');
        } finally {
            setEnriching(false);
        }
    };

    useEffect(() => {
        // Only fetch favorites on client side
        if (status === "loading" || status === "unauthenticated") return;

        fetch("/api/favorites")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch favorites");
                return res.json();
            })
            .then((data) => {
                if (data.favorites) {
                    setFavorites(data.favorites.map((f: any) => f.repositoryId));
                }
            })
            .catch(err => {
                console.error("Error fetching favorites:", err);
            });
    }, [status]);

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const isOutdated = (dateString: string | Date) => {
        const date = new Date(dateString);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return date < oneYearAgo;
    };

    const getPriorityScore = (tasks: { priority: string }[]) => {
        if (!tasks || tasks.length === 0) return 0;
        if (tasks.some(t => t.priority === 'HIGH')) return 3;
        if (tasks.some(t => t.priority === 'MEDIUM')) return 2;
        if (tasks.some(t => t.priority === 'LOW')) return 1;
        return 0;
    };

    const filteredRepos = repos.filter(r => {
        const matchesSearch = r.repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.technologies.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesProvider = selectedProviders.length === 0 ||
            r.deployments.some(d => selectedProviders.includes(d.provider));

        let matchesStatus = true;
        if (filterStatus === 'private') matchesStatus = r.repo.isPrivate;
        if (filterStatus === 'supabase') matchesStatus = r.technologies.some(t => t.name.toLowerCase() === 'supabase');
        if (filterStatus === 'outdated') matchesStatus = isOutdated(r.repo.updatedAt);
        if (filterStatus === 'critical') matchesStatus = r.tasks && r.tasks.some(t => t.priority === 'HIGH');
        if (filterStatus === 'favorites') matchesStatus = favorites.includes(r.repo.id);

        return matchesSearch && matchesProvider && matchesStatus;
    }).sort((a, b) => {
        let comparison = 0;
        if (sortConfig.key === 'name') {
            comparison = a.repo.name.localeCompare(b.repo.name);
        } else if (sortConfig.key === 'updated') {
            comparison = new Date(a.repo.updatedAt).getTime() - new Date(b.repo.updatedAt).getTime();
        } else if (sortConfig.key === 'status') {
            const statusA = a.repo.isPrivate ? 1 : 0;
            const statusB = b.repo.isPrivate ? 1 : 0;
            comparison = statusA - statusB;
        } else if (sortConfig.key === 'priority') {
            const scoreA = getPriorityScore(a.tasks);
            const scoreB = getPriorityScore(b.tasks);
            comparison = scoreA - scoreB;
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredRepos.length / itemsPerPage);
    const paginatedRepos = filteredRepos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedProviders, filterStatus]);

    const totalRepos = repos.length;
    const privateRepos = repos.filter(r => r.repo.isPrivate).length;
    const supabaseRepos = repos.filter(r => r.technologies.some(t => t.name === 'Supabase')).length;

    const getProviderColor = (provider: string) => {
        switch (provider) {
            case 'vercel': return 'neutral'; // Black/White
            case 'fly': return 'violet';
            case 'cloudflare': return 'orange';
            case 'lovable': return 'pink';
            default: return 'slate';
        }
    };

    const techColors: Record<string, string> = {
        blue: "bg-blue-100 text-blue-700 border-blue-200",
        cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
        sky: "bg-sky-100 text-sky-700 border-sky-200",
        indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
        violet: "bg-violet-100 text-violet-700 border-violet-200",
        purple: "bg-purple-100 text-purple-700 border-purple-200",
        fuchsia: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
        pink: "bg-pink-100 text-pink-700 border-pink-200",
        rose: "bg-rose-100 text-rose-700 border-rose-200",
    };

    const getTechClass = (techName: string) => {
        const colorKeys = Object.keys(techColors);
        let hash = 0;
        for (let i = 0; i < techName.length; i++) {
            hash = techName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colorKey = colorKeys[Math.abs(hash) % colorKeys.length];
        return techColors[colorKey];
    };

    if (loading) return <div className="p-10">Loading analysis...</div>;

    return (
        <main className="p-10 bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div>
                        <Title className="text-3xl font-bold text-white">Repository Maintenance Dashboard</Title>
                        <Text className="text-slate-400">Overview of {totalRepos} repositories</Text>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/maintenance?view=audit" className="no-underline">
                            <Badge color="emerald" icon={Activity} className="cursor-pointer hover:opacity-80 animate-pulse ring-1 ring-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                Live Ecosystem Status
                            </Badge>
                        </Link>
                        <Badge
                            color={filterStatus === 'all' ? "violet" : "slate"}
                            icon={Code}
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => setFilterStatus('all')}
                        >
                            {totalRepos} Total
                        </Badge>
                        <Badge
                            color={filterStatus === 'favorites' ? "amber" : "slate"}
                            icon={Star}
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => setFilterStatus('favorites')}
                        >
                            {favorites.length} Favorites
                        </Badge>
                        <Badge
                            color={filterStatus === 'private' ? "violet" : "slate"}
                            icon={Server}
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => setFilterStatus('private')}
                        >
                            {privateRepos} Private
                        </Badge>
                        <Badge
                            color={filterStatus === 'supabase' ? "cyan" : "slate"}
                            icon={Database}
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => setFilterStatus('supabase')}
                        >
                            {supabaseRepos} Supabase
                        </Badge>
                        <Badge
                            color={filterStatus === 'outdated' ? "amber" : "slate"}
                            icon={AlertTriangle}
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => setFilterStatus('outdated')}
                        >
                            Outdated
                        </Badge>
                        <Link href="/tasks" className="no-underline">
                            <Badge
                                color={filterStatus === 'critical' ? "rose" : "slate"}
                                icon={AlertTriangle}
                                className="cursor-pointer hover:opacity-80"
                            >
                                Tasks
                            </Badge>
                        </Link>
                        <a href="/tech" className="no-underline">
                            <Badge color="violet" icon={Code} className="cursor-pointer hover:opacity-80">
                                Tech Overview
                            </Badge>
                        </a>
                        <a href="/dns" className="no-underline">
                            <Badge color="amber" icon={Globe} className="cursor-pointer hover:opacity-80">
                                DNS
                            </Badge>
                        </a>
                        <a href="/logs" className="no-underline">
                            <Badge color="slate" icon={Code} className="cursor-pointer hover:opacity-80">
                                Logs
                            </Badge>
                        </a>
                        <a href="/report" className="no-underline">
                            <Badge color="fuchsia" icon={Sparkles} className="cursor-pointer hover:opacity-80">
                                AI Report
                            </Badge>
                        </a>
                        <Badge
                            color="slate"
                            icon={RefreshCw}
                            className={`cursor-pointer hover:opacity-80 ${syncing ? 'animate-pulse' : ''}`}
                            onClick={handleSync}
                        >
                            {syncing ? 'Syncing...' : 'Refresh Data'}
                        </Badge>
                        <Badge
                            color="indigo"
                            icon={Sparkles}
                            className={`cursor-pointer hover:opacity-80 ${enriching ? 'animate-pulse' : ''}`}
                            onClick={handleEnrich}
                        >
                            {enriching ? 'Enriching...' : 'Enrich Data'}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Icon icon={Search} className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search repositories or technologies..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <MultiSelect
                            onValueChange={setSelectedProviders}
                            placeholder="Filter Provider"
                            className="max-w-full"
                        >
                            <MultiSelectItem value="vercel">Vercel</MultiSelectItem>
                            <MultiSelectItem value="fly">Fly.io</MultiSelectItem>
                            <MultiSelectItem value="cloudflare">Cloudflare</MultiSelectItem>
                        </MultiSelect>
                    </div>
                    <div className="w-full md:w-48">
                        {/* Update Select to use sortConfig */}
                        <Select
                            value={sortConfig.key}
                            onValueChange={(val) => setSortConfig({ key: val, direction: val === 'updated' ? 'desc' : 'asc' })}
                        >
                            <SelectItem value="updated">Last Updated</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="priority">Task Priority</SelectItem>
                        </Select>
                    </div>
                    {/* View Toggle */}
                    <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-800 text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Grid View"
                        >
                            <Icon icon={LayoutGrid} className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-800 text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
                            title="List View"
                        >
                            <Icon icon={List} className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                        {paginatedRepos.map((item) => {
                            const isRepoOutdated = isOutdated(item.repo.updatedAt);
                            const visibleTechnologies = item.technologies.filter(t => {
                                const isDeployment = item.deployments.some(d => d.provider.toLowerCase() === t.name.toLowerCase());
                                const isIgnored = ['vercel', 'fly.io', 'heroku', 'netlify'].includes(t.name.toLowerCase());
                                return !isDeployment && !isIgnored;
                            });

                            return (
                                <Card key={item.repo.name} className={`glass-card flex flex-col h-full ${isRepoOutdated ? 'border-amber-500/30 bg-amber-900/10' : ''}`}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                                        <div className="min-w-0 flex-1 pr-2 w-full">
                                            <div className="flex items-center gap-2 max-w-full">
                                                <Link href={`/repo/${item.repo.name}`} className="hover:underline min-w-0 block truncate">
                                                    <Title className="truncate text-slate-200" title={item.repo.name}>{item.repo.name}</Title>
                                                </Link>
                                                {isRepoOutdated && <Badge color="amber" size="xs" className="shrink-0">Stale</Badge>}
                                            </div>
                                            <Text className="truncate text-xs text-slate-400 block w-full">{item.repo.description || "No description"}</Text>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start mt-2 sm:mt-0">
                                            <FavoriteButton
                                                repositoryId={item.repo.id}
                                                isFavorite={favorites.includes(item.repo.id)}
                                                onToggle={(newState) => {
                                                    if (newState) {
                                                        setFavorites(prev => [...prev, item.repo.id]);
                                                    } else {
                                                        setFavorites(prev => prev.filter(id => id !== item.repo.id));
                                                    }
                                                }}
                                            />
                                            <Badge color={item.repo.isPrivate ? "slate" : "violet"}>
                                                {item.repo.isPrivate ? "Private" : "Public"}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex-grow">
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${new Date(item.repo.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'bg-emerald-500 shadow-emerald-500/50' :
                                                new Date(item.repo.updatedAt) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) ? 'bg-amber-500 shadow-amber-500/50' :
                                                    'bg-rose-500 shadow-rose-500/50'
                                                }`} />
                                            <span className="text-slate-400">
                                                Last updated: {new Date(item.repo.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {item.deployments.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {item.deployments.map(d => {
                                                    if (!d.url) return null;
                                                    const href = d.url.startsWith('http') ? d.url : `https://${d.url}`;
                                                    return (
                                                        <a key={d.id} href={href} target="_blank" rel="noopener noreferrer" className="no-underline">
                                                            <Badge color={getProviderColor(d.provider)} icon={Globe}>
                                                                {d.provider}
                                                            </Badge>
                                                        </a>
                                                    );
                                                })}
                                            </div >
                                        )}

                                        {
                                            item.interfaces.length > 0 && (
                                                <div>
                                                    <Text className="font-medium text-xs mb-1 text-slate-500">Interfaces:</Text>
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.interfaces.map((iface, idx) => (
                                                            <Badge key={idx} color="neutral" size="xs" icon={ExternalLink}>
                                                                {iface.details?.service || iface.type}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        }

                                        <div>
                                            <Text className="font-medium text-xs mb-1 text-slate-500">Technologies:</Text>
                                            <div className="flex flex-wrap gap-1">
                                                {visibleTechnologies.slice(0, 5).map(t => (
                                                    <span
                                                        key={t.id}
                                                        onClick={() => setSearchTerm(t.name)}
                                                        className={`px-2 py-0.5 text-[10px] rounded-full border cursor-pointer transition-colors hover:opacity-80 ${getTechClass(t.name)}`}
                                                    >
                                                        {t.name}
                                                    </span>
                                                ))}
                                                {visibleTechnologies.length > 5 && (
                                                    <span className="text-xs text-slate-500">+{visibleTechnologies.length - 5}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div >

                                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                                        <div className="flex gap-2">
                                            {/* Task Indicators */}
                                            {item.tasks && item.tasks.filter(t => t.priority === 'HIGH').length > 0 && (
                                                <Badge size="xs" color="rose" icon={AlertTriangle}>
                                                    {item.tasks.filter(t => t.priority === 'HIGH').length} Critical
                                                </Badge>
                                            )}
                                            {item.tasks && item.tasks.filter(t => t.priority === 'MEDIUM').length > 0 && (
                                                <Badge size="xs" color="amber">
                                                    {item.tasks.filter(t => t.priority === 'MEDIUM').length} Medium
                                                </Badge>
                                            )}
                                            {item.tasks && item.tasks.filter(t => t.priority === 'LOW').length > 0 && (
                                                <Badge size="xs" color="blue">
                                                    {item.tasks.filter(t => t.priority === 'LOW').length} Low
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>Created: {new Date(item.repo.pushedAt || item.repo.updatedAt).toLocaleDateString()}</span>
                                            <a href={item.repo.url} target="_blank" className="flex items-center gap-1 text-violet-400 hover:text-violet-300 hover:underline">
                                                GitHub <Icon icon={ExternalLink} className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </Card >
                            );
                        })}
                    </Grid >
                ) : (
                    <Card className="p-0 overflow-hidden glass-card">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell
                                        className="cursor-pointer hover:bg-slate-800 transition-colors text-slate-300"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Name
                                            {sortConfig.key === 'name' && (
                                                sortConfig.direction === 'asc' ? <Icon icon={ArrowUp} className="w-3.5 h-3.5" /> : <Icon icon={ArrowDown} className="w-3.5 h-3.5" />
                                            )}
                                        </div>
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        className="cursor-pointer hover:bg-slate-800 transition-colors text-slate-300"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Status
                                            {sortConfig.key === 'status' && (
                                                sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            )}
                                        </div>
                                    </TableHeaderCell>
                                    <TableHeaderCell className="w-10"></TableHeaderCell>
                                    <TableHeaderCell
                                        className="cursor-pointer hover:bg-slate-800 transition-colors text-slate-300"
                                        onClick={() => handleSort('priority')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Tasks
                                            {sortConfig.key === 'priority' && (
                                                sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            )}
                                        </div>
                                    </TableHeaderCell>
                                    <TableHeaderCell className="text-slate-300">Technologies</TableHeaderCell>
                                    <TableHeaderCell
                                        className="cursor-pointer hover:bg-slate-800 transition-colors text-slate-300"
                                        onClick={() => handleSort('updated')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Last Updated
                                            {sortConfig.key === 'updated' && (
                                                sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                            )}
                                        </div>
                                    </TableHeaderCell>
                                    <TableHeaderCell className="text-slate-300">Links</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedRepos.map((item) => {
                                    const isRepoOutdated = isOutdated(item.repo.updatedAt);
                                    const visibleTechnologies = item.technologies.filter(t => {
                                        const isDeployment = item.deployments.some(d => d.provider.toLowerCase() === t.name.toLowerCase());
                                        const isIgnored = ['vercel', 'fly.io', 'heroku', 'netlify'].includes(t.name.toLowerCase());
                                        return !isDeployment && !isIgnored;
                                    });

                                    return (
                                        <TableRow key={item.repo.name} className="hover:bg-slate-800/50 transition-colors border-b border-slate-800">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <Link href={`/repo/${item.repo.name}`} className="font-medium text-violet-400 hover:underline flex items-center gap-2">
                                                        {item.repo.name}
                                                        {isRepoOutdated && <Badge color="amber" size="xs">Stale</Badge>}
                                                    </Link>
                                                    <span className="text-xs text-slate-500 truncate max-w-xs">{item.repo.description}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge color={item.repo.isPrivate ? "slate" : "violet"} size="xs">
                                                    {item.repo.isPrivate ? "Private" : "Public"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <FavoriteButton
                                                    repositoryId={item.repo.id}
                                                    isFavorite={favorites.includes(item.repo.id)}
                                                    onToggle={(newState) => {
                                                        if (newState) {
                                                            setFavorites(prev => [...prev, item.repo.id]);
                                                        } else {
                                                            setFavorites(prev => prev.filter(id => id !== item.repo.id));
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap max-w-[150px]">
                                                    {item.tasks && item.tasks.filter(t => t.priority === 'HIGH').length > 0 && (
                                                        <Badge size="xs" color="rose" icon={AlertTriangle}>
                                                            {item.tasks.filter(t => t.priority === 'HIGH').length}
                                                        </Badge>
                                                    )}
                                                    {item.tasks && item.tasks.filter(t => t.priority === 'MEDIUM').length > 0 && (
                                                        <Badge size="xs" color="amber">
                                                            {item.tasks.filter(t => t.priority === 'MEDIUM').length}
                                                        </Badge>
                                                    )}
                                                    {item.tasks && item.tasks.filter(t => t.priority === 'LOW').length > 0 && (
                                                        <Badge size="xs" color="blue">
                                                            {item.tasks.filter(t => t.priority === 'LOW').length}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {visibleTechnologies.slice(0, 3).map(t => (
                                                        <span
                                                            key={t.id}
                                                            className={`px-2 py-0.5 text-[10px] rounded-full border ${getTechClass(t.name)}`}
                                                        >
                                                            {t.name}
                                                        </span>
                                                    ))}
                                                    {visibleTechnologies.length > 3 && (
                                                        <span className="text-xs text-slate-500">+{visibleTechnologies.length - 3}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <div className={`w-2 h-2 rounded-full ${new Date(item.repo.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'bg-emerald-500' :
                                                        new Date(item.repo.updatedAt) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) ? 'bg-amber-500' :
                                                            'bg-rose-500'
                                                        }`} />
                                                    {new Date(item.repo.updatedAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {item.deployments.map(d => {
                                                        if (!d.url) return null;
                                                        const href = d.url.startsWith('http') ? d.url : `https://${d.url}`;
                                                        return (
                                                            <a key={d.id} href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-violet-400" title={d.provider}>
                                                                <Icon icon={Globe} className="w-4 h-4" />
                                                            </a>
                                                        );
                                                    })}
                                                    <a href={item.repo.url} target="_blank" className="text-slate-400 hover:text-white" title="GitHub">
                                                        <Icon icon={ExternalLink} className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Card>
                )}

                {/* Pagination Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-slate-400">
                    <Text className="text-slate-400">Showing {paginatedRepos.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredRepos.length)} of {filteredRepos.length}</Text>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 border border-slate-700 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                        >
                            <Icon icon={ChevronLeft} className="w-4 h-4" />
                        </button>
                        <div className="flex items-center px-2">
                            <span className="text-sm font-medium text-slate-300">{currentPage} / {totalPages || 1}</span>
                        </div>
                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 border border-slate-700 rounded hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300"
                        >
                            <Icon icon={ChevronRight} className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div >
        </main >
    );
}
