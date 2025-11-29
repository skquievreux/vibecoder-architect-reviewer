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
        <main className="p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-slate-600" />
                        </Link>
                        <div>
                            <Title className="text-3xl font-bold text-slate-900">Sync Logs</Title>
                            <Text>History of data synchronization events.</Text>
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

                <Card>
                    {loading ? (
                        <div className="p-10 text-center text-slate-500">Loading logs...</div>
                    ) : (
                        <>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>Time</TableHeaderCell>
                                        <TableHeaderCell>Status</TableHeaderCell>
                                        <TableHeaderCell>Message</TableHeaderCell>
                                        <TableHeaderCell>Details</TableHeaderCell>
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
                                                <TableRow className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                                                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                                                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                                                    <TableCell>{log.message}</TableCell>
                                                    <TableCell>
                                                        {log.details ? (
                                                            <span className="text-blue-600 text-xs underline">
                                                                {expandedLog === log.id ? "Hide" : "Show"} Details
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">None</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                                {expandedLog === log.id && log.details && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="bg-slate-50 p-4">
                                                            <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto max-h-96">
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
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                                <Text>Page {page} of {totalPages}</Text>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
