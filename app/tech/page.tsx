"use client";

import { Card, Title, Text, Badge, Grid, BarList } from "@tremor/react";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Technology = {
    id: string;
    name: string;
    category: string;
    version: string | null;
};

type Repository = {
    repo: {
        name: string;
        url: string;
    };
    technologies: Technology[];
};

type VersionGroup = {
    version: string;
    count: number;
    repos: { name: string, url: string }[];
};

type TechGroup = {
    name: string;
    category: string;
    totalCount: number;
    versions: VersionGroup[];
};

export default function TechOverview() {
    const [techGroups, setTechGroups] = useState<TechGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVersion, setSelectedVersion] = useState<{ techName: string, version: string, repos: { name: string, url: string }[] } | null>(null);

    useEffect(() => {
        fetch("/api/repos")
            .then((res) => res.json())
            .then((data: Repository[]) => {
                const groups: Record<string, TechGroup> = {};

                data.forEach((item) => {
                    item.technologies.forEach((tech) => {
                        if (!groups[tech.name]) {
                            groups[tech.name] = {
                                name: tech.name,
                                category: tech.category || "Other",
                                totalCount: 0,
                                versions: [],
                            };
                        }

                        groups[tech.name].totalCount++;

                        const version = tech.version || "Unknown";
                        let vGroup = groups[tech.name].versions.find((v) => v.version === version);
                        if (!vGroup) {
                            vGroup = { version, count: 0, repos: [] };
                            groups[tech.name].versions.push(vGroup);
                        }
                        vGroup.count++;
                        vGroup.repos.push({ name: item.repo.name, url: item.repo.url });
                    });
                });

                // Sort versions by count desc
                Object.values(groups).forEach(g => {
                    g.versions.sort((a, b) => b.count - a.count);
                });

                // Convert to array and sort by total count
                const sortedGroups = Object.values(groups).sort((a, b) => b.totalCount - a.totalCount);
                setTechGroups(sortedGroups);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredGroups = techGroups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10">Loading technology data...</div>;

    return (
        <main className="p-10 bg-slate-50 min-h-screen relative">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-slate-600" />
                        </Link>
                        <div>
                            <Title className="text-3xl font-bold text-slate-900">Technology Overview</Title>
                            <Text>Detailed breakdown of technology versions across repositories</Text>
                        </div>
                    </div>
                    <div className="w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search technologies..."
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Grid numItems={1} numItemsMd={2} className="gap-6">
                    {filteredGroups.map((group) => (
                        <Card key={group.name} className="flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Title>{group.name}</Title>
                                    <Text className="text-xs uppercase font-semibold tracking-wider text-slate-400">{group.category}</Text>
                                </div>
                                <Badge color="blue">{group.totalCount} Repos</Badge>
                            </div>

                            <div className="space-y-4">
                                <Title className="text-sm font-medium text-slate-700">Version Distribution</Title>
                                <BarList
                                    data={group.versions.map(v => ({
                                        name: v.version,
                                        value: v.count,
                                    }))}
                                    className="mt-2"
                                />

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <Text className="text-xs font-medium mb-2">Details:</Text>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {group.versions.map(v => (
                                            <div key={v.version} className="text-xs group">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="font-semibold text-slate-700">{v.version}:</span>
                                                        <span className="text-slate-500 ml-1">
                                                            {v.repos.slice(0, 5).map(r => r.name).join(", ")}
                                                            {v.repos.length > 5 && (
                                                                <span className="text-slate-400 ml-1">+{v.repos.length - 5} more</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedVersion({ techName: group.name, version: v.version, repos: v.repos })}
                                                        className="text-blue-600 hover:text-blue-800 text-[10px] font-medium transition-colors ml-2"
                                                    >
                                                        View All
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </Grid>
            </div>

            {/* Simple Modal for Version Details */}
            {selectedVersion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVersion(null)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <Title>{selectedVersion.techName}</Title>
                                <Text>Version: <span className="font-semibold text-slate-900">{selectedVersion.version}</span></Text>
                            </div>
                            <button onClick={() => setSelectedVersion(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <Text className="mb-4">Used in {selectedVersion.repos.length} repositories:</Text>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {selectedVersion.repos.map(repo => (
                                    <Link
                                        key={repo.name}
                                        href={`/repo/${repo.name}`}
                                        className="p-2 bg-slate-50 rounded border border-slate-100 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors block truncate"
                                    >
                                        {repo.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
                            <button
                                onClick={() => setSelectedVersion(null)}
                                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
