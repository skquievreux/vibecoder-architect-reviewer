"use client";

import { motion } from "framer-motion";
import { LandingPageContent } from "@/lib/landing-page-config";

const fadeUp: any = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.12, duration: 0.5 },
    }),
};

export default function HeroSection({
    content,
}: {
    content: LandingPageContent;
}) {
    return (
        <section className="relative overflow-hidden min-h-[80vh] flex items-center justify-center px-6 py-24">
            {/* Background glow */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-8">
                {/* Badge */}
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {content?.badge || "VibeCoder"}
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05]"
                >
                    {content?.headline || "Untitled Section"}
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                >
                    {content?.subheadline || ""}
                </motion.p>

                {/* CTA + Stat */}
                <motion.div
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <a
                        href={content?.ctaHref || "/"}
                        className="px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg transition-all duration-200 shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                    >
                        {content?.ctaText || "Get Started"}
                    </a>
                    <div className="text-center">
                        <div className="text-4xl font-black text-white">
                            {content?.heroStat?.value || "0"}
                        </div>
                        <div className="text-sm text-slate-500">{content?.heroStat?.label || ""}</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
