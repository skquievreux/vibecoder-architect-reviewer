"use client";

import { Card, Title, Text, Badge, Grid, List, ListItem } from "@tremor/react";
import { useState, useEffect } from "react";
import { ArrowLeft, Server, Cloud, CreditCard, Cpu, Wrench, ShieldCheck, Book } from "lucide-react";
import Link from "next/link";

type Provider = {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string; // JSON string
    capabilities: string; // JSON string
    website: string;
    developerUrl?: string;
    docsUrl?: string;
    billingUrl?: string;
};

const CATEGORY_ICONS: Record<string, any> = {
    hosting: Server,
    infrastructure: Cloud,
    service: CreditCard,
    ai: Cpu,
    tool: Wrench,
    other: ShieldCheck
};

export default function ProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/providers")
            .then((res) => res.json())
            .then((data) => {
                setProviders(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const parseJson = (str: string) => {
        try {
            return JSON.parse(str);
        } catch {
            return [];
        }
    };

    if (loading) return <div className="p-10 text-slate-400">Loading service catalog...</div>;

    const groupedProviders = providers.reduce((acc, provider) => {
        const cat = provider.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(provider);
        return acc;
    }, {} as Record<string, Provider[]>);

    return (
        <main className="p-10 bg-slate-950 min-h-screen relative">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <Title className="text-3xl font-bold text-white">Service Catalog</Title>
                        <Text className="text-slate-400">Approved external providers and SaaS integrations</Text>
                    </div>
                </div>

                {/* Strategic Guidelines (ADRs) */}
                <Card className="glass-card border-l-4 border-l-violet-500">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-violet-500/20 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <Title className="text-white mb-2">Strategic Hosting Guidelines (ADR-007)</Title>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                    <span className="font-bold text-white block mb-1">Frontend & Static Sites</span>
                                    <span className="text-slate-400">Use <strong>Vercel</strong> for Next.js applications to leverage Edge Network, automatic CI/CD, and preview deployments.</span>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                    <span className="font-bold text-white block mb-1">Backend & Databases</span>
                                    <span className="text-slate-400">Use <strong>Hetzner</strong> (Docker/VPS) for long-running services and databases where cost-efficiency and control are required.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Provider Grid */}
                {Object.entries(groupedProviders).map(([category, items]) => (
                    <div key={category}>
                        <Title className="text-xl font-semibold text-white capitalize mb-4 flex items-center gap-2">
                            {CATEGORY_ICONS[category] && <span className="w-5 h-5 inline-flex items-center justify-center"><Server /></span>} {/* Placeholder icon logic */}
                            {category} Providers
                        </Title>
                        <Grid numItems={1} numItemsMd={2} numItemsLg={3} className="gap-6">
                            {items.map((provider) => (
                                <Card key={provider.id} className="glass-card flex flex-col h-full hover:border-violet-500/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <Title className="text-white text-lg">{provider.name}</Title>
                                        <Badge size="xs" color="slate">{provider.category}</Badge>
                                    </div>
                                    <Text className="text-slate-400 text-sm mb-4 flex-grow">{provider.description}</Text>

                                    <div className="space-y-3">
                                        <div>
                                            <Text className="text-xs font-medium text-slate-500 mb-1">Capabilities</Text>
                                            <div className="flex flex-wrap gap-1">
                                                {parseJson(provider.capabilities).slice(0, 3).map((cap: string) => (
                                                    <span key={cap} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700">
                                                        {cap}
                                                    </span>
                                                ))}
                                                {parseJson(provider.capabilities).length > 3 && (
                                                    <span className="px-2 py-0.5 text-slate-500 text-[10px]">+ more</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-auto border-t border-slate-800 flex justify-between items-center gap-2">
                                            <div className="flex gap-3">
                                                {provider.developerUrl && (
                                                    <a href={provider.developerUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-violet-400 transition-colors" title="Developer Portal">
                                                        <Server size={16} />
                                                    </a>
                                                )}
                                                <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-violet-400 transition-colors" title="API Documentation">
                                                    <Book size={16} />
                                                </a>
                                                {provider.billingUrl && (
                                                    <a href={provider.billingUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-violet-400 transition-colors" title="Billing">
                                                        <CreditCard size={16} />
                                                    </a>
                                                )}
                                            </div>
                                            <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:text-violet-300 hover:underline">
                                                Visit Website
                                            </a>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </Grid>
                    </div>
                ))}
            </div>
        </main>
    );
}
