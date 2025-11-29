"use client";

import { Card, Title, Text, Badge, Grid, Select, SelectItem, TextInput, Button, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@tremor/react";
import { useState, useEffect } from "react";
import { ArrowLeft, Search, RefreshCw, Globe, Shield } from "lucide-react";
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

    useEffect(() => {
        fetchZones();
    }, []);

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
        <main className="p-10 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </Link>
                    <div>
                        <Title className="text-3xl font-bold text-slate-900">DNS Management</Title>
                        <Text>Manage Cloudflare DNS records</Text>
                    </div>
                </div>

                {error && (
                    <Card decoration="top" decorationColor="red" className="mb-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <Shield size={20} />
                            <Text className="text-red-600 font-medium">{error}</Text>
                        </div>
                        <Text className="mt-2 text-sm">Make sure CLOUDFLARE_API_TOKEN is set in .env</Text>
                    </Card>
                )}

                <Grid numItems={1} numItemsMd={3} className="gap-6">
                    {/* Sidebar / Zone Selector */}
                    <Card className="h-fit">
                        <Title className="mb-4">Select Zone</Title>
                        {loadingZones ? (
                            <Text>Loading zones...</Text>
                        ) : (
                            <div className="space-y-2">
                                {zones.map(zone => (
                                    <button
                                        key={zone.id}
                                        onClick={() => setSelectedZone(zone.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between ${selectedZone === zone.id
                                            ? "bg-blue-50 border-blue-200 text-blue-700"
                                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                                            }`}
                                    >
                                        <span className="font-medium">{zone.name}</span>
                                        <Badge size="xs" color={zone.status === 'active' ? 'green' : 'yellow'}>
                                            {zone.status}
                                        </Badge>
                                    </button>
                                ))}
                                {zones.length === 0 && !error && <Text>No zones found.</Text>}
                            </div>
                        )}
                    </Card>

                    {/* Main Content / Records */}
                    <Card className="md:col-span-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <Title>DNS Records</Title>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search records..."
                                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => selectedZone && fetchRecords(selectedZone)}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw size={18} className={loadingRecords ? "animate-spin" : ""} />
                                </button>
                            </div>
                        </div>

                        {loadingRecords ? (
                            <div className="py-10 text-center text-slate-500">Loading records...</div>
                        ) : !selectedZone ? (
                            <div className="py-10 text-center text-slate-400">Select a zone to view records</div>
                        ) : (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>Type</TableHeaderCell>
                                        <TableHeaderCell>Name</TableHeaderCell>
                                        <TableHeaderCell>Content</TableHeaderCell>
                                        <TableHeaderCell>Proxy</TableHeaderCell>
                                        <TableHeaderCell>TTL</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredRecords.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                <Badge size="xs" color="slate">{record.type}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-700">{record.name}</TableCell>
                                            <TableCell className="max-w-xs truncate" title={record.content}>{record.content}</TableCell>
                                            <TableCell>
                                                {record.proxied ? (
                                                    <Badge size="xs" color="orange">Proxied</Badge>
                                                ) : (
                                                    <Badge size="xs" color="slate">DNS Only</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{record.ttl === 1 ? 'Auto' : record.ttl}</TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredRecords.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-slate-500 py-4">
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
