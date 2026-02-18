'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, FileText, Settings, Activity, Database, Menu, X, Layers, Cloud, Sparkles, BookOpen, Code, ShieldCheck, HelpCircle, LogOut, User, TrendingUp } from 'lucide-react';
import { Icon } from '@squievreux/ui';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';

// Define Navigation Structure
const NAVIGATION = {
    dashboard: {
        name: 'Dashboard',
        href: '/dashboard',
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
    business: {
        name: 'Business',
        href: '/business-intelligence',
        icon: TrendingUp,
        items: []
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
        href: '/providers',
        icon: Cloud,
        items: [
            { name: 'Service Catalog', href: '/providers', icon: Cloud },
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
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [activeContext, setActiveContext] = useState<string>('dashboard');
    const { data: session, status } = useSession();

    // Determine active context based on pathname
    useEffect(() => {
        const updateActiveContext = () => {
            if (pathname === '/dashboard') {
                setActiveContext('dashboard');
            } else if (pathname.startsWith('/portfolio') || pathname.startsWith('/report/portfolio') || pathname.startsWith('/report/strategy') || pathname === '/report') {
                setActiveContext('portfolio');
            } else if (pathname.startsWith('/business-intelligence')) {
                setActiveContext('business');
            } else if (pathname.startsWith('/architect') || pathname.startsWith('/developer')) {
                setActiveContext('architecture');
            } else if (pathname.startsWith('/providers') || pathname.startsWith('/report/providers') || pathname.startsWith('/logs')) {
                setActiveContext('operations');
            } else if (pathname.startsWith('/admin') || pathname.startsWith('/maintenance')) {
                setActiveContext('settings');
            } else if (pathname.startsWith('/help')) {
                setActiveContext('help');
            }
        };
        updateActiveContext();
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
                            <Link href="/" className="flex-shrink-0 flex items-center mr-8 hover:opacity-80 transition-opacity">
                                <span className="font-bold text-xl text-gradient-electric">
                                    VibeCoder
                                </span>
                            </Link>
                            <div className="hidden sm:flex sm:space-x-8">
                                {Object.entries(NAVIGATION)
                                    .filter(([key]) => status === 'authenticated' || ['help'].includes(key))
                                    .map(([key, item]) => (
                                        <Link
                                            key={key}
                                            href={item.href}
                                            onClick={() => setActiveContext(key)}
                                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isContextActive(key)
                                                ? 'border-violet-500 text-violet-400'
                                                : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200'
                                                }`}
                                        >
                                            <Icon icon={item.icon} className="w-4 h-4 mr-2" />
                                            {item.name}
                                        </Link>
                                    ))}
                            </div>
                        </div>

                        {/* User menu and mobile menu button */}
                        <div className="flex items-center space-x-2">
                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Notification Center */}
                            {status === 'authenticated' && session?.user && (
                                <NotificationCenter />
                            )}

                            {/* Desktop User Menu */}
                            {status === 'authenticated' && session?.user ? (
                                <div className="hidden sm:block relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                                    >
                                        <Icon icon={User} className="w-4 h-4" />
                                        <span>{session.user.name || session.user.email}</span>
                                        <span className="text-xs text-violet-400 ml-1">
                                            {(session.user as { role?: string }).role}
                                        </span>
                                    </button>
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
                                            <div className="py-1">
                                                <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-700">
                                                    {session.user.email}
                                                </div>
                                                <button
                                                    onClick={() => signOut({ callbackUrl: '/' })}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                                                >
                                                    <Icon icon={LogOut} className="w-4 h-4 mr-2" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : status === 'unauthenticated' ? (
                                <Link
                                    href="/auth/signin"
                                    className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none"
                                >
                                    Sign in
                                </Link>
                            ) : null}

                            {/* Mobile menu button */}
                            <div className="sm:hidden">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMenuOpen ? (
                                        <Icon icon={X} className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Icon icon={Menu} className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
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
                                    <Icon icon={subItem.icon} className="w-3 h-3 mr-1.5" />
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
                        {/* User info in mobile menu */}
                        {status === 'authenticated' && session?.user && (
                            <div className="px-4 py-3 border-b border-slate-800">
                                <div className="flex items-center space-x-3">
                                    <Icon icon={User} className="w-8 h-8 text-slate-400" />
                                    <div>
                                        <div className="text-sm font-medium text-white">
                                            {session.user.name || session.user.email}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {session.user.email}
                                        </div>
                                        <div className="text-xs text-violet-400 mt-1">
                                            Role: {(session.user as { role?: string }).role}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                        <Icon icon={item.icon} className="w-4 h-4 mr-2" />
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
                                                    <Icon icon={subItem.icon} className="w-3 h-3 mr-2" />
                                                    {subItem.name}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Mobile Sign in/out */}
                        {status === 'authenticated' ? (
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    signOut({ callbackUrl: '/auth/signin' });
                                }}
                                className="w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            >
                                <div className="flex items-center">
                                    <Icon icon={LogOut} className="w-4 h-4 mr-2" />
                                    Sign out
                                </div>
                            </button>
                        ) : status === 'unauthenticated' ? (
                            <Link
                                href="/auth/signin"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            >
                                <div className="flex items-center">
                                    <Icon icon={User} className="w-4 h-4 mr-2" />
                                    Sign in
                                </div>
                            </Link>
                        ) : null}
                    </div>
                </div>
            )}
        </nav>
    );
}
