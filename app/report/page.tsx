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
        <main className="p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-slate-600" />
                        </Link>
                        <div>
                            <Title className="text-3xl font-bold text-slate-900">AI Architecture Report</Title>
                            <Text>Automated analysis and recommendations.</Text>
                        </div>
                    </div>
                    <Button
                        icon={Sparkles}
                        loading={generating}
                        onClick={generateReport}
                        color="violet"
                    >
                        {generating ? "Analyzing System..." : "Generate New Report"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar: History */}
                    <Card className="md:col-span-1 h-fit max-h-[80vh] overflow-y-auto">
                        <Title className="mb-4 text-sm font-medium text-slate-500 uppercase">Report History</Title>
                        <div className="space-y-2">
                            {loading ? (
                                <Text>Loading history...</Text>
                            ) : reports.length === 0 ? (
                                <Text className="text-sm text-slate-400 italic">No reports yet.</Text>
                            ) : (
                                reports.map((report) => (
                                    <div
                                        key={report.id}
                                        onClick={() => setCurrentReport(report)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${currentReport?.id === report.id
                                                ? "bg-violet-50 border-violet-200"
                                                : "hover:bg-slate-50 border-transparent"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={14} className={currentReport?.id === report.id ? "text-violet-600" : "text-slate-400"} />
                                            <span className={`text-xs font-medium ${currentReport?.id === report.id ? "text-violet-700" : "text-slate-600"}`}>
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            {new Date(report.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Main Content: Report View */}
                    <Card className="md:col-span-3 min-h-[60vh]">
                        {currentReport ? (
                            <div className="prose prose-slate max-w-none">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                    <div>
                                        <h2 className="text-2xl font-bold m-0 text-slate-900">Architecture Analysis</h2>
                                        <span className="text-sm text-slate-500">Generated on {new Date(currentReport.createdAt).toLocaleString()}</span>
                                    </div>
                                    <Badge color="violet" icon={Sparkles}>AI Generated</Badge>
                                </div>
                                <ReactMarkdown>{currentReport.content}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                                <Sparkles size={48} className="mb-4 opacity-20" />
                                <Text>Select a report from history or generate a new one.</Text>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </main>
    );
}
