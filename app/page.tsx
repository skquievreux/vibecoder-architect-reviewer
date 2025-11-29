"use client";

import { Card, Title, Text, Badge, Grid, Select, SelectItem, MultiSelect, MultiSelectItem, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@tremor/react";
import { useState, useEffect } from "react";
import { Search, Server, Database, Code, Globe, ExternalLink, AlertTriangle, RefreshCw, LayoutGrid, List, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

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
  // Replace sortOption with sortConfig
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'updated', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState<'all' | 'private' | 'supabase' | 'outdated'>('all');
  const [syncing, setSyncing] = useState(false);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/system/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Data synced successfully! Reloading...');
        window.location.reload();
      } else {
        alert('Sync failed: ' + data.error);
      }
    } catch (err) {
      alert('Sync failed: Network error');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
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

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const isOutdated = (dateString: string) => {
    const date = new Date(dateString);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return date < oneYearAgo;
  };

  const filteredRepos = repos.filter(r => {
    const matchesSearch = r.repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.technologies.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProvider = selectedProviders.length === 0 ||
      r.deployments.some(d => selectedProviders.includes(d.provider));

    let matchesStatus = true;
    if (filterStatus === 'private') matchesStatus = r.repo.isPrivate;
    if (filterStatus === 'supabase') matchesStatus = r.technologies.some(t => t.name.toLowerCase() === 'supabase');
    if (filterStatus === 'outdated') matchesStatus = isOutdated(r.repo.updatedAt.toString());

    return matchesSearch && matchesProvider && matchesStatus;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortConfig.key === 'name') {
      comparison = a.repo.name.localeCompare(b.repo.name);
    } else if (sortConfig.key === 'updated') {
      comparison = new Date(a.repo.updatedAt).getTime() - new Date(b.repo.updatedAt).getTime();
    } else if (sortConfig.key === 'status') {
      const statusA = a.repo.isPrivate ? 1 : 0;
      const statusB = b.repo.isPrivate ? 1 : 0;
      comparison = statusA - statusB;
    }

    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRepos.length / itemsPerPage);
  const paginatedRepos = filteredRepos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedProviders, filterStatus]);

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
            <Badge
              color={filterStatus === 'all' ? "blue" : "slate"}
              icon={Code}
              className="cursor-pointer hover:opacity-80"
              onClick={() => setFilterStatus('all')}
            >
              {totalRepos} Total
            </Badge>
            <Badge
              color={filterStatus === 'private' ? "blue" : "slate"}
              icon={Server}
              className="cursor-pointer hover:opacity-80"
              onClick={() => setFilterStatus('private')}
            >
              {privateRepos} Private
            </Badge>
            <Badge
              color={filterStatus === 'supabase' ? "green" : "slate"}
              icon={Database}
              className="cursor-pointer hover:opacity-80"
              onClick={() => setFilterStatus('supabase')}
            >
              {supabaseRepos} Supabase
            </Badge>
            <Badge
              color={filterStatus === 'outdated' ? "orange" : "slate"}
              icon={AlertTriangle}
              className="cursor-pointer hover:opacity-80"
              onClick={() => setFilterStatus('outdated')}
            >
              Outdated
            </Badge>
            <a href="/tech" className="no-underline">
              <Badge color="violet" icon={Code} className="cursor-pointer hover:opacity-80">
                Tech Overview
              </Badge>
            </a>
            <a href="/dns" className="no-underline">
              <Badge color="amber" icon={Globe} className="cursor-pointer hover:opacity-80">
                DNS
              </Badge>
            </a>
            <a href="/logs" className="no-underline">
              <Badge color="slate" icon={Code} className="cursor-pointer hover:opacity-80">
                Logs
              </Badge>
            </a>
            <Badge
              color="slate"
              icon={RefreshCw}
              className={`cursor-pointer hover:opacity-80 ${syncing ? 'animate-pulse' : ''}`}
              onClick={handleSync}
            >
              {syncing ? 'Syncing...' : 'Refresh Data'}
            </Badge>
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
            {/* Update Select to use sortConfig */}
            <Select
              value={sortConfig.key}
              onValueChange={(val) => setSortConfig({ key: val, direction: val === 'updated' ? 'desc' : 'asc' })}
            >
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </Select>
          </div>
          {/* View Toggle */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
            {paginatedRepos.map((item) => {
              const isRepoOutdated = isOutdated(item.repo.updatedAt.toString());
              const visibleTechnologies = item.technologies.filter(t => {
                const isDeployment = item.deployments.some(d => d.provider.toLowerCase() === t.name.toLowerCase());
                const isIgnored = ['vercel', 'fly.io', 'heroku', 'netlify'].includes(t.name.toLowerCase());
                return !isDeployment && !isIgnored;
              });

              return (
                <Card key={item.repo.name} className={`hover:shadow-lg transition-shadow flex flex-col h-full ${isRepoOutdated ? 'border-orange-200 bg-orange-50/30' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/repo/${item.repo.name}`} className="hover:underline">
                          <Title className="truncate w-48" title={item.repo.name}>{item.repo.name}</Title>
                        </Link>
                        {isRepoOutdated && <Badge color="orange" size="xs">Stale</Badge>}
                      </div>
                      <Text className="truncate w-48 text-xs">{item.repo.description || "No description"}</Text>
                    </div>
                    <Badge color={item.repo.isPrivate ? "slate" : "blue"}>
                      {item.repo.isPrivate ? "Private" : "Public"}
                    </Badge>
                  </div>

                  <div className="space-y-4 flex-grow">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-3 h-3 rounded-full ${new Date(item.repo.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'bg-green-500' :
                          new Date(item.repo.updatedAt) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`} />
                      <span className="text-slate-500">
                        Last updated: {new Date(item.repo.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.deployments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.deployments.map(d => {
                          const href = d.url.startsWith('http') ? d.url : `https://${d.url}`;
                          return (
                            <a key={d.id} href={href} target="_blank" rel="noopener noreferrer" className="no-underline">
                              <Badge color={getProviderColor(d.provider)} icon={Globe}>
                                {d.provider}
                              </Badge>
                            </a>
                          );
                        })}
                      </div >
                    )}

                    {
                      item.interfaces.length > 0 && (
                        <div>
                          <Text className="font-medium text-xs mb-1">Interfaces:</Text>
                          <div className="flex flex-wrap gap-1">
                            {item.interfaces.map((iface, idx) => (
                              <Badge key={idx} color="neutral" size="xs" icon={ExternalLink}>
                                {iface.details?.service || iface.type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    }

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
                  </div >

                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span>Created: {new Date(item.repo.pushedAt || item.repo.updatedAt).toLocaleDateString()}</span>
                    <a href={item.repo.url} target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
                      GitHub <ExternalLink size={12} />
                    </a>
                  </div>
                </Card >
              );
            })}
          </Grid >
        ) : (
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </TableHeaderCell>
                  <TableHeaderCell
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortConfig.key === 'status' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </TableHeaderCell>
                  <TableHeaderCell>Technologies</TableHeaderCell>
                  <TableHeaderCell
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => handleSort('updated')}
                  >
                    <div className="flex items-center gap-1">
                      Last Updated
                      {sortConfig.key === 'updated' && (
                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </TableHeaderCell>
                  <TableHeaderCell>Links</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRepos.map((item) => {
                  const isRepoOutdated = isOutdated(item.repo.updatedAt.toString());
                  const visibleTechnologies = item.technologies.filter(t => {
                    const isDeployment = item.deployments.some(d => d.provider.toLowerCase() === t.name.toLowerCase());
                    const isIgnored = ['vercel', 'fly.io', 'heroku', 'netlify'].includes(t.name.toLowerCase());
                    return !isDeployment && !isIgnored;
                  });

                  return (
                    <TableRow key={item.repo.name} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex flex-col">
                          <Link href={`/repo/${item.repo.name}`} className="font-medium text-blue-600 hover:underline flex items-center gap-2">
                            {item.repo.name}
                            {isRepoOutdated && <Badge color="orange" size="xs">Stale</Badge>}
                          </Link>
                          <span className="text-xs text-slate-500 truncate max-w-xs">{item.repo.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge color={item.repo.isPrivate ? "slate" : "blue"} size="xs">
                          {item.repo.isPrivate ? "Private" : "Public"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {visibleTechnologies.slice(0, 3).map(t => (
                            <span
                              key={t.id}
                              className={`px-2 py-0.5 text-[10px] rounded-full border ${getTechClass(t.name)}`}
                            >
                              {t.name}
                            </span>
                          ))}
                          {visibleTechnologies.length > 3 && (
                            <span className="text-xs text-slate-400">+{visibleTechnologies.length - 3}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${new Date(item.repo.updatedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'bg-green-500' :
                            new Date(item.repo.updatedAt) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                          {new Date(item.repo.updatedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {item.deployments.map(d => {
                            const href = d.url.startsWith('http') ? d.url : `https://${d.url}`;
                            return (
                              <a key={d.id} href={href} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600" title={d.provider}>
                                <Globe size={16} />
                              </a>
                            );
                          })}
                          <a href={item.repo.url} target="_blank" className="text-slate-500 hover:text-black" title="GitHub">
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <Text>Showing {paginatedRepos.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredRepos.length)} of {filteredRepos.length}</Text>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center px-2">
              <span className="text-sm font-medium">{currentPage} / {totalPages || 1}</span>
            </div>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div >
    </main >
  );
}
