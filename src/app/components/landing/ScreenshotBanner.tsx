"use client";

import { motion } from "framer-motion";

export default function ScreenshotBanner() {
    return (
        <section className="py-24 bg-slate-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                    Einblicke in das Dashboard
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Visualisiere Architektur-Entscheidungen, Tech-Stacks und Deployment-Status in Echtzeit.
                </p>
            </div>

            <div className="relative flex overflow-hidden group">
                <motion.div
                    className="flex space-x-8 animate-scroll whitespace-nowrap"
                    initial={{ x: 0 }}
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 40,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="w-[600px] h-[400px] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 text-6xl font-black relative overflow-hidden shrink-0"
                        >
                            {/* Placeholder for real screenshots */}
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent" />
                            SCREENSHOT {i}
                            <div className="absolute bottom-6 left-6 text-xl text-slate-500 font-bold uppercase tracking-widest">
                                {i === 1 ? "Portfolio Overview" : i === 2 ? "Tech Stack Map" : i === 3 ? "ADR Reviewer" : "Cost Analysis"}
                            </div>
                        </div>
                    ))}
                    {/* Duplicate for infinite effect */}
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={`dup-${i}`}
                            className="w-[600px] h-[400px] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 text-6xl font-black relative overflow-hidden shrink-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent" />
                            SCREENSHOT {i}
                            <div className="absolute bottom-6 left-6 text-xl text-slate-500 font-bold uppercase tracking-widest">
                                {i === 1 ? "Portfolio Overview" : i === 2 ? "Tech Stack Map" : i === 3 ? "ADR Reviewer" : "Cost Analysis"}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            <style jsx>{`
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-scroll {
                    display: flex;
                    width: max-content;
                }
            `}</style>
        </section>
    );
}
