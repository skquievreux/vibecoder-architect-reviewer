"use client";

import { motion } from "framer-motion";
import { LandingPageContent } from "@/lib/landing-page-config";

export default function SolutionSection({
    content,
}: {
    content: LandingPageContent;
}) {
    return (
        <section className="px-6 py-24 relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {content.solutionTitle}
                    </h2>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {content?.solutionFeatures?.map((feature, i) => (
                        <motion.div
                            key={feature}
                            initial={{ opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                            className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800"
                        >
                            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center">
                                <svg
                                    className="w-3 h-3 text-violet-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </span>
                            <span className="text-slate-300 text-sm">{feature}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
