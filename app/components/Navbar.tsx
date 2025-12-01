'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, FileText, Settings, Activity, Database, Menu, X, ChevronDown, Layers, Cloud, Sparkles, BookOpen } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Portfolio', href: '/portfolio', icon: Layers },
        { name: 'Canvas Editor', href: '/report/portfolio', icon: FileText },
        { name: 'Strategy', href: '/report/strategy', icon: FileText },
        { name: 'Providers', href: '/report/providers', icon: Cloud },
        { name: 'Advisor', href: '/architect/chat', icon: Sparkles },
        { name: 'Knowledge Base', href: '/architect/decisions', icon: BookOpen },
        { name: 'AI Report', href: '/report', icon: FileText },
    ];

    const adminItems = [
        { name: 'Provider Management', href: '/admin/providers', icon: Cloud },
        { name: 'Maintenance', href: '/maintenance', icon: Settings },
        { name: 'System Logs', href: '/logs', icon: Activity },
        { name: 'Ecosystem Audit', href: '/maintenance?view=audit', icon: Database },
    ];

    return (
        <nav className="glass-panel sticky top-0 z-50 border-b-0" suppressHydrationWarning>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-xl text-gradient-electric">
                                VibeCoder Architect Reviewer
                            </span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`inline - flex items - center px - 1 pt - 1 border - b - 2 text - sm font - medium transition - colors ${isActive(item.href)
                                        ? 'border-violet-500 text-violet-400'
                                        : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'
                                        } `}
                                >
                                    <item.icon className="w-4 h-4 mr-2" />
                                    {item.name}
                                </Link>
                            ))}

                            {/* Admin Dropdown */}
                            <div className="relative inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-slate-400 hover:text-slate-200 cursor-pointer group">
                                <button
                                    className="inline-flex items-center focus:outline-none"
                                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                                    onBlur={() => setTimeout(() => setIsAdminOpen(false), 200)}
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Admin
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className={`absolute top - full left - 0 mt - 1 w - 48 bg - slate - 900 border border - slate - 700 rounded - md shadow - lg py - 1 ring - 1 ring - black ring - opacity - 5 transition - all duration - 200 ${isAdminOpen || 'group-hover:block hidden'} `}>
                                    {adminItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                                        >
                                            <div className="flex items-center">
                                                <item.icon className="w-4 h-4 mr-2 text-slate-500" />
                                                {item.name}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-slate-900 border-b border-slate-800">
                    <div className="pt-2 pb-3 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`block pl - 3 pr - 4 py - 2 border - l - 4 text - base font - medium ${isActive(item.href)
                                    ? 'bg-slate-800 border-violet-500 text-violet-400'
                                    : 'border-transparent text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200'
                                    } `}
                            >
                                <div className="flex items-center">
                                    <item.icon className="w-4 h-4 mr-2" />
                                    {item.name}
                                </div>
                            </Link>
                        ))}
                        <div className="border-t border-slate-700 pt-4 pb-3">
                            <div className="px-4 flex items-center">
                                <div className="font-medium text-slate-400">Admin</div>
                            </div>
                            <div className="mt-3 space-y-1">
                                {adminItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200"
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="w-4 h-4 mr-2" />
                                            {item.name}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
