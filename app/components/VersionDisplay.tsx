"use client";

import { useEffect, useState } from "react";

type BuildInfo = {
    version: string;
    buildTime: string;
    commitHash: string;
    env: string;
};

export default function VersionDisplay() {
    const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);

    useEffect(() => {
        fetch("/build-info.json")
            .then((res) => res.json())
            .then((data: BuildInfo) => {
                setBuildInfo(data);

                // Professional Console Log
                console.log(
                    `%c Architecture Review Dashboard %c v${data.version} `,
                    "background: #3b82f6; color: white; padding: 4px; border-radius: 4px 0 0 4px; font-weight: bold;",
                    "background: #1e293b; color: white; padding: 4px; border-radius: 0 4px 4px 0;"
                );
                console.log(
                    `%c Build: ${new Date(data.buildTime).toLocaleString()} | Commit: ${data.commitHash} `,
                    "color: #64748b; font-size: 11px;"
                );
            })
            .catch((err) => console.error("Failed to load build info", err));
    }, []);

    if (!buildInfo) return null;

    return (
        <div className="fixed bottom-2 right-2 z-50 opacity-50 hover:opacity-100 transition-opacity">
            <a href="/help" className="bg-slate-900/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded-md shadow-lg flex items-center gap-2 border border-slate-700 hover:border-violet-500 transition-colors cursor-pointer">
                <span className="font-bold text-blue-400">v{buildInfo.version}</span>
                <span className="text-slate-400">|</span>
                <span className="font-mono text-slate-300">{buildInfo.commitHash}</span>
            </a>
        </div>
    );
}
