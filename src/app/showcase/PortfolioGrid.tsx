
"use client";

import { useState } from "react";
import { Search, ExternalLink, Code2, LineChart, Users } from "lucide-react";

type Project = {
    id: string;
    name: string;
    description: string;
    url: string | null;
    technologies: string[];
    previewImageUrl?: string | null;
    businessCanvas: {
        valueProposition: string[];
        customerSegments: { name: string }[];
        revenueStreams: { source: string; model: string }[];
    } | null;
};

export default function PortfolioGrid({ projects }: { projects: Project[] }) {
    const [filter, setFilter] = useState("");

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.description?.toLowerCase().includes(filter.toLowerCase()) ||
        p.businessCanvas?.valueProposition.some(v => v.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            {/* Search / Filter Bar */}
            <div className="relative max-w-xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search for solutions, tech stacks, or business cases..."
                    className="block w-full pl-10 pr-3 py-4 border border-slate-700 rounded-full leading-5 bg-slate-900/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm backdrop-blur-sm transition-all shadow-xl"
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <div
                        key={project.id}
                        className="group relative bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 flex flex-col"
                    >
                        {/* Card Media (Screenshot or Gradient) */}
                        <div className="relative h-48 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                            {project.previewImageUrl ? (
                                <img
                                    src={project.previewImageUrl}
                                    alt={project.name}
                                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900 to-blue-900/40 opacity-50" />
                            )}

                            {/* Overlay Gradient for readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                            {/* Tech Badges on image */}
                            <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
                                {project.technologies.slice(0, 2).map(t => (
                                    <span key={t} className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded bg-purple-500/20 text-purple-200 border border-purple-500/30 backdrop-blur-md">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                                    {project.name}
                                </h3>
                                {project.url && (
                                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                        <ExternalLink className="h-5 w-5" />
                                    </a>
                                )}
                            </div>

                            <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                                {project.description}
                            </p>

                            {/* Business Value Highlights */}
                            {project.businessCanvas && (
                                <div className="mb-6 space-y-3 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                                    <div className="flex items-start gap-2 text-xs text-slate-300">
                                        <LineChart className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                        <span>{project.businessCanvas.valueProposition[0] || "High-Impact Solution"}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs text-slate-300">
                                        <Users className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                                        <span>{project.businessCanvas.customerSegments[0]?.name || "Enterprise Customers"}</span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.technologies.slice(2, 6).map(t => (
                                        <span key={t} className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-slate-800 text-slate-400 border border-slate-700">
                                            {t}
                                        </span>
                                    ))}
                                    {project.technologies.length > 4 && (
                                        <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-slate-800 text-slate-500 border border-slate-700">
                                            +{project.technologies.length - 4}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/20 flex justify-between items-center group-hover:bg-slate-900/50 transition-colors">
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                <Code2 className="h-3 w-3" /> Source Available
                            </span>
                            <a
                                href={`/repo/${project.name}`}
                                className="text-xs font-semibold text-purple-400 group-hover:text-purple-300 flex items-center gap-1"
                            >
                                View Analysis &rarr;
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
