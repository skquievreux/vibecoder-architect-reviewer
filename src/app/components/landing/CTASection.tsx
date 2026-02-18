"use client";

import { motion } from "framer-motion";
import { LandingPageContent } from "@/lib/landing-page-config";

export default function CTASection({
    content,
}: {
    content: LandingPageContent;
}) {
    return (
        <section className="px-6 py-32 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-2xl mx-auto p-12 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/60 to-slate-900/60 backdrop-blur-sm relative overflow-hidden"
            >
                <div className="absolute inset-0 -z-10 bg-violet-600/5" />
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                    Bereit für den Überblick?
                </h2>
                <p className="text-slate-400 mb-8">
                    Verbinde dein GitHub und analysiere dein Portfolio in unter 60 Sekunden.
                </p>
                <a
                    href={content?.ctaHref || "/"}
                    className="inline-block px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg transition-all duration-200 shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                >
                    {content?.ctaText || "Get Started"}
                </a>
            </motion.div>
        </section>
    );
}
