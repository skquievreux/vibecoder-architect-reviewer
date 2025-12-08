"use client";

import dynamic from "next/dynamic";

const PDFTestContent = dynamic(() => import("./content"), {
    ssr: false,
    loading: () => <div className="p-10 bg-slate-950 min-h-screen text-white">Loading...</div>
});

export default function PDFTestPage() {
    return <PDFTestContent />;
}
