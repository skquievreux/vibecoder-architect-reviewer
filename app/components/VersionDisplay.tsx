"use client";

import { useEffect, useState } from "react";

type BuildInfo = {
    version: string;
    nextVersion?: string;
    buildTime: string;
    gitCommit: string;
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
                    `%c Architecture Review Dashboard %c v${data.version} %c Next.js ${data.nextVersion || '?'} `,
                    "background: #3b82f6; color: white; padding: 4px; border-radius: 4px 0 0 4px; font-weight: bold;",
                    "background: #1e293b; color: white; padding: 4px;",
                    "background: #000000; color: white; padding: 4px; border-radius: 0 4px 4px 0;"
                );
                console.log(
                    `%c Build: ${new Date(data.buildTime).toLocaleString()} | Commit: ${data.gitCommit} `,
                    "color: #64748b; font-size: 11px;"
                );
            })
            .catch((err) => console.error("Failed to load build info", err));
    }, []);

    if (!buildInfo) return null;

    return (
        <div className="fixed bottom-2 right-2 z-50">
            <a href="/help"
                title={`Build: ${buildInfo.buildTime}\nEnv: ${buildInfo.env}`}
                className="bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-violet-500/50 hover:border-violet-400 hover:bg-slate-800 transition-all cursor-pointer group hover:shadow-violet-500/20 hover:-translate-y-0.5"
            >
                <span className="font-bold text-violet-400 group-hover:text-violet-300">v{buildInfo.version}</span>
                <span className="text-slate-600">|</span>
                {buildInfo.nextVersion && (
                    <>
                        <span className="text-slate-300 group-hover:text-white">Next.js {buildInfo.nextVersion.replace('^', '')}</span>
                        <span className="text-slate-600">|</span>
                    </>
                )}
                <span className="font-mono text-slate-500 group-hover:text-slate-400">{buildInfo.gitCommit}</span>
            </a>
        </div>
    );
}
