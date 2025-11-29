"use client";

import { Card, Title, Text, Badge, Grid } from "@tremor/react";
import { useState, useEffect } from "react";
import { ArrowLeft, Terminal, Play, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

type Log = {
    id: string;
    status: string;
    message: string;
    details: string;
    createdAt: string;
};

export default function MaintenancePage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [running, setRunning] = useState<string | null>(null);
    const [output, setOutput] = useState<string>("");
    const [targetDir, setTargetDir] = useState("../");

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/logs');
            const data = await res.json();
            if (data.logs) setLogs(data.logs);
        } catch (e) {
            console.error("Failed to fetch logs");
        }
    };

    const runScript = async (script: string) => {
        setRunning(script);
        setOutput(`Running ${script}...\n`);
        try {
            const res = await fetch('/api/scripts/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script, target: targetDir })
            });
            const data = await res.json();
            setOutput(prev => prev + (data.output || "No output") + "\n\nDone.");
            fetchLogs(); // Refresh logs
        } catch (e) {
            setOutput(prev => prev + "\nError executing script.");
        } finally {
            setRunning(null);
        }
    };

    const [reportData, setReportData] = useState<string[][] | null>(null);
    const [showReport, setShowReport] = useState(false);

    const viewReport = async () => {
        try {
            const res = await fetch('/api/files/content?file=ecosystem-audit.csv');
            const data = await res.json();
            if (data.content) {
                const rows = data.content.trim().split('\n').map((row: string) => row.split(','));
                setReportData(rows);
                setShowReport(true);
            } else {
                alert("Report not found. Run the audit first.");
            }
        } catch (e) {
            console.error("Failed to fetch report");
        }
    };

    return (
        <main className="p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </Link>
                    <div>
                        <Title className="text-3xl font-bold text-slate-900">System Maintenance</Title>
                        <Text>Run standardization scripts and view system logs.</Text>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Script Runner */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <Title>Standardization Scripts</Title>
                                <button
                                    onClick={viewReport}
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <FileText size={14} /> View Last Audit Report
                                </button>
                            </div>

                            {showReport && reportData && (
                                <div className="mb-6 p-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-slate-700">Ecosystem Audit Report</h3>
                                        <button onClick={() => setShowReport(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={18} /></button>
                                    </div>
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                {reportData[0].map((header, i) => (
                                                    <th key={i} className="py-2 px-2 font-semibold text-slate-600">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.slice(1).map((row, i) => (
                                                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                                    {row.map((cell, j) => (
                                                        <td key={j} className="py-2 px-2 text-slate-700 font-mono text-xs">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Target Directory</label>
                                <input
                                    type="text"
                                    value={targetDir}
                                    onChange={e => setTargetDir(e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-lg font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500 mt-1">Relative to dashboard root (default: ../)</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    onClick={() => runScript('audit')}
                                    disabled={!!running}
                                    className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
                                >
                                    <FileText size={24} className="mb-2 text-blue-500" />
                                    <span className="font-medium text-slate-900">Audit Ecosystem</span>
                                    <span className="text-xs text-slate-500 mt-1">Check versions</span>
                                </button>
                                <button
                                    onClick={() => runScript('standardize-node')}
                                    disabled={!!running}
                                    className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
                                >
                                    <Terminal size={24} className="mb-2 text-green-500" />
                                    <span className="font-medium text-slate-900">Fix Node.js</span>
                                    <span className="text-xs text-slate-500 mt-1">Set engines & .nvmrc</span>
                                </button>
                                <button
                                    onClick={() => runScript('standardize-ts')}
                                    disabled={!!running}
                                    className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
                                >
                                    <Code size={24} className="mb-2 text-violet-500" />
                                    <span className="font-medium text-slate-900">Fix TypeScript</span>
                                    <span className="text-xs text-slate-500 mt-1">Set v5.3.0</span>
                                </button>
                            </div>
                        </Card>

                        <Card className="bg-slate-900 text-slate-200 font-mono text-sm min-h-[300px] max-h-[500px] overflow-y-auto">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700 text-slate-400">
                                <Terminal size={14} />
                                <span>Console Output</span>
                            </div>
                            <pre className="whitespace-pre-wrap">{output || "Ready..."}</pre>
                        </Card>
                    </div>

                    {/* Logs Sidebar */}
                    <Card className="h-fit max-h-[80vh] overflow-y-auto">
                        <Title className="mb-4">System Logs</Title>
                        <div className="space-y-3">
                            {logs.length === 0 ? (
                                <Text className="italic text-slate-400">No logs found.</Text>
                            ) : (
                                logs.map(log => (
                                    <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <Badge size="xs" color={log.status === 'SUCCESS' ? 'green' : log.status === 'ERROR' ? 'red' : 'blue'}>
                                                {log.status}
                                            </Badge>
                                            <span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="font-medium text-slate-800">{log.message}</div>
                                        {log.details && (
                                            <details className="mt-1">
                                                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">View Details</summary>
                                                <pre className="mt-1 p-2 bg-white border border-slate-200 rounded text-xs overflow-x-auto">
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
            </div>
        </main>
    );
}

function Code({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    );
}
