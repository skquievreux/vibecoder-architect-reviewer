"use client";

import { Card, Title, Text, Button, Badge } from "@tremor/react";
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Sparkles, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Report = {
    id: string;
    content: string;
    createdAt: string;
};

export default function ReportPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [currentReport, setCurrentReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/reports');
            const data = await res.json();
            if (data.reports) {
                setReports(data.reports);
                if (data.reports.length > 0 && !currentReport) {
                    setCurrentReport(data.reports[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/ai/generate', { method: 'POST' });
            const data = await res.json();
            if (data.report) {
                setReports([data.report, ...reports]);
                setCurrentReport(data.report);
            } else {
                alert("Failed to generate report: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            alert("Failed to generate report");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <main className="p-10 bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <Title className="text-3xl font-bold text-white">AI Architecture Report</Title>
                            <Text className="text-slate-400">Automated analysis and recommendations.</Text>
                        </div>
                    </div>
                    <button
                        onClick={generateReport}
                        disabled={generating}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 active:bg-violet-800 transition-all shadow-[0_0_15px_rgba(124,58,237,0.5)] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles size={18} />
                        {generating ? "Analysiere System..." : "Neuen Bericht generieren"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar: History */}
                    <Card className="md:col-span-1 h-fit max-h-[80vh] overflow-y-auto glass-card">
                        <Title className="mb-4 text-sm font-medium text-slate-400 uppercase">Report History</Title>
                        <div className="space-y-2">
                            {loading ? (
                                <Text className="text-slate-400">Loading history...</Text>
                            ) : reports.length === 0 ? (
                                <Text className="text-sm text-slate-500 italic">No reports yet.</Text>
                            ) : (
                                reports.map((report) => (
                                    <div
                                        key={report.id}
                                        onClick={() => setCurrentReport(report)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${currentReport?.id === report.id
                                            ? "bg-violet-900/30 border-violet-500/50"
                                            : "hover:bg-slate-800/50 border-transparent"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={14} className={currentReport?.id === report.id ? "text-violet-400" : "text-slate-500"} />
                                            <span className={`text-xs font-medium ${currentReport?.id === report.id ? "text-violet-300" : "text-slate-400"}`}>
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {new Date(report.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Main Content: Report View */}
                    <Card className="md:col-span-3 min-h-[60vh] glass-card">
                        {currentReport ? (
                            <div className="prose prose-invert max-w-none">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                                    <div>
                                        <h2 className="text-2xl font-bold m-0 text-white">Architecture Analysis</h2>
                                        <span className="text-sm text-slate-400">Generated on {new Date(currentReport.createdAt).toLocaleString()}</span>
                                    </div>
                                    <Badge color="violet" icon={Sparkles}>AI Generated</Badge>
                                </div>
                                <ReactMarkdown
                                    components={{
                                        a: ({ node, ...props }) => (
                                            <a
                                                {...props}
                                                className="text-violet-400 hover:text-violet-300 underline decoration-violet-500/30 hover:decoration-violet-400 transition-colors font-medium"
                                                target={props.href?.startsWith('/') ? "_self" : "_blank"}
                                                rel={props.href?.startsWith('/') ? "" : "noopener noreferrer"}
                                            />
                                        ),
                                        ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 space-y-1 text-slate-300" />,
                                        ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 space-y-1 text-slate-300" />,
                                        h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold mt-6 mb-4 text-white" />,
                                        h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-semibold mt-5 mb-3 text-slate-100" />,
                                        h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-medium mt-4 mb-2 text-slate-200" />,
                                        p: ({ node, ...props }) => <p {...props} className="text-slate-300 leading-relaxed mb-4" />,
                                        strong: ({ node, ...props }) => <strong {...props} className="text-white font-semibold" />,
                                        blockquote: ({ node, ...props }) => <blockquote {...props} className="border-l-4 border-violet-500/50 pl-4 italic text-slate-400 my-4" />,
                                        code: ({ node, ...props }) => <code {...props} className="bg-slate-800 text-violet-300 px-1 py-0.5 rounded text-sm font-mono" />,
                                    }}
                                >
                                    {currentReport.content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
                                <Sparkles size={48} className="mb-4 opacity-20" />
                                <Text className="text-slate-400">Select a report from history or generate a new one.</Text>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </main>
    );
}
