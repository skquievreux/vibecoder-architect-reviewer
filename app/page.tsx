"use client";

import { Card, Title, Text, Badge, Grid, Select, SelectItem, MultiSelect, MultiSelectItem } from "@tremor/react";
import { useState, useEffect } from "react";
import { Search, Server, Database, Code, Globe, ExternalLink } from "lucide-react";

// Types based on our analysis script output
type Technology = {
  id: string;
  name: string;
  category: string;
  version: string | null;
};

type Interface = {
  type: string;
  direction: string;
  details: any;
};

type Deployment = {
  id: string;
  provider: string;
  url: string;
  status: string;
  lastDeployedAt: string;
};

type Repository = {
  repo: {
    name: string;
    fullName: string; // Note: script outputs fullName but we changed query to nameWithOwner, let's check json
    nameWithOwner: string;
    url: string;
    description: string;
    isPrivate: boolean;
    updatedAt: string;
    pushedAt: string;
    languages: { edges: { node: { name: string } }[] };
  };
  technologies: Technology[];
  interfaces: Interface[];
  deployments: Deployment[];
};

export default function Dashboard() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("updated");

  useEffect(() => {
    // In a real app, this would fetch from Supabase.
    // For now, we import the JSON directly or fetch it from a local API route.
    // Since we can't easily import outside src, we'll assume the user copies it or we fetch via API.
    // Let's try to fetch from a public path or just hardcode a way to load it.
    // For this demo, I'll assume we moved the json to public/ or import it if I can.
    // Actually, best way is to create an API route that reads the file.
    fetch("/api/repos")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data);
        } else {
          console.error("API returned non-array:", data);
          setRepos([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setRepos([]);
        setLoading(false);
      });
  }, []);

  const filteredRepos = repos.filter(r => {
    const matchesSearch = r.repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.technologies.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProvider = selectedProviders.length === 0 ||
      r.deployments.some(d => selectedProviders.includes(d.provider));

    return matchesSearch && matchesProvider;
  }).sort((a, b) => {
    if (sortOption === "updated") {
      return new Date(b.repo.updatedAt).getTime() - new Date(a.repo.updatedAt).getTime();
    }
    if (sortOption === "name") {
      return a.repo.name.localeCompare(b.repo.name);
    }
    return 0;
  });

  const totalRepos = repos.length;
  const privateRepos = repos.filter(r => r.repo.isPrivate).length;
  const supabaseRepos = repos.filter(r => r.technologies.some(t => t.name === 'Supabase')).length;

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'vercel': return 'neutral'; // Black/White
      case 'fly': return 'violet';
      case 'cloudflare': return 'orange';
      case 'lovable': return 'pink';
      default: return 'slate';
    }
  };

  const techColors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
    sky: "bg-sky-100 text-sky-700 border-sky-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    violet: "bg-violet-100 text-violet-700 border-violet-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    fuchsia: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
    pink: "bg-pink-100 text-pink-700 border-pink-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const getTechClass = (techName: string) => {
    const colorKeys = Object.keys(techColors);
    let hash = 0;
    for (let i = 0; i < techName.length; i++) {
      hash = techName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorKey = colorKeys[Math.abs(hash) % colorKeys.length];
    return techColors[colorKey];
  };

  if (loading) return <div className="p-10">Loading analysis...</div>;

  return (
    <main className="p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Title className="text-3xl font-bold text-slate-900">Repository Maintenance Dashboard</Title>
            <Text>Overview of {totalRepos} repositories</Text>
          </div>
          <div className="flex gap-2">
            <Badge color="blue" icon={Code}>{totalRepos} Total</Badge>
            <Badge color="slate" icon={Server}>{privateRepos} Private</Badge>
            <Badge color="green" icon={Database}>{supabaseRepos} Supabase</Badge>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search repositories or technologies..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <MultiSelect
              onValueChange={setSelectedProviders}
              placeholder="Filter Provider"
              className="max-w-full"
            >
              <MultiSelectItem value="vercel">Vercel</MultiSelectItem>
              <MultiSelectItem value="fly">Fly.io</MultiSelectItem>
              <MultiSelectItem value="cloudflare">Cloudflare</MultiSelectItem>
            </MultiSelect>
          </div>
          <div className="w-full md:w-48">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </Select>
          </div>
        </div>

        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
          {filteredRepos.map((item) => {
            // Filter out technologies that are already shown as deployments
            const visibleTechnologies = item.technologies.filter(t => {
              const isDeployment = item.deployments.some(d => d.provider.toLowerCase() === t.name.toLowerCase());
              // Also filter out common deployment related tags if they appear
              const isIgnored = ['vercel', 'fly.io', 'heroku', 'netlify'].includes(t.name.toLowerCase());
              return !isDeployment && !isIgnored;
            });

            return (
              <Card key={item.repo.name} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Title className="truncate w-48" title={item.repo.name}>{item.repo.name}</Title>
                    <Text className="truncate w-48 text-xs">{item.repo.description || "No description"}</Text>
                  </div>
                  <Badge color={item.repo.isPrivate ? "slate" : "blue"}>
                    {item.repo.isPrivate ? "Private" : "Public"}
                  </Badge>
                </div>

                <div className="space-y-4 flex-grow">
                  {item.deployments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.deployments.map(d => (
                        <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" className="no-underline">
                          <Badge color={getProviderColor(d.provider)} icon={Globe}>
                            {d.provider}
                          </Badge>
                        </a>
                      ))}
                    </div>
                  )}

                  <div>
                    <Text className="font-medium text-xs mb-1">Technologies:</Text>
                    <div className="flex flex-wrap gap-1">
                      {visibleTechnologies.slice(0, 5).map(t => (
                        <span
                          key={t.id}
                          onClick={() => setSearchTerm(t.name)}
                          className={`px-2 py-0.5 text-[10px] rounded-full border cursor-pointer transition-colors hover:opacity-80 ${getTechClass(t.name)}`}
                        >
                          {t.name}
                        </span>
                      ))}
                      {visibleTechnologies.length > 5 && (
                        <span className="text-xs text-slate-400">+{visibleTechnologies.length - 5}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                  <span>Updated: {new Date(item.repo.updatedAt).toLocaleDateString()}</span>
                  <a href={item.repo.url} target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
                    GitHub <ExternalLink size={12} />
                  </a>
                </div>
              </Card>
            );
          })}
        </Grid>
      </div>
    </main>
  );
}
