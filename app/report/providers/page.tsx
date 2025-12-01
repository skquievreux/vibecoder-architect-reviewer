'use client';

import { Card, Title, Text, Metric, Grid, DonutChart, BarList, Flex, Badge, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@tremor/react";
import { useState, useEffect } from "react";
import { Cloud, Server, Database, DollarSign, Box } from "lucide-react";

type Provider = {
    name: string;
    category: 'hosting' | 'service' | 'infrastructure' | 'other';
    usageCount: number;
    totalEstimatedCost: number;
    repos: { id: string; name: string; cost?: number }[];
    capabilities?: string[];
    tags?: string[];
    description?: string;
    pricingModel?: string;
};

const valueFormatter = (number: number) => `$${Intl.NumberFormat('us').format(number).toString()}`;

export default function ProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/portfolio/providers')
            .then(res => res.json())
            .then(data => {
                setProviders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 text-slate-400">Loading provider data...</div>;

    const [costBasis, setCostBasis] = useState<'monthly' | 'yearly'>('monthly');

    const multiplier = costBasis === 'yearly' ? 12 : 1;
    const totalCost = providers.reduce((acc, p) => acc + p.totalEstimatedCost, 0) * multiplier;
    const totalServices = providers.length;

    const topCostProviders = providers
        .filter(p => p.totalEstimatedCost > 0)
        .map(p => ({ ...p, totalEstimatedCost: p.totalEstimatedCost * multiplier }))
        .sort((a, b) => b.totalEstimatedCost - a.totalEstimatedCost)
        .slice(0, 5);

    const topUsageProviders = providers
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5);

    return (
        <main className="p-10 bg-slate-950 min-h-screen text-slate-100">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <Title className="text-3xl font-bold text-white flex items-center gap-3">
                        <Cloud className="text-violet-400" /> Service Catalog & Costs
                    </Title>
                    <Text className="text-slate-300 mt-2 text-lg">Overview of all external services, hosting providers, and infrastructure costs.</Text>
                </div>
                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setCostBasis('monthly')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${costBasis === 'monthly' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setCostBasis('yearly')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${costBasis === 'yearly' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mb-8">
                <Card className="bg-slate-900 border border-slate-700 ring-0 shadow-xl">
                    <Flex alignItems="start">
                        <div className="truncate">
                            <Text className="text-slate-300 font-medium">Total {costBasis === 'monthly' ? 'Monthly' : 'Yearly'} Cost (Est.)</Text>
                            <Metric className="text-emerald-400 text-4xl mt-2 font-bold">{valueFormatter(totalCost)}</Metric>
                        </div>
                        <DollarSign size={40} className="text-emerald-500/20" />
                    </Flex>
                </Card>
                <Card className="bg-slate-900 border border-slate-700 ring-0 shadow-xl">
                    <Flex alignItems="start">
                        <div className="truncate">
                            <Text className="text-slate-300 font-medium">Active Providers</Text>
                            <Metric className="text-blue-400 text-4xl mt-2 font-bold">{totalServices}</Metric>
                        </div>
                        <Server size={40} className="text-blue-500/20" />
                    </Flex>
                </Card>
                <Card className="bg-slate-900 border border-slate-700 ring-0 shadow-xl">
                    <Flex alignItems="start">
                        <div className="truncate">
                            <Text className="text-slate-300 font-medium">Most Used Provider</Text>
                            <Metric className="text-violet-400 text-4xl mt-2 font-bold">{topUsageProviders[0]?.name || '-'}</Metric>
                        </div>
                        <Box size={40} className="text-violet-500/20" />
                    </Flex>
                </Card>
            </Grid>

            <Grid numItems={1} numItemsLg={2} className="gap-6 mb-8">
                <Card className="bg-slate-900 border border-slate-700 ring-0 shadow-xl">
                    <Title className="text-white font-bold">Cost Distribution</Title>
                    <DonutChart
                        className="mt-6"
                        data={topCostProviders}
                        category="totalEstimatedCost"
                        index="name"
                        valueFormatter={valueFormatter}
                        colors={["violet", "indigo", "rose", "cyan", "amber"]}
                        variant="pie"
                    />
                </Card>
                <Card className="bg-slate-900 border border-slate-700 ring-0 shadow-xl">
                    <Title className="text-white font-bold">Top Providers by Usage</Title>
                    <Flex className="mt-4 border-b border-slate-700 pb-2">
                        <Text className="w-full text-slate-300 font-medium">Provider</Text>
                        <Text className="w-full text-right text-slate-300 font-medium">Repos</Text>
                    </Flex>
                    <BarList
                        data={topUsageProviders.map(p => ({ name: p.name, value: p.usageCount }))}
                        className="mt-2"
                        color="blue"
                    />
                </Card>
            </Grid>

            <Card className="bg-slate-900 border border-slate-700 ring-0 shadow-xl">
                <Title className="text-white mb-4 font-bold">Detailed Provider List</Title>
                <Table className="mt-5">
                    <TableHead>
                        <TableRow className="border-b border-slate-700">
                            <TableHeaderCell className="text-slate-300 font-semibold">Provider</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300 font-semibold">Category</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300 font-semibold">Usage</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300 font-semibold">Est. Cost ({costBasis === 'monthly' ? 'Mo' : 'Yr'})</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300 font-semibold">Repositories</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {providers.map((item) => (
                            <TableRow key={item.name} className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/50">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <Text className="font-bold text-white text-lg">{item.name}</Text>
                                        {item.description && (
                                            <Text className="text-sm text-slate-400 mt-1">{item.description}</Text>
                                        )}
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="flex gap-1 mt-2">
                                                {item.tags.map(tag => (
                                                    <Badge key={tag} size="xs" color="slate" className="capitalize opacity-90 bg-slate-800 text-slate-300 border border-slate-600">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <Badge size="xs" color={
                                            item.category === 'hosting' ? 'violet' :
                                                item.category === 'service' ? 'emerald' :
                                                    item.category === 'infrastructure' ? 'blue' : 'gray'
                                        }>
                                            {item.category}
                                        </Badge>
                                        {item.capabilities && item.capabilities.length > 0 && (
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {item.capabilities.slice(0, 3).map(cap => (
                                                    <span key={cap} className="text-[11px] bg-slate-950 text-slate-300 px-2 py-1 rounded border border-slate-700">
                                                        {cap}
                                                    </span>
                                                ))}
                                                {item.capabilities.length > 3 && (
                                                    <span className="text-[11px] text-slate-500">+{item.capabilities.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Text className="text-white font-medium">{item.usageCount} Repos</Text>
                                </TableCell>
                                <TableCell>
                                    <Text className="text-emerald-400 font-mono font-bold">
                                        {item.totalEstimatedCost > 0 ? valueFormatter(item.totalEstimatedCost * multiplier) : '-'}
                                    </Text>
                                    {item.pricingModel && (
                                        <Text className="text-xs text-slate-500 mt-1">{item.pricingModel}</Text>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {item.repos.slice(0, 3).map(r => (
                                            <Badge key={r.id} size="xs" color="slate" className="bg-slate-800 text-slate-300 border border-slate-700">{r.name}</Badge>
                                        ))}
                                        {item.repos.length > 3 && (
                                            <span className="text-xs text-slate-500">+{item.repos.length - 3} more</span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </main>
    );
}
