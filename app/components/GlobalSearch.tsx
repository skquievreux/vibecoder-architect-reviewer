"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  FileText,
  Shield,
  Code,
  Settings,
  Layers,
  Sparkles,
  TestTube,
  Package,
  Bell,
  User,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "repository" | "page" | "action";
  title: string;
  description?: string;
  url?: string;
  icon?: any;
  action?: () => void;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search functionality
  useEffect(() => {
    if (!search) {
      setResults(getDefaultResults());
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        // Search repositories
        const repoRes = await fetch(
          `/api/repos?search=${encodeURIComponent(search)}`
        );
        if (repoRes.ok) {
          const data = await repoRes.json();
          const repoResults: SearchResult[] = (data.repos || []).slice(0, 5).map(
            (repo: any) => ({
              id: repo.id,
              type: "repository",
              title: repo.name,
              description: repo.description,
              url: `/repos/${repo.id}`,
              icon: Layers,
            })
          );

          setResults([...getDefaultResults(), ...repoResults]);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const getDefaultResults = (): SearchResult[] => {
    return [
      {
        id: "dashboard",
        type: "page",
        title: "Dashboard",
        description: "Go to main dashboard",
        url: "/",
        icon: Layers,
      },
      {
        id: "security",
        type: "page",
        title: "Security Dashboard",
        description: "View security vulnerabilities",
        url: "/security",
        icon: Shield,
      },
      {
        id: "ai-intelligence",
        type: "page",
        title: "AI Intelligence",
        description: "AI-powered insights and predictions",
        url: "/ai-intelligence",
        icon: Sparkles,
      },
      {
        id: "testing",
        type: "page",
        title: "Testing Dashboard",
        description: "View test coverage and results",
        url: "/testing",
        icon: TestTube,
      },
      {
        id: "dependencies",
        type: "page",
        title: "Dependency Management",
        description: "Manage package dependencies",
        url: "/dependencies",
        icon: Package,
      },
      {
        id: "architecture",
        type: "page",
        title: "Architecture",
        description: "ADRs and architecture decisions",
        url: "/architect/decisions",
        icon: Code,
      },
      {
        id: "portfolio",
        type: "page",
        title: "Portfolio",
        description: "Portfolio intelligence and insights",
        url: "/portfolio",
        icon: FileText,
      },
      {
        id: "notifications",
        type: "action",
        title: "View Notifications",
        description: "See all notifications",
        icon: Bell,
        action: () => alert("Open notification panel"),
      },
      {
        id: "settings",
        type: "page",
        title: "Settings",
        description: "System settings and configuration",
        url: "/maintenance",
        icon: Settings,
      },
    ];
  };

  const handleSelect = (result: SearchResult) => {
    if (result.url) {
      router.push(result.url);
    } else if (result.action) {
      result.action();
    }
    setOpen(false);
    setSearch("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Command Palette */}
      <div className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl">
        <Command
          className="rounded-lg border border-slate-700 bg-slate-900 shadow-2xl"
          shouldFilter={false}
        >
          <div className="flex items-center border-b border-slate-700 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search repositories, pages, or type a command..."
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm text-white placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-2">
            {isLoading && (
              <Command.Loading>
                <div className="py-6 text-center text-sm text-slate-400">
                  Searching...
                </div>
              </Command.Loading>
            )}

            {!isLoading && results.length === 0 && (
              <Command.Empty>
                <div className="py-6 text-center text-sm text-slate-400">
                  No results found.
                </div>
              </Command.Empty>
            )}

            {!isLoading && results.length > 0 && (
              <Command.Group heading="Results">
                {results.map((result) => {
                  const Icon = result.icon || FileText;
                  return (
                    <Command.Item
                      key={result.id}
                      value={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer hover:bg-slate-800 aria-selected:bg-slate-800 text-slate-200"
                    >
                      <Icon className="h-4 w-4 text-violet-400" />
                      <div className="flex-1">
                        <div className="font-medium">{result.title}</div>
                        {result.description && (
                          <div className="text-xs text-slate-400">
                            {result.description}
                          </div>
                        )}
                      </div>
                      {result.type === "repository" && (
                        <span className="text-xs text-slate-500">Repository</span>
                      )}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t border-slate-700 px-3 py-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">⌘K</kbd> or{" "}
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">Ctrl+K</kbd> to toggle
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↑↓</kbd> to navigate
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
