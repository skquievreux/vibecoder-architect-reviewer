"use client";

import { Card, Title, Text, Badge, Grid, Select, SelectItem, TextInput, Button, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@tremor/react";
import { useState, useEffect } from "react";
import { ArrowLeft, Search, RefreshCw, Globe, Shield, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";

type Zone = {
    id: string;
    name: string;
    status: string;
    name_servers: string[];
};

type DnsRecord = {
    id: string;
    type: string;
    name: string;
    content: string;
    proxied: boolean;
    ttl: number;
};

export default function DnsManager() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [selectedZone, setSelectedZone] = useState<string>("");
    const [records, setRecords] = useState<DnsRecord[]>([]);
    const [loadingZones, setLoadingZones] = useState(true);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [repoMap, setRepoMap] = useState<Record<string, string>>({});
    const [domainMap, setDomainMap] = useState<Record<string, string>>({});
    const [nameMap, setNameMap] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchZones();
        fetchRepos();
    }, []);

    const fetchRepos = async () => {
        try {
            const res = await fetch('/api/repos');
            const data = await res.json();
            console.log('🔍 DNS: Fetched repository data:', { total: data?.length, sample: data?.slice(0, 3) });
            
            if (Array.isArray(data)) {
                const rMap: Record<string, string> = {};
                const dMap: Record<string, string> = {};
                const nMap: Record<string, string> = {};

                data.forEach((r: any) => {
                    // Map Deployment URLs
                    r.deployments.forEach((d: any) => {
                        const cleanUrl = d.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
                        rMap[cleanUrl] = r.repo.name;
                    });

                    // Map Custom URL
                    if (r.repo.customUrl) {
                        const cleanCustom = r.repo.customUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
                        dMap[cleanCustom] = r.repo.name;
                    }

                    // Map Repo Name (for subdomain matching)
                    nMap[r.repo.name.toLowerCase()] = r.repo.name;
                });
                
                console.log('🔗 DNS: Built mapping tables:', { 
                    repoMap: Object.keys(rMap).length,
                    domainMap: Object.keys(dMap).length,
                    nameMap: Object.keys(nMap).length
                });
                
                setRepoMap(rMap);
                setDomainMap(dMap);
                setNameMap(nMap);
            }
        } catch (e) {
            console.error("Failed to fetch repos for linking", e);
        }
    };

    useEffect(() => {
        if (selectedZone) {
            fetchRecords(selectedZone);
        } else {
            setRecords([]);
        }
    }, [selectedZone]);

    const fetchZones = async () => {
        setLoadingZones(true);
        setError(null);
        try {
            const res = await fetch('/api/dns');
            const data = await res.json();
            if (res.ok) {
                setZones(data);
                if (data.length > 0 && !selectedZone) {
                    // Optional: Auto-select first zone
                    // setSelectedZone(data[0].id);
                }
            } else {
                setError(data.error || 'Failed to load zones');
            }
        } catch (err) {
            setError('Network error loading zones');
        } finally {
            setLoadingZones(false);
        }
    };

    const fetchRecords = async (zoneId: string) => {
        setLoadingRecords(true);
        try {
            const res = await fetch(`/api/dns?zone_id=${zoneId}`);
            const data = await res.json();
            if (res.ok) {
                setRecords(data);
            } else {
                setError(data.error || 'Failed to load records');
            }
        } catch (err) {
            setError('Network error loading records');
        } finally {
            setLoadingRecords(false);
        }
    };

    const filteredRecords = records.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="p-10 bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <Title className="text-3xl font-bold text-white">DNS Management</Title>
                        <Text className="text-slate-400">Manage Cloudflare DNS records</Text>
                    </div>
                </div>

                {error && (
                    <Card decoration="top" decorationColor="rose" className="mb-6 glass-card bg-rose-950/20 border-rose-900/50">
                        <div className="flex items-center gap-2 text-rose-400">
                            <Shield size={20} />
                            <Text className="text-rose-400 font-medium">{error}</Text>
                        </div>
                        <Text className="mt-2 text-sm text-rose-300/70">Make sure CLOUDFLARE_API_TOKEN is set in .env</Text>
                    </Card>
                )}

                <Grid numItems={1} numItemsMd={3} className="gap-6">
                    {/* Sidebar / Zone Selector */}
                    <Card className="h-fit glass-card">
                        <Title className="mb-4 text-white">Select Zone</Title>
                        {loadingZones ? (
                            <Text className="text-slate-400">Loading zones...</Text>
                        ) : (
                            <div className="space-y-2">
                                {zones.map(zone => (
                                    <button
                                        key={zone.id}
                                        onClick={() => setSelectedZone(zone.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between ${selectedZone === zone.id
                                            ? "bg-violet-900/30 border-violet-500/50 text-violet-300"
                                            : "bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-400"
                                            }`}
                                    >
                                        <span className="font-medium">{zone.name}</span>
                                        <Badge size="xs" color={zone.status === 'active' ? 'emerald' : 'amber'}>
                                            {zone.status}
                                        </Badge>
                                    </button>
                                ))}
                                {zones.length === 0 && !error && <Text className="text-slate-500">No zones found.</Text>}
                            </div>
                        )}
                    </Card>

                    {/* Main Content / Records */}
                    <Card className="md:col-span-2 glass-card">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <Title className="text-white">DNS Records</Title>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search records..."
                                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm text-slate-200 placeholder-slate-600"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => selectedZone && fetchRecords(selectedZone)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw size={18} className={loadingRecords ? "animate-spin" : ""} />
                                </button>
                            </div>
                        </div>

                        {loadingRecords ? (
                            <div className="py-10 text-center text-slate-500">Loading records...</div>
                        ) : !selectedZone ? (
                            <div className="py-10 text-center text-slate-500">Select a zone to view records</div>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow className="border-b border-slate-800">
                                        <TableHeaderCell className="text-slate-400">Type</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-400">Name</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-400">Content</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-400">Linked Repo</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-400">Proxy</TableHeaderCell>
                                        <TableHeaderCell className="text-slate-400">TTL</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredRecords.map((record) => (
                                        <TableRow key={record.id} className="hover:bg-slate-800/30 transition-colors border-b border-slate-800/50">
                                            <TableCell>
                                                <Badge size="xs" color="slate" className="bg-slate-800 text-slate-300">{record.type}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-300">{record.name}</TableCell>
                                            <TableCell className="max-w-xs truncate text-slate-400" title={record.content}>{record.content}</TableCell>
                                            <TableCell>
                                                {(() => {
                                                    // 1. Direct Content Match (Target URL)
                                                    let linkedRepo = repoMap[record.content];
                                                    let matchType = 'content';

                                                    // 2. Custom Domain Match (Record Name)
                                                    if (!linkedRepo) {
                                                        linkedRepo = domainMap[record.name];
                                                        matchType = linkedRepo ? 'domain' : 'none';
                                                    }

                                                    // 3. Subdomain Match (Repo Name)
                                                    if (!linkedRepo) {
                                                        const subdomain = record.name.split('.')[0].toLowerCase();
                                                        linkedRepo = nameMap[subdomain];
                                                        matchType = linkedRepo ? 'subdomain' : 'none';
                                                    }

                                                    // Debug logging for first 5 records
                                                    if (record.id.slice(-8) === '00000001' || record.id.slice(-8) === '00000002' || record.id.slice(-8) === '00000003') {
                                                        console.log(`🔍 DNS Match Debug for ${record.name}:`, {
                                                            record: record.name,
                                                            content: record.content,
                                                            matchType,
                                                            linkedRepo,
                                                            foundInContent: !!repoMap[record.content],
                                                            foundInDomain: !!domainMap[record.name]
                                                        });
                                                    }

                                                    return linkedRepo ? (
                                                        <div className="group" title={`Linked via ${matchType} match`}>
                                                            <Link href={`/repo/${linkedRepo}`} className="text-violet-400 hover:underline flex items-center gap-1 transition-colors hover:text-violet-300">
                                                                <Globe size={12} />
                                                                {linkedRepo}
                                                                <ExternalLink size={10} className="ml-1 opacity-70 group-hover:opacity-100" />
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500 opacity-50 flex items-center gap-1" title="No repository found for this DNS record">
                                                            <AlertTriangle size={12} />
                                                            Not linked
                                                        </span>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {record.proxied ? (
                                                    <Badge size="xs" color="orange">Proxied</Badge>
                                                ) : (
                                                    <Badge size="xs" color="slate">DNS Only</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-500">{record.ttl === 1 ? 'Auto' : record.ttl}</TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredRecords.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-slate-500 py-4">
                                                No records found matching search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                </Grid>
            </div>
        </main>
    );
}
