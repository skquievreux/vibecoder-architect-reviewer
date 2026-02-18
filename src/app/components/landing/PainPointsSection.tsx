"use client";

import { motion } from "framer-motion";
import { LandingPageContent } from "@/lib/landing-page-config";

export default function PainPointsSection({
    content,
}: {
    content: LandingPageContent;
}) {
    return (
        <section className="px-6 py-24 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Kennst du das?
                </h2>
                <p className="text-slate-500 text-lg">
                    Die Probleme, die dich täglich Zeit kosten.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
                {content.painPoints.map((point, i) => (
                    <motion.div
                        key={point.title}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
                        className="group relative p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:border-violet-500/40 hover:bg-slate-900/80 transition-all duration-300"
                    >
                        <div className="text-4xl mb-4">{point.icon}</div>
                        <h3 className="text-lg font-bold text-white mb-2">{point.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {point.description}
                        </p>
                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-2xl bg-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
