"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/repo");

    if (isDashboard) return null;

    return (
        <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4">
                    <h3 className="text-white font-bold text-lg">VibeCoder</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Automated Governance & Portfolio Intelligence for Modern Software Teams.
                    </p>
                </div>

                <div className="space-y-4">
                    <h4 className="text-white font-semibold">Product</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link href="/landing/indie-hacker" className="hover:text-violet-400 transition-colors">For Indie Hackers</Link></li>
                        <li><Link href="/landing/tech-lead" className="hover:text-violet-400 transition-colors">For Tech Leads</Link></li>
                        <li><Link href="/landing/showcase" className="hover:text-violet-400 transition-colors">Showcase</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="text-white font-semibold">Legal</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link href="/impressum" className="hover:text-violet-400 transition-colors">Impressum</Link></li>
                        <li><Link href="/datenschutz" className="hover:text-violet-400 transition-colors">Datenschutz</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="text-white font-semibold">Connect</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><a href="https://github.com/skquievreux" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">GitHub</a></li>
                        <li><a href="https://linkedin.com/in/steffen-quievreux" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">LinkedIn</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} Quievreux Consulting. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link href="/impressum" className="hover:text-slate-300 transition-colors">Impressum</Link>
                    <Link href="/datenschutz" className="hover:text-slate-300 transition-colors">Datenschutz</Link>
                </div>
            </div>
        </footer>
    );
}
