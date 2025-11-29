"use client";

import { Card, Title, Text, Badge, Grid } from "@tremor/react";
import { useState, useEffect } from "react";
import { ArrowLeft, Terminal, Play, FileText, AlertTriangle, CheckCircle, XCircle, Database, Code, Activity, Sparkles, Globe } from "lucide-react";
import Link from "next/link";

type Log = {
    id: string;
    status: string;
    message: string;
    details: string;
    createdAt: string;
};

const scripts = [
    { id: 'standardize-node', name: 'Standardize Node.js', description: 'Enforce Node v20.9.0+ and .nvmrc' },
    { id: 'standardize-ts', name: 'Standardize TypeScript', description: 'Enforce TypeScript v5.8.2' },
    { id: 'standardize-supabase', name: 'Standardize Supabase', description: 'Enforce Supabase v2.49.4' },
    { id: 'analyze-next-migration', name: 'Analyze Next.js Migration', description: 'Check for v16 breaking changes' },
    { id: 'analyze-react-upgrade', name: 'Analyze React Upgrade', description: 'Identify React 18.x vs 19.2 candidates' },
    { id: 'audit-ecosystem', name: 'Audit Ecosystem', description: 'Check all repos for compliance' },
];

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function MaintenanceContent() {
    const searchParams = useSearchParams();
    const [logs, setLogs] = useState<Log[]>([]);
    const [status, setStatus] = useState<Record<string, string>>({});
    const [running, setRunning] = useState<string | null>(null);
    const [output, setOutput] = useState<string>("");
    const [csvUrl, setCsvUrl] = useState<string | null>(null);
    const [targetDir, setTargetDir] = useState("../");
    const [reportData, setReportData] = useState<any[] | null>(null);
    const [showReport, setShowReport] = useState(false);

    useEffect(() => {
        fetchLogs();
        if (searchParams.get('view') === 'audit') {
            viewReport();
        }
    }, [searchParams]);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/logs');
            const data = await res.json();
            if (data.logs) setLogs(data.logs);
        } catch (e) {
            console.error("Failed to fetch logs");
        }
    };

    const runScript = async (scriptId: string) => {
        setStatus(prev => ({ ...prev, [scriptId]: 'running' }));
        setOutput("Running...");
        setCsvUrl(null); // Reset download link

        try {
            const res = await fetch('/api/scripts/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script: scriptId })
            });
            const data = await res.json();

            if (data.output) {
                setOutput(data.output);
            }

            if (data.csvUrl) {
                setCsvUrl(data.csvUrl);
            }

            if (data.success) {
                setStatus(prev => ({ ...prev, [scriptId]: 'success' }));
            } else {
                setStatus(prev => ({ ...prev, [scriptId]: 'error' }));
            }
            fetchLogs(); // Refresh logs
        } catch (e) {
            setStatus(prev => ({ ...prev, [scriptId]: 'error' }));
            setOutput("Failed to execute script (Network Error)");
        }
    };

    const viewReport = async () => {
        setShowReport(true);
        setReportData(null); // Reset for loading state
        try {
            const res = await fetch('/api/github/audit');
            const data = await res.json();
            if (data.results) {
                setReportData(data.results);
            } else {
                console.log("No results found");
            }
        } catch (e) {
            console.error("Failed to fetch report");
        }
    };

    return (
        <main className="p-10 bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <Title className="text-3xl font-bold text-white">System Maintenance</Title>
                        <Text className="text-slate-400">Run standardization scripts and view system logs.</Text>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Scripts Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="glass-card">
                            <div className="flex justify-between items-center mb-4">
                                <Title className="text-white">Standardization Scripts</Title>
                                <button
                                    onClick={viewReport}
                                    className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1"
                                >
                                    <Activity size={14} /> View Live Status (GitHub)
                                </button>
                            </div>
                            <div className="space-y-4">
                                {scripts.map((script) => (
                                    <div key={script.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-violet-500 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-800 text-violet-400">
                                                <Terminal size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-200">{script.name}</div>
                                                <div className="text-xs text-slate-500">{script.description}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {status[script.id] === 'running' && <Badge color="amber">Running...</Badge>}
                                            {status[script.id] === 'success' && <Badge color="emerald">Success</Badge>}
                                            {status[script.id] === 'error' && <Badge color="rose">Error</Badge>}
                                            <button
                                                onClick={() => runScript(script.id)}
                                                disabled={status[script.id] === 'running'}
                                                className="px-3 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                                            >
                                                Run
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {showReport && (
                            <div className="mb-6 p-4 glass-card overflow-x-auto">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-200">Live Ecosystem Status (GitHub)</h3>
                                        <Badge size="xs" color="emerald" className="animate-pulse">Live</Badge>
                                    </div>
                                    <button onClick={() => setShowReport(false)} className="text-slate-400 hover:text-white"><XCircle size={18} /></button>
                                </div>
                                {reportData ? (
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-slate-700">
                                                <th className="py-2 px-2 font-semibold text-slate-400">Repository</th>
                                                <th className="py-2 px-2 font-semibold text-slate-400">Node.js</th>
                                                <th className="py-2 px-2 font-semibold text-slate-400">TypeScript</th>
                                                <th className="py-2 px-2 font-semibold text-slate-400">Supabase</th>
                                                <th className="py-2 px-2 font-semibold text-slate-400">Build</th>
                                                <th className="py-2 px-2 font-semibold text-slate-400">Docs</th>
                                                <th className="py-2 px-2 font-semibold text-slate-400">Ver</th>
                                                <th className="py-2 px-2 font-semibold text-slate-400">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.map((row: any, i) => {
                                                const isStandard =
                                                    (row.node === '>=20.9.0' || row.node === '20') &&
                                                    (row.ts === '^5.8.2') &&
                                                    (row.supabase === '^2.49.4');

                                                if (row.status === 'NO_PKG') return null;

                                                return (
                                                    <tr key={i} className="border-b border-slate-800 hover:bg-slate-800 transition-colors">
                                                        <td className="py-2 px-2 font-medium text-violet-400">
                                                            <a href={row.url} target="_blank" rel="noreferrer" className="hover:underline">{row.repo}</a>
                                                        </td>
                                                        <td className={`py-2 px-2 font-mono text-xs ${row.node?.includes('20') ? 'text-emerald-400' : 'text-rose-400'}`}>{row.node}</td>
                                                        <td className={`py-2 px-2 font-mono text-xs ${row.ts === '^5.8.2' ? 'text-emerald-400' : 'text-amber-400'}`}>{row.ts}</td>
                                                        <td className={`py-2 px-2 font-mono text-xs ${row.supabase === '^2.49.4' ? 'text-emerald-400' : 'text-amber-400'}`}>{row.supabase}</td>
                                                        <td className="py-2 px-2">
                                                            {row.build === 'success' ? <Badge size="xs" color="emerald">Pass</Badge> :
                                                                row.build === 'failure' ? <Badge size="xs" color="rose">Fail</Badge> :
                                                                    <Badge size="xs" color="slate">-</Badge>}
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            <div className="flex gap-1">
                                                                {row.docs?.readme === 'OK' ?
                                                                    <Badge size="xs" color="cyan" title="README OK">Doc</Badge> :
                                                                    <Badge size="xs" color="rose" title="README Missing/Short">No Doc</Badge>
                                                                }
                                                                {row.docs?.lang && row.docs.lang !== 'UNKNOWN' && (
                                                                    <Badge size="xs" color="slate">{row.docs.lang}</Badge>
                                                                )}
                                                                {row.docs?.changelog === 'OK' && (
                                                                    <Badge size="xs" color="violet" title="Changelog exists">Log</Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-2 font-mono text-xs text-slate-400">
                                                            {row.version !== 'NONE' ? row.version : <span className="text-slate-600">-</span>}
                                                        </td>
                                                        <td className="py-2 px-2">
                                                            {isStandard ? <Badge size="xs" color="emerald">OK</Badge> : <Badge size="xs" color="amber">Fix</Badge>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-10 text-slate-500">Loading live data from GitHub...</div>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => runScript('standardize-ts.js')}
                                disabled={!!running}
                                className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
                            >
                                <Code size={24} className="mb-2 text-violet-500" />
                                <span className="font-medium text-slate-900">Fix TypeScript</span>
                                <span className="text-xs text-slate-500 mt-1">Set v5.8.2</span>
                            </button>
                            <button
                                onClick={() => runScript('standardize-supabase')}
                                disabled={!!running}
                                className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
                            >
                                <Database size={24} className="mb-2 text-emerald-500" />
                                <span className="font-medium text-slate-900">Fix Supabase</span>
                                <span className="text-xs text-slate-500 mt-1">Set v2.49.4</span>
                            </button>
                            <button
                                onClick={() => runScript('upgrade-react')}
                                disabled={!!running}
                                className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center col-span-2 md:col-span-1"
                            >
                                <Sparkles size={24} className="mb-2 text-blue-500" />
                                <span className="font-medium text-slate-900">Upgrade Tier 2</span>
                                <span className="text-xs text-slate-500 mt-1">React 19.2 (Safe)</span>
                            </button>
                            <button
                                onClick={() => runScript('sync-vercel-domains')}
                                disabled={!!running}
                                className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center col-span-2 md:col-span-1"
                            >
                                <Globe size={24} className="mb-2 text-violet-500" />
                                <span className="font-medium text-slate-900">Sync Domains</span>
                                <span className="text-xs text-slate-500 mt-1">Vercel &rarr; DB</span>
                            </button>
                        </div>
                    </div>

                    {/* Console Output */}
                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-sm min-h-[300px] max-h-[500px] overflow-y-auto shadow-inner">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2 text-violet-400 font-bold">
                                <Terminal size={14} />
                                <span>Console Output</span>
                            </div>
                            {csvUrl && (
                                <a
                                    href={csvUrl}
                                    download="ecosystem-audit.csv"
                                    className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-900 border border-emerald-500 rounded hover:bg-emerald-900 transition-colors"
                                >
                                    <FileText size={12} />
                                    Download Report (CSV)
                                </a>
                            )}
                        </div>
                        <pre className="whitespace-pre-wrap text-slate-300">{output || "Ready..."}</pre>
                    </div>
                </div>

                {/* Logs Sidebar */}
                <Card className="h-fit max-h-[80vh] overflow-y-auto glass-card">
                    <Title className="mb-4 text-white">System Logs</Title>
                    <div className="space-y-3">
                        {logs.length === 0 ? (
                            <Text className="italic text-slate-500">No logs found.</Text>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge size="xs" color={log.status === 'SUCCESS' ? 'emerald' : log.status === 'ERROR' ? 'rose' : 'blue'}>
                                            {log.status}
                                        </Badge>
                                        <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="font-medium text-slate-200">{log.message}</div>
                                    {log.details && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-violet-400 cursor-pointer hover:text-violet-300 transition-colors">View Details</summary>
                                            <pre className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 overflow-x-auto">
                                                {log.details}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </main>
    );
}

export default function MaintenancePage() {
    return (
        <main className="p-10 bg-slate-50 min-h-screen">
            <Suspense fallback={<div>Loading...</div>}>
                <MaintenanceContent />
            </Suspense>
        </main>
    );
}
