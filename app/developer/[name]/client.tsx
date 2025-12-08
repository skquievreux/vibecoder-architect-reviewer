"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiViewerClient({ name }: { name: string }) {
    const [spec, setSpec] = useState<object | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch repo details by name
        fetch(`/api/repos/${name}`)
            .then(res => res.json())
            .then(data => {
                // The API returns { repo: { ... }, ... }
                if (data.repo && data.repo.apiSpec) {
                    setSpec(JSON.parse(data.repo.apiSpec));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [name]);

    if (loading) {
        return <div className="p-8 text-slate-400">Loading API Specification...</div>;
    }

    if (!spec) {
        return <div className="p-8 text-red-400">API Specification not found for this repository.</div>;
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="bg-slate-900 text-white p-4 border-b border-slate-700 flex justify-between items-center">
                <h1 className="font-bold">API Documentation Viewer</h1>
                <a href="/developer" className="text-sm text-blue-400 hover:underline">← Back to Portal</a>
            </div>
            <div className="swagger-container">
                <SwaggerUI spec={spec} />
            </div>
        </div>
    );
}
