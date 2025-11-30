"use client";

import { Card, Title, Text, Button, Badge } from "@tremor/react";
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Report = {
    id: string;
    content: string;
    createdAt: string;
};

export default function ReportPage() {
    const [activeTab, setActiveTab] = useState<'report' | 'progress'>('report');
    const [healthData, setHealthData] = useState<any[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [currentReport, setCurrentReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchReports();
        fetchHealthData();
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

    const fetchHealthData = async () => {
        try {
            const res = await fetch('/api/analytics/health');
            const data = await res.json();
            if (data.snapshots) {
                setHealthData(data.snapshots.map((s: any) => ({
                    date: new Date(s.date).toLocaleDateString(),
                    Score: s.healthScore,
                    Issues: s.outdatedDependenciesCount
                })));
            }
        } catch (error) {
            console.error("Failed to fetch health data", error);
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
                fetchHealthData(); // Refresh charts
            } else {
                alert("Failed to generate report: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            alert("Failed to generate report");
        } finally {
            setGenerating(false);
        }
    };

    const downloadPDF = async () => {
        if (!currentReport) return;

        try {
            // Dynamically import ReactDOMServer to avoid server-side issues in client component
            const ReactDOMServer = (await import('react-dom/server')).default;

            // Render Markdown to plain HTML (no Tailwind classes)
            const plainHtml = ReactDOMServer.renderToStaticMarkup(
                <div style={{ fontFamily: 'system-ui, sans-serif' }}>
                    <div style={{ marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
                        <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: 0 }}>Architecture Analysis</h1>
                        <p style={{ fontSize: '12pt', color: '#666', marginTop: '10px' }}>
                            Generated on {new Date(currentReport.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => <h1>{children}</h1>,
                            h2: ({ children }) => <h2>{children}</h2>,
                            h3: ({ children }) => <h3>{children}</h3>,
                            p: ({ children }) => <p>{children}</p>,
                            ul: ({ children }) => <ul>{children}</ul>,
                            ol: ({ children }) => <ol>{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                            blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                            code: ({ children }) => <code>{children}</code>,
                            pre: ({ children }) => <pre>{children}</pre>,
                            // Strip all classes
                        }}
                    >
                        {currentReport.content}
                    </ReactMarkdown>
                </div>
            );

            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    htmlContent: plainHtml
                }),
            });

            if (!response.ok) throw new Error('PDF generation failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `architecture-report-${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF Export failed", error);
            alert("PDF Export failed");
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
                    <div className="flex gap-3">
                        <div className="bg-slate-900 p-1 rounded-lg flex border border-slate-800">
                            <button
                                onClick={() => setActiveTab('report')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'report' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Report
                            </button>
                            <button
                                onClick={() => setActiveTab('progress')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'progress' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Progress
                            </button>
                        </div>
                        <button
                            onClick={generateReport}
                            disabled={generating}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 active:bg-violet-800 transition-all shadow-[0_0_15px_rgba(124,58,237,0.5)] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles size={18} />
                            {generating ? "Analysiere..." : "Neu generieren"}
                        </button>
                    </div>
                </div>

                {activeTab === 'report' ? (
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
                        <Card className="md:col-span-3 min-h-[60vh] glass-card relative">
                            {currentReport ? (
                                <>
                                    <div className="absolute top-6 right-6">
                                        <Button size="xs" variant="secondary" onClick={downloadPDF}>
                                            Download PDF
                                        </Button>
                                    </div>
                                    <div id="report-content" className="prose prose-invert max-w-none p-4 bg-slate-950/50 rounded-lg">
                                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                                            <div>
                                                <h2 className="text-2xl font-bold m-0 text-white">Architecture Analysis</h2>
                                                <span className="text-sm text-slate-400">Generated on {new Date(currentReport.createdAt).toLocaleString()}</span>
                                            </div>
                                            <Badge color="violet" icon={Sparkles}>AI Generated</Badge>
                                        </div>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
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
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
                                    <Sparkles size={48} className="mb-4 opacity-20" />
                                    <Text className="text-slate-400">Select a report from history or generate a new one.</Text>
                                </div>
                            )}
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="glass-card">
                            <Title className="text-white mb-4">System Health Score Trend</Title>
                            {/* @ts-ignore */}
                            <div className="h-72 w-full bg-slate-900/50 rounded-lg flex items-center justify-center text-slate-500">
                                {healthData.length > 0 ? (
                                    <iframe
                                        srcDoc={`
                                            <html>
                                            <head>
                                                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                                            </head>
                                            <body style="background-color: transparent; margin: 0;">
                                                <canvas id="myChart"></canvas>
                                                <script>
                                                    const ctx = document.getElementById('myChart');
                                                    new Chart(ctx, {
                                                        type: 'line',
                                                        data: {
                                                            labels: ${JSON.stringify(healthData.map(d => d.date))},
                                                            datasets: [{
                                                                label: 'Health Score',
                                                                data: ${JSON.stringify(healthData.map(d => d.Score))},
                                                                borderColor: '#8b5cf6',
                                                                tension: 0.4
                                                            }]
                                                        },
                                                        options: {
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            scales: {
                                                                y: { beginAtZero: true, max: 100 }
                                                            }
                                                        }
                                                    });
                                                </script>
                                            </body>
                                            </html>
                                        `}
                                        className="w-full h-full border-none"
                                    />
                                ) : (
                                    <Text>No data available yet. Generate a report to create a snapshot.</Text>
                                )}
                            </div>
                        </Card>
                        <Card className="glass-card">
                            <Title className="text-white mb-4">Outdated Dependencies</Title>
                            {/* @ts-ignore */}
                            <div className="h-72 w-full bg-slate-900/50 rounded-lg flex items-center justify-center text-slate-500">
                                {healthData.length > 0 ? (
                                    <iframe
                                        srcDoc={`
                                            <html>
                                            <head>
                                                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                                            </head>
                                            <body style="background-color: transparent; margin: 0;">
                                                <canvas id="myChart"></canvas>
                                                <script>
                                                    const ctx = document.getElementById('myChart');
                                                    new Chart(ctx, {
                                                        type: 'bar',
                                                        data: {
                                                            labels: ${JSON.stringify(healthData.map(d => d.date))},
                                                            datasets: [{
                                                                label: 'Outdated Deps',
                                                                data: ${JSON.stringify(healthData.map(d => d.Issues))},
                                                                backgroundColor: '#ef4444'
                                                            }]
                                                        },
                                                        options: {
                                                            responsive: true,
                                                            maintainAspectRatio: false
                                                        }
                                                    });
                                                </script>
                                            </body>
                                            </html>
                                        `}
                                        className="w-full h-full border-none"
                                    />
                                ) : (
                                    <Text>No data available yet.</Text>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </main>
    );
}
