"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Book, Shield, Globe, Lock, Search, Filter, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface Repository {
    id: string;
    name: string;
    description: string | null;
    apiSpec: string | null;
    isPrivate: boolean;
}

type FilterStatus = 'all' | 'documented' | 'undocumented';

export default function DeveloperPortalClient({ repositories }: { repositories: Repository[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

    // Filter Logic
    const filteredRepos = useMemo(() => {
        return repositories.filter(repo => {
            const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (repo.description || '').toLowerCase().includes(searchTerm.toLowerCase());

            const hasDocs = !!repo.apiSpec;
            let matchesFilter = true;

            if (statusFilter === 'documented') matchesFilter = hasDocs;
            if (statusFilter === 'undocumented') matchesFilter = !hasDocs;

            return matchesSearch && matchesFilter;
        });
    }, [repositories, searchTerm, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const total = repositories.length;
        const documented = repositories.filter(r => r.apiSpec).length;
        return { total, documented, percentage: total > 0 ? Math.round((documented / total) * 100) : 0 };
    }, [repositories]);

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-950">
            <header className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Book className="w-8 h-8 text-blue-400" />
                            Developer Portal
                        </h1>
                        <p className="text-slate-300 mt-2">
                            Centralized API documentation (`{stats.documented}/{stats.total}` covered).
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search APIs..."
                                className="bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${statusFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter('documented')}
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${statusFilter === 'documented' ? 'bg-green-900/50 text-green-300' : 'text-slate-400 hover:text-green-300'}`}
                            >
                                <CheckCircle className="w-3 h-3" />
                                Valid
                            </button>
                            <button
                                onClick={() => setStatusFilter('undocumented')}
                                className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${statusFilter === 'undocumented' ? 'bg-red-900/50 text-red-300' : 'text-slate-400 hover:text-red-300'}`}
                            >
                                <XCircle className="w-3 h-3" />
                                Missing
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 mt-6 rounded-full overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500 box-shadow-glow"
                        style={{ width: `${stats.percentage}%` }}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRepos.map(repo => {
                    const hasDocs = !!repo.apiSpec;
                    let spec = {};
                    try {
                        spec = hasDocs ? JSON.parse(repo.apiSpec!) : {};
                    } catch (e) { }

                    // Status Indicator Logic
                    // Green: Has Docs (Slate 800)
                    // Red: No Docs (Darker Slate 900 with Red tinted border)
                    const statusColor = hasDocs
                        ? 'border-slate-700 hover:border-green-500/50'
                        : 'border-red-900/30 hover:border-red-500/50';

                    const statusBg = hasDocs
                        ? 'bg-slate-800'
                        : 'bg-slate-900'; // Fully opaque for better contrast

                    // @ts-ignore
                    const title = spec.info?.title || repo.name;
                    // @ts-ignore
                    const version = spec.info?.version || '0.0.0';

                    return (
                        <Link
                            key={repo.id}
                            href={`/developer/${repo.name}`}
                            className="block group"
                        >
                            <div className={`border rounded-lg p-6 transition-all h-full ${statusBg} ${statusColor} relative overflow-hidden group-hover:shadow-lg`}>

                                {/* Status Orb */}
                                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${hasDocs ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />

                                <div className="flex justify-between items-start mb-4 pr-6">
                                    <div className={`p-2 rounded-md transition-colors ${hasDocs ? 'bg-slate-900 group-hover:bg-green-900/20' : 'bg-black/40 group-hover:bg-red-900/10'}`}>
                                        <Book className={`w-6 h-6 ${hasDocs ? 'text-green-400' : 'text-slate-500'}`} />
                                    </div>
                                </div>

                                <h3 className={`text-lg font-bold mb-1 transition-colors ${hasDocs ? 'text-white group-hover:text-green-400' : 'text-slate-200 group-hover:text-red-300'}`}>
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-mono">
                                    <span className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">v{version}</span>
                                    <span>•</span>
                                    <span>{repo.name}</span>
                                </div>

                                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                    {/* @ts-ignore */}
                                    {spec.info?.description || repo.description || 'No description available.'}
                                </p>

                                {!hasDocs && (
                                    <div className="mt-4 text-xs text-red-400 font-medium flex items-center gap-1.5 bg-red-950/30 p-2 rounded border border-red-900/20 w-fit">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>No API Spec found</span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}

                {filteredRepos.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                        <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-300">No Repositories Found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
