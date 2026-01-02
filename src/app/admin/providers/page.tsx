'use client';

import { Card, Title, Text, Button, TextInput, Badge, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@tremor/react";
import { useState, useEffect } from "react";
import { Plus, Save, Trash, Edit2 } from "lucide-react";

type Provider = {
    id: string;
    slug: string;
    name: string;
    description: string;
    website: string;
    category: string;
    tags: string; // JSON string in DB, but we handle as string for input
    capabilities: string; // JSON string
    pricingModel?: string;
    isApproved: boolean;
};

export default function AdminProvidersPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Provider>>({});

    const fetchProviders = async () => {
        const res = await fetch('/api/admin/providers');
        const data = await res.json();
        setProviders(data);
    };

    useEffect(() => {
        const loadProviders = async () => {
            await fetchProviders();
        };
        loadProviders();
    }, []);

    const handleEdit = (provider: Provider) => {
        setEditingId(provider.id);
        setFormData(provider);
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
    };

    const handleSave = async () => {
        if (!formData.slug || !formData.name) return;

        try {
            const method = editingId ? 'PATCH' : 'POST';
            const url = editingId ? `/api/admin/providers/${editingId}` : '/api/admin/providers';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchProviders();
                handleCancel();
            }
        } catch (error) {
            console.error('Failed to save provider', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;

        await fetch(`/api/admin/providers/${id}`, { method: 'DELETE' });
        fetchProviders();
    };

    return (
        <main className="p-10 bg-slate-900 min-h-screen text-slate-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Title className="text-3xl font-bold text-white">Provider Management</Title>
                    <Text className="text-slate-400">Manage the Service Catalog metadata.</Text>
                </div>
                <Button icon={Plus} color="violet" onClick={() => { setEditingId('new'); setFormData({}); }}>
                    Add Provider
                </Button>
            </div>

            {editingId === 'new' && (
                <Card className="mb-8 bg-slate-800 border border-slate-700">
                    <Title className="text-white mb-4">New Provider</Title>
                    <ProviderForm formData={formData} setFormData={setFormData} onSave={handleSave} onCancel={handleCancel} />
                </Card>
            )}

            <Card className="bg-slate-800 border border-slate-700">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell className="text-slate-300">Name</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300">Slug</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300">Category</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300">Tags</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300">Actions</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {providers.map((provider) => (
                            editingId === provider.id ? (
                                <TableRow key={provider.id}>
                                    <TableCell colSpan={5}>
                                        <ProviderForm formData={formData} setFormData={setFormData} onSave={handleSave} onCancel={handleCancel} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow key={provider.id} className="hover:bg-slate-700/50">
                                    <TableCell>
                                        <Text className="text-white font-bold">{provider.name}</Text>
                                        <Text className="text-xs text-slate-400">{provider.description}</Text>
                                    </TableCell>
                                    <TableCell><Text className="font-mono text-slate-400">{provider.slug}</Text></TableCell>
                                    <TableCell><Badge size="xs" color="slate">{provider.category}</Badge></TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap max-w-xs">
                                            {JSON.parse(provider.tags || '[]').map((t: string) => (
                                                <Badge key={t} size="xs" color="gray">{t}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="xs" variant="secondary" icon={Edit2} onClick={() => handleEdit(provider)}>Edit</Button>
                                            <Button size="xs" color="red" variant="light" icon={Trash} onClick={() => handleDelete(provider.id)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </main>
    );
}

interface ProviderFormProps {
    formData: Partial<Provider>;
    setFormData: (data: Partial<Provider>) => void;
    onSave: () => void;
    onCancel: () => void;
}

function ProviderForm({ formData, setFormData, onSave, onCancel }: ProviderFormProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <TextInput placeholder="Name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <TextInput placeholder="Slug (ID)" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
            <TextInput placeholder="Description" className="col-span-2" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            <TextInput placeholder="Category" value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} />
            <TextInput placeholder="Website" value={formData.website || ''} onChange={e => setFormData({ ...formData, website: e.target.value })} />
            <div className="col-span-2">
                <Text className="text-xs text-slate-400 mb-1">Tags (JSON Array)</Text>
                <TextInput placeholder='["tag1", "tag2"]' value={formData.tags || ''} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
            </div>
            <div className="col-span-2">
                <Text className="text-xs text-slate-400 mb-1">Capabilities (JSON Array)</Text>
                <TextInput placeholder='["cap1", "cap2"]' value={formData.capabilities || ''} onChange={e => setFormData({ ...formData, capabilities: e.target.value })} />
            </div>
            <div className="col-span-2">
                <Text className="text-xs text-slate-400 mb-1">Pricing Model</Text>
                <TextInput placeholder='e.g. "$20/user/month" or "Usage based"' value={formData.pricingModel || ''} onChange={e => setFormData({ ...formData, pricingModel: e.target.value })} />
            </div>
            <div className="col-span-2 flex gap-2 justify-end mt-2">
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button color="violet" icon={Save} onClick={onSave}>Save Provider</Button>
            </div>
        </div>
    );
}
