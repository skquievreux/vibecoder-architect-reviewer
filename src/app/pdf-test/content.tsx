"use client";

import { Card, Title, Text, Button } from "@tremor/react";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import html2canvas from "html2canvas";

export default function PDFTestContent() {
    const [generating, setGenerating] = useState<string | null>(null);

    // Helper to ensure html2canvas is available for jsPDF
    const prepareJsPDF = async () => {
        const jsPDF = (await import('jspdf')).default;
        return jsPDF;
    };

    // STRATEGY A: "Print-Ready CSS (MM)"
    // Uses MM units directly in CSS to match A4 dimensions.
    const downloadStrategyA = async () => {
        setGenerating('A');
        try {
            const jsPDF = await prepareJsPDF();
            const originalElement = document.getElementById('test-content');
            if (!originalElement) return;

            const container = document.createElement('div');
            // A4 width is 210mm. Margins 15mm left/right. Content = 180mm.
            container.style.width = '180mm';
            container.style.backgroundColor = '#ffffff';
            container.style.padding = '10mm';
            container.style.boxSizing = 'border-box';
            // Ensure it's rendered but not visible to user
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.zIndex = '-1000';
            // container.style.visibility = 'hidden'; // html2canvas might skip hidden elements

            // Clone and style
            let contentHtml = originalElement.innerHTML;
            contentHtml = contentHtml
                .replace(/text-white/g, 'text-black')
                .replace(/text-slate-[0-9]+/g, 'text-black')
                .replace(/bg-slate-[0-9]+/g, 'bg-white')
                .replace(/border-slate-[0-9]+/g, 'border-gray-300');

            container.innerHTML = `
                <style>
                    body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #000; }
                    h1 { font-size: 24pt; font-weight: bold; margin: 20pt 0 10pt 0; }
                    h2 { font-size: 18pt; font-weight: bold; margin: 15pt 0 8pt 0; }
                    p { margin-bottom: 10pt; text-align: justify; }
                    table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 10pt; }
                    th, td { border: 1px solid #ccc; padding: 5pt; text-align: left; }
                    pre { background: #f5f5f5; padding: 10pt; border-radius: 4px; font-family: monospace; font-size: 9pt; white-space: pre-wrap; }
                </style>
                <div>${contentHtml}</div>
            `;

            document.body.appendChild(container);

            // Give browser a moment to render styles
            await new Promise(resolve => setTimeout(resolve, 100));

            const pdf = new jsPDF('p', 'mm', 'a4');

            await pdf.html(container, {
                callback: function (doc) {
                    doc.save('strategy-a-mm.pdf');
                    document.body.removeChild(container);
                    setGenerating(null);
                },
                x: 15,
                y: 15,
                width: 180, // Target width in mm
                windowWidth: 800, // Dummy window width, critical for some calculations
                autoPaging: 'text',
                html2canvas: {
                    scale: 1,
                    useCORS: true,
                    logging: true
                }
            });
        } catch (err) {
            console.error(err);
            setGenerating(null);
        }
    };

    // STRATEGY B: "Pixel Perfect (96 DPI)"
    // Uses standard pixels assuming 96 DPI mapping to A4.
    const downloadStrategyB = async () => {
        setGenerating('B');
        try {
            const jsPDF = await prepareJsPDF();
            const originalElement = document.getElementById('test-content');
            if (!originalElement) return;

            const container = document.createElement('div');
            // A4 @ 96 DPI is ~794px width.
            // Content width (minus margins) ~ 700px.
            container.style.width = '700px';
            container.style.backgroundColor = '#ffffff';
            container.style.padding = '40px';
            container.style.boxSizing = 'border-box';

            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.zIndex = '-1000';

            let contentHtml = originalElement.innerHTML;
            contentHtml = contentHtml
                .replace(/text-white/g, 'text-black')
                .replace(/text-slate-[0-9]+/g, 'text-black')
                .replace(/bg-slate-[0-9]+/g, 'bg-white')
                .replace(/border-slate-[0-9]+/g, 'border-gray-300');

            container.innerHTML = `
                <style>
                    body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #000; }
                    h1 { font-size: 32px; font-weight: bold; margin-bottom: 20px; }
                    h2 { font-size: 24px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; }
                    p { margin-bottom: 15px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    pre { background: #f5f5f5; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
                </style>
                <div>${contentHtml}</div>
            `;

            document.body.appendChild(container);
            await new Promise(resolve => setTimeout(resolve, 100));

            const pdf = new jsPDF('p', 'pt', 'a4'); // Use pt for PDF coords
            // 1px = 0.75pt

            await pdf.html(container, {
                callback: function (doc) {
                    doc.save('strategy-b-pixels.pdf');
                    document.body.removeChild(container);
                    setGenerating(null);
                },
                x: 40,
                y: 40,
                html2canvas: {
                    scale: 0.75, // Scale px to pt (96dpi to 72dpi)
                    useCORS: true
                },
                autoPaging: 'text'
            });
        } catch (err) {
            console.error(err);
            setGenerating(null);
        }
    };

    // STRATEGY C: "High-Res Scale Down"
    // Renders at a large desktop width (1200px) and scales down to fit A4.
    const downloadStrategyC = async () => {
        setGenerating('C');
        try {
            const jsPDF = await prepareJsPDF();
            const originalElement = document.getElementById('test-content');
            if (!originalElement) return;

            const container = document.createElement('div');
            container.style.width = '1200px'; // Wide desktop view
            container.style.backgroundColor = '#ffffff';
            container.style.padding = '60px';
            container.style.boxSizing = 'border-box';

            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.zIndex = '-1000';

            let contentHtml = originalElement.innerHTML;
            contentHtml = contentHtml
                .replace(/text-white/g, 'text-black')
                .replace(/text-slate-[0-9]+/g, 'text-black')
                .replace(/bg-slate-[0-9]+/g, 'bg-white')
                .replace(/border-slate-[0-9]+/g, 'border-gray-300');

            container.innerHTML = `
                <style>
                    body { font-family: Arial, sans-serif; font-size: 24px; line-height: 1.6; color: #000; }
                    h1 { font-size: 48px; font-weight: bold; margin-bottom: 30px; }
                    h2 { font-size: 36px; font-weight: bold; margin-top: 40px; margin-bottom: 20px; }
                    p { margin-bottom: 24px; }
                    table { width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 20px; }
                    th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
                    pre { background: #f5f5f5; padding: 20px; border-radius: 4px; font-family: monospace; font-size: 18px; white-space: pre-wrap; }
                </style>
                <div>${contentHtml}</div>
            `;

            document.body.appendChild(container);
            await new Promise(resolve => setTimeout(resolve, 100));

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 190; // 210 - 20 margin

            await pdf.html(container, {
                callback: function (doc) {
                    const totalPages = doc.getNumberOfPages();
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();

                    for (let i = 1; i <= totalPages; i++) {
                        doc.setPage(i);

                        // Header
                        doc.setFontSize(10);
                        doc.setTextColor(100, 100, 100); // Grey
                        doc.text("Architecture Review Report", 10, 10);
                        doc.text(new Date().toLocaleDateString(), pageWidth - 10, 10, { align: 'right' });

                        // Footer
                        doc.setFontSize(9);
                        doc.setTextColor(100, 100, 100);
                        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

                        // Branding / Werbeblock
                        doc.setFontSize(8);
                        doc.setTextColor(128, 128, 128);
                        doc.text("Generated by VibeCoder - Your AI Architecture Companion", pageWidth / 2, pageHeight - 8, { align: 'center' });
                    }

                    doc.save('strategy-c-scaled.pdf');
                    document.body.removeChild(container);
                    setGenerating(null);
                },
                x: 10,
                y: 20, // Start lower to make room for header
                width: pdfWidth,
                windowWidth: 1200, // Tell jsPDF the source is 1200px wide
                autoPaging: 'text',
                margin: [20, 10, 20, 10], // Top, Right, Bottom, Left margins for auto-paging
                html2canvas: {
                    useCORS: true
                }
            });
        } catch (err) {
            console.error(err);
            setGenerating(null);
        }
    };

    return (
        <main className="p-10 bg-slate-950 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/report" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <Title className="text-3xl font-bold text-white">PDF Export Test Page</Title>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            onClick={downloadStrategyA}
                            disabled={!!generating}
                            icon={Download}
                            color="blue"
                        >
                            {generating === 'A' ? "Generating A..." : "Test A: MM Units"}
                        </Button>
                        <Button
                            onClick={downloadStrategyB}
                            disabled={!!generating}
                            icon={Download}
                            color="emerald"
                        >
                            {generating === 'B' ? "Generating B..." : "Test B: Pixels"}
                        </Button>
                        <Button
                            onClick={downloadStrategyC}
                            disabled={!!generating}
                            icon={Download}
                            color="amber"
                        >
                            {generating === 'C' ? "Generating C..." : "Test C: Scaled"}
                        </Button>
                    </div>
                    <p className="text-slate-400 text-sm">
                        Try each button to see which layout works best.
                        A = Print Units (180mm width), B = Pixel Perfect (700px width), C = High-Res Scaled (1200px width).
                    </p>
                </div>

                <Card className="glass-card bg-slate-900/50 border border-slate-800">
                    <div id="test-content" className="prose prose-invert max-w-none p-8">
                        <h1 className="text-white">Architecture Test Report</h1>
                        <p className="text-slate-300">This is a test document to verify the PDF export functionality, including pagination, headers, footers, and styling.</p>

                        <h2 className="text-white mt-8">1. Text Flow and Pagination</h2>
                        <p className="text-slate-300">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                        <p className="text-slate-300 mt-4">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam,
                            eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
                            qui ratione voluptatem sequi nesciunt.
                        </p>

                        <h2 className="text-white mt-8">2. Table Rendering</h2>
                        <div className="overflow-x-auto my-6">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-800">
                                        <th className="p-3 border border-slate-700 text-white">Component</th>
                                        <th className="p-3 border border-slate-700 text-white">Status</th>
                                        <th className="p-3 border border-slate-700 text-white">Latency</th>
                                        <th className="p-3 border border-slate-700 text-white">Uptime</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(15)].map((_, i) => (
                                        <tr key={i} className="border-b border-slate-800">
                                            <td className="p-3 border border-slate-800 text-slate-300">Service Module {i + 1}</td>
                                            <td className="p-3 border border-slate-800 text-emerald-400">Operational</td>
                                            <td className="p-3 border border-slate-800 text-slate-300">{(i * 7) % 50 + 10}ms</td>
                                            <td className="p-3 border border-slate-800 text-slate-300">99.9%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <h2 className="text-white mt-8">3. Code Blocks</h2>
                        <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto my-4">
                            <code className="text-violet-300">
                                {`function calculateHealth(metrics) {
    const score = metrics.reduce((acc, curr) => acc + curr.value, 0);
    return {
        status: score > 80 ? 'Healthy' : 'Degraded',
        score: score,
        timestamp: new Date().toISOString()
    };
}`}
                            </code>
                        </pre>

                        <h2 className="text-white mt-8">4. Long Content Section</h2>
                        {[...Array(5)].map((_, i) => (
                            <p key={i} className="text-slate-300 mt-4">
                                Paragraph {i + 1}: At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum
                                deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident,
                                similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
                                Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi
                                optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est,
                                omnis dolor repellendus.
                            </p>
                        ))}
                    </div>
                </Card>
            </div>
        </main>
    );
}
