'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, Activity, Database, Menu, X, Layers, Cloud, Sparkles, BookOpen, Code, ShieldCheck, HelpCircle } from 'lucide-react';

// Define Navigation Structure
const NAVIGATION = {
    dashboard: {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        items: [] // No sub-items for dashboard root
    },
    portfolio: {
        name: 'Portfolio',
        href: '/portfolio',
        icon: Layers,
        items: [
            { name: 'Overview', href: '/portfolio', icon: Layers },
            { name: 'Canvas Editor', href: '/report/portfolio', icon: FileText },
            { name: 'Strategy', href: '/report/strategy', icon: Activity },
            { name: 'AI Report', href: '/report', icon: FileText },
        ]
    },
    architecture: {
        name: 'Architecture',
        href: '/architect/chat',
        icon: Sparkles,
        items: [
            { name: 'Advisor', href: '/architect/chat', icon: Sparkles },
            { name: 'Decisions (ADRs)', href: '/architect/decisions', icon: BookOpen },
            { name: 'Developer Portal', href: '/developer', icon: Code },
        ]
    },
    operations: {
        name: 'Operations',
        href: '/report/providers',
        icon: Cloud,
        items: [
            { name: 'Service Catalog', href: '/report/providers', icon: Cloud },
            { name: 'System Logs', href: '/logs', icon: Activity },
            { name: 'Audit', href: '/maintenance?view=audit', icon: ShieldCheck },
        ]
    },
    settings: {
        name: 'Settings',
        href: '/maintenance',
        icon: Settings,
        items: [
            { name: 'Provider Admin', href: '/admin/providers', icon: Database },
            { name: 'Maintenance', href: '/maintenance', icon: Settings },
        ]
    },
    help: {
        name: 'Help',
        href: '/help',
        icon: HelpCircle,
        items: []
    }
};

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeContext, setActiveContext] = useState<string>('dashboard');

    // Determine active context based on pathname
    useEffect(() => {
        if (pathname === '/') {
            setActiveContext('dashboard');
        } else if (pathname.startsWith('/portfolio') || pathname.startsWith('/report/portfolio') || pathname.startsWith('/report/strategy') || pathname === '/report') {
            setActiveContext('portfolio');
        } else if (pathname.startsWith('/architect') || pathname.startsWith('/developer')) {
            setActiveContext('architecture');
        } else if (pathname.startsWith('/report/providers') || pathname.startsWith('/logs')) {
            setActiveContext('operations');
        } else if (pathname.startsWith('/admin') || pathname.startsWith('/maintenance')) {
            setActiveContext('settings');
        } else if (pathname.startsWith('/help')) {
            setActiveContext('help');
        }
    }, [pathname]);

    const isActive = (path: string) => pathname === path;
    const isContextActive = (key: string) => activeContext === key;

    return (
        <nav className="sticky top-0 z-50 flex flex-col" suppressHydrationWarning>
            {/* Level 1: Primary Navbar */}
            <div className="glass-panel border-b-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center mr-8">
                                <span className="font-bold text-xl text-gradient-electric">
                                    VibeCoder
                                </span>
                            </div>
                            <div className="hidden sm:flex sm:space-x-8">
                                {Object.entries(NAVIGATION).map(([key, item]) => (
                                    <Link
                                        key={key}
                                        href={item.href}
                                        onClick={() => setActiveContext(key)}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isContextActive(key)
                                            ? 'border-violet-500 text-violet-400'
                                            : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'
                                            }`}
                                    >
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.name}
                                    </Link>
                                ))}
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
            </div>

            {/* Level 2: Secondary Navbar (Sub-menu) */}
            {NAVIGATION[activeContext as keyof typeof NAVIGATION].items.length > 0 && (
                <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex space-x-6 h-10 items-center overflow-x-auto no-scrollbar">
                            {NAVIGATION[activeContext as keyof typeof NAVIGATION].items.map((subItem) => (
                                <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    className={`text-xs font-medium whitespace-nowrap transition-colors flex items-center ${isActive(subItem.href)
                                        ? 'text-violet-400 bg-violet-500/10 px-2 py-1 rounded-md'
                                        : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                >
                                    <subItem.icon className="w-3 h-3 mr-1.5" />
                                    {subItem.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden bg-slate-900 border-b border-slate-800 absolute top-16 w-full z-30">
                    <div className="pt-2 pb-3 space-y-1">
                        {Object.entries(NAVIGATION).map(([key, item]) => (
                            <div key={key}>
                                <Link
                                    href={item.href}
                                    onClick={() => {
                                        setActiveContext(key);
                                        // Only close menu if it's a leaf node (no sub-items) or if we want to force close
                                        // For now, let's keep it open to show sub-items if they exist, or close if it's a direct link
                                        if (item.items.length === 0) setIsMenuOpen(false);
                                    }}
                                    className={`w-full text-left block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isContextActive(key)
                                        ? 'bg-slate-800 border-violet-500 text-violet-400'
                                        : 'border-transparent text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <item.icon className="w-4 h-4 mr-2" />
                                        {item.name}
                                    </div>
                                </Link>
                                {/* Mobile Sub-items */}
                                {isContextActive(key) && (
                                    <div className="pl-8 space-y-1 bg-slate-950/50 py-2">
                                        {item.items.map((subItem) => (
                                            <Link
                                                key={subItem.name}
                                                href={subItem.href}
                                                className={`block py-2 text-sm ${isActive(subItem.href) ? 'text-violet-400' : 'text-slate-500'
                                                    }`}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <div className="flex items-center">
                                                    <subItem.icon className="w-3 h-3 mr-2" />
                                                    {subItem.name}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
