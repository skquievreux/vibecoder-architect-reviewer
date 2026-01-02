"use client";

import { Card, Title, Text, Badge, Button } from "@tremor/react";
import { useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

type StrategyItem = {
    id: string;
    name: string;
    description: string;
    businessValue: number;
    technicalHealth: number;
    quadrant: string;
    metrics: {
        revenueStreams: number;
        vulnerabilities: number;
        outdatedDeps: number;
    };
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl">
                <p className="font-bold text-white mb-1">{data.name}</p>
                <p className="text-xs text-slate-400">Value: <span className="text-violet-400">{data.businessValue}</span></p>
                <p className="text-xs text-slate-400">Health: <span className={data.technicalHealth < 50 ? "text-red-400" : "text-emerald-400"}>{data.technicalHealth}</span></p>
                <Badge size="xs" className="mt-2" color={
                    data.quadrant === "Star" ? "emerald" :
                        data.quadrant === "Critical Risk" ? "red" :
                            data.quadrant === "Cash Cow" ? "blue" : "slate"
                }>{data.quadrant}</Badge>
            </div>
        );
    }
    return null;
};

export default function StrategyReportPage() {
    const [data, setData] = useState<StrategyItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/portfolio/strategy')
            .then(res => res.json())
            .then(res => {
                setData(res.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const criticalRisks = data.filter(item => item.quadrant === "Critical Risk");

    return (
        <main className="p-6 bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/portfolio" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <Title className="text-3xl font-bold text-white">Strategic Alignment Matrix</Title>
                        <Text className="text-slate-400">Balancing Business Value vs. Technical Health</Text>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Section */}
                    <Card className="glass-card lg:col-span-2 min-h-[500px] flex flex-col">
                        <Title className="mb-4 text-slate-200">Portfolio Matrix</Title>
                        <div className="flex-1 w-full h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis
                                        type="number"
                                        dataKey="technicalHealth"
                                        name="Technical Health"
                                        domain={[0, 100]}
                                        label={{ value: 'Technical Health (High is Good)', position: 'bottom', fill: '#94a3b8' }}
                                        stroke="#94a3b8"
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="businessValue"
                                        name="Business Value"
                                        domain={[0, 100]}
                                        label={{ value: 'Business Value', angle: -90, position: 'left', fill: '#94a3b8' }}
                                        stroke="#94a3b8"
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                                    {/* Quadrant Lines */}
                                    <ReferenceLine x={70} stroke="#64748b" strokeDasharray="3 3" />
                                    <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" />

                                    {/* Quadrant Labels */}
                                    <ReferenceLine x={85} y={90} stroke="none" label={{ value: "STARS", fill: '#10b981', fontSize: 12, fontWeight: 'bold' }} />
                                    <ReferenceLine x={35} y={90} stroke="none" label={{ value: "CRITICAL RISKS", fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                                    <ReferenceLine x={85} y={10} stroke="none" label={{ value: "CASH COWS", fill: '#3b82f6', fontSize: 12, fontWeight: 'bold' }} />
                                    <ReferenceLine x={35} y={10} stroke="none" label={{ value: "ZOMBIES", fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />

                                    <Scatter name="Repos" data={data} fill="#8b5cf6" shape="circle" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Actionable Insights */}
                    <Card className="glass-card border-l-4 border-l-red-500">
                        <div className="flex items-center gap-2 mb-4 text-red-400">
                            <AlertTriangle size={24} />
                            <Title className="text-white">Critical Risks</Title>
                        </div>
                        <Text className="text-slate-400 text-sm mb-4">
                            These repositories have <strong>High Business Value</strong> but <strong>Low Technical Health</strong>. They are ticking time bombs.
                        </Text>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {criticalRisks.length === 0 ? (
                                <div className="text-center py-10 text-emerald-500">
                                    No critical risks detected! 🎉
                                </div>
                            ) : (
                                criticalRisks.map(repo => (
                                    <div key={repo.id} className="bg-slate-900/50 p-3 rounded border border-red-500/30 hover:border-red-500 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-200 text-sm">{repo.name}</h4>
                                            <Badge size="xs" color="red">Score: {repo.technicalHealth}</Badge>
                                        </div>
                                        <div className="text-xs text-slate-500 space-y-1">
                                            <p>• {repo.metrics.vulnerabilities} Vulnerabilities</p>
                                            <p>• {repo.metrics.outdatedDeps} Outdated Deps</p>
                                            <p>• {repo.metrics.revenueStreams} Revenue Streams at risk</p>
                                        </div>
                                        <div className="mt-3">
                                            <Link href={`/report/portfolio?repoId=${repo.id}`}>
                                                <Button size="xs" variant="secondary" className="w-full">
                                                    View Canvas
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}
