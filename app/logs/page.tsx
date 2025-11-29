"use client";

import { Card, Title, Text, Badge, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Select, SelectItem } from "@tremor/react";
import { useState, useEffect, Fragment } from "react";
import { ArrowLeft, CheckCircle, XCircle, Info, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type SyncLog = {
    id: string;
    status: string;
    message: string;
    details: string | null;
    createdAt: string;
};

export default function LogsPage() {
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    const fetchLogs = () => {
        setLoading(true);
        fetch(`/api/logs?page=${page}&limit=20&status=${filterStatus}`)
            .then(res => res.json())
            .then(data => {
                if (data.error || !data.logs) {
                    console.error("API Error:", data.error);
                    setLogs([]);
                    setTotalPages(1);
                } else {
                    setLogs(data.logs);
                    setTotalPages(data.pagination?.totalPages || 1);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchLogs();
    }, [page, filterStatus]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <Badge color="green" icon={CheckCircle}>Success</Badge>;
            case 'ERROR': return <Badge color="red" icon={XCircle}>Error</Badge>;
            default: return <Badge color="blue" icon={Info}>Info</Badge>;
        }
    };

    return (
        <main className="p-10 bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <Title className="text-3xl font-bold text-white">Sync Logs</Title>
                            <Text className="text-slate-400">History of data synchronization events.</Text>
                        </div>
                    </div>
                    <div className="w-48">
                        <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setPage(1); }}>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="SUCCESS">Success</SelectItem>
                            <SelectItem value="ERROR">Error</SelectItem>
                            <SelectItem value="INFO">Info</SelectItem>
                        </Select>
                    </div>
                </div>

                <Card className="glass-card">
                    {loading ? (
                        <div className="p-10 text-center text-slate-400">Loading logs...</div>
                    ) : (
                        <>
                            <Table>
                                <TableHead>
                                    <TableRow className="border-b border-slate-800">
                                        <TableHeaderCell className="text-slate-400">Time</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-400">Status</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-400">Message</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-400">Details</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                                                No logs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <Fragment key={log.id}>
                                                <TableRow className="hover:bg-slate-800/30 cursor-pointer transition-colors border-b border-slate-800/50" onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                                                    <TableCell className="text-slate-300">{new Date(log.createdAt).toLocaleString()}</TableCell>
                                                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                                                    <TableCell className="text-slate-300">{log.message}</TableCell>
                                                    <TableCell>
                                                        {log.details ? (
                                                            <span className="text-violet-400 text-xs underline hover:text-violet-300">
                                                                {expandedLog === log.id ? "Hide" : "Show"} Details
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-500 text-xs">None</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                                {expandedLog === log.id && log.details && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="bg-slate-900/50 p-4 border-b border-slate-800">
                                                            <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-950 text-slate-400 p-4 rounded-lg overflow-x-auto max-h-96 border border-slate-800">
                                                                {log.details}
                                                            </pre>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
                                <Text className="text-slate-400">Page {page} of {totalPages}</Text>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2 border border-slate-700 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2 border border-slate-700 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </main>
    );
}
