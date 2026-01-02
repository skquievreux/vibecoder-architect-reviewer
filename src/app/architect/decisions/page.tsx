"use client";

import { Card, Title, Text, Button, Badge, Grid } from "@tremor/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, BookOpen, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

type Decision = {
    id: string;
    title: string;
    status: 'PROPOSED' | 'ACCEPTED' | 'DEPRECATED' | 'REJECTED';
    tags: string;
    updatedAt: string;
};

export default function DecisionsPage() {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/architect/decisions')
            .then(res => res.json())
            .then(data => {
                setDecisions(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredDecisions = decisions.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.tags.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'emerald';
            case 'PROPOSED': return 'amber';
            case 'DEPRECATED': return 'orange';
            case 'REJECTED': return 'rose';
            default: return 'slate';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return CheckCircle;
            case 'PROPOSED': return Clock;
            case 'DEPRECATED': return AlertTriangle;
            case 'REJECTED': return XCircle;
            default: return BookOpen;
        }
    };

    return (
        <main className="p-10 bg-slate-950 min-h-screen text-slate-100">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <Title className="text-3xl font-bold text-white flex items-center gap-3">
                            <BookOpen className="text-violet-400" /> Knowledge Base
                        </Title>
                        <Text className="text-slate-400 mt-2">Architecture Decision Records (ADRs) and Policies</Text>
                    </div>
                    <Link href="/architect/decisions/new">
                        <Button icon={Plus} color="violet">New Decision</Button>
                    </Link>
                </div>

                <div className="mb-6 relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search decisions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 sm:text-sm transition-colors hover:border-slate-600"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500">Loading decisions...</div>
                ) : (
                    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                        {filteredDecisions.map(decision => {
                            const Icon = getStatusIcon(decision.status);
                            let tags: string[] = [];
                            try {
                                tags = JSON.parse(decision.tags);
                            } catch {
                                // Fallback for CSV strings (e.g. from seed scripts)
                                if (typeof decision.tags === 'string') {
                                    tags = decision.tags.split(',').map(t => t.trim()).filter(Boolean);
                                }
                            }

                            return (
                                <Link key={decision.id} href={`/architect/decisions/${decision.id}`}>
                                    <Card className="h-full hover:border-violet-500/50 transition-colors bg-slate-900 border-slate-800 group cursor-pointer">
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge icon={Icon} color={getStatusColor(decision.status)}>
                                                {decision.status}
                                            </Badge>
                                            <Text className="text-xs text-slate-500">
                                                {new Date(decision.updatedAt).toLocaleDateString()}
                                            </Text>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                                            {decision.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {tags.slice(0, 3).map((tag: string) => (
                                                <span key={tag} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </Grid>
                )}
            </div>
        </main>
    );
}
