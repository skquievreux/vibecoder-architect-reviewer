import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Book, Shield, Globe, Lock } from 'lucide-react';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function DeveloperPortal() {
    const repos = await prisma.repository.findMany({
        where: {
            apiSpec: { not: null }
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                    <Book className="w-8 h-8 text-blue-400" />
                    Developer Portal
                </h1>
                <p className="text-slate-400 mt-2">
                    Centralized API documentation for the entire portfolio.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repos.map(repo => {
                    const spec = JSON.parse(repo.apiSpec || '{}');
                    const title = spec.info?.title || repo.name;
                    const version = spec.info?.version || '1.0.0';
                    const isPublic = repo.apiSpec?.includes('ApiKeyAuth'); // Simple heuristic

                    return (
                        <Link
                            key={repo.id}
                            href={`/developer/${repo.name}`}
                            className="block group"
                        >
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-slate-900 rounded-md group-hover:bg-blue-900/20 transition-colors">
                                        <Book className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${isPublic ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-amber-900/30 border-amber-700 text-amber-400'}`}>
                                        {isPublic ? 'Public API' : 'Internal API'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-slate-100 mb-1 group-hover:text-blue-400 transition-colors">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                    <span className="font-mono">v{version}</span>
                                    <span>•</span>
                                    <span>{repo.name}</span>
                                </div>

                                <p className="text-sm text-slate-400 line-clamp-2">
                                    {spec.info?.description || repo.description || 'No description available.'}
                                </p>
                            </div>
                        </Link>
                    );
                })}

                {repos.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                        <Book className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-300">No Documentation Found</h3>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            Repositories must generate an <code>openapi.json</code> and push it to the dashboard to appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
