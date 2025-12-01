"use client";

import { Card, Title, Text, Button, Badge, Select, SelectItem } from "@tremor/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, CheckCircle } from "lucide-react";
import Link from "next/link";

type Decision = {
    id: string;
    title: string;
    status: string;
    context: string;
    decision: string;
    consequences: string;
    tags: string;
};

export default function DecisionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const isNew = id === 'new';

    const [formData, setFormData] = useState<Decision>({
        id: '',
        title: '',
        status: 'PROPOSED',
        context: '',
        decision: '',
        consequences: '',
        tags: '[]'
    });
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew) {
            fetch(`/api/architect/decisions/${id}`)
                .then(res => res.json())
                .then(data => {
                    setFormData(data);
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    }, [id, isNew]);

    const handleSave = async () => {
        setSaving(true);
        const url = isNew ? '/api/architect/decisions' : `/api/architect/decisions/${id}`;
        const method = isNew ? 'POST' : 'PATCH';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/architect/decisions');
            } else {
                alert("Failed to save decision");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving decision");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this decision?")) return;
        try {
            await fetch(`/api/architect/decisions/${id}`, { method: 'DELETE' });
            router.push('/architect/decisions');
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-10 text-slate-500">Loading...</div>;

    return (
        <main className="p-10 bg-slate-950 min-h-screen text-slate-100">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/architect/decisions" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} /> Back to Knowledge Base
                    </Link>
                    <div className="flex gap-2">
                        {!isNew && (
                            <Button variant="secondary" color="red" icon={Trash2} onClick={handleDelete}>
                                Delete
                            </Button>
                        )}
                        <Button variant="primary" color="violet" icon={Save} loading={saving} onClick={handleSave}>
                            Save Decision
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="col-span-2">
                                <Text className="mb-1 text-slate-400">Title</Text>
                                <input
                                    type="text"
                                    placeholder="e.g. TypeScript 5.8 Adoption Policy"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-violet-500 hover:border-slate-600 transition-colors placeholder-slate-600"
                                />
                            </div>
                            <div>
                                <Text className="mb-1 text-slate-400">Status</Text>
                                <Select value={formData.status} onValueChange={val => setFormData({ ...formData, status: val })}>
                                    <SelectItem value="PROPOSED">Proposed</SelectItem>
                                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                    <SelectItem value="DEPRECATED">Deprecated</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Text className="mb-1 text-slate-400">Tags (JSON Array)</Text>
                            <input
                                type="text"
                                placeholder='["typescript", "security"]'
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-violet-500 hover:border-slate-600 transition-colors placeholder-slate-600"
                            />
                        </div>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <Title className="text-violet-400 mb-4">Context (The "Why")</Title>
                        <textarea
                            rows={6}
                            placeholder="Describe the context and problem statement..."
                            value={formData.context}
                            onChange={e => setFormData({ ...formData, context: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-violet-500 hover:border-slate-600 transition-colors placeholder-slate-600"
                        />
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <Title className="text-emerald-400 mb-4">Decision (The "What")</Title>
                        <textarea
                            rows={6}
                            placeholder="Describe the decision made..."
                            value={formData.decision}
                            onChange={e => setFormData({ ...formData, decision: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-violet-500 hover:border-slate-600 transition-colors placeholder-slate-600"
                        />
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <Title className="text-blue-400 mb-4">Consequences (The "Result")</Title>
                        <textarea
                            rows={6}
                            placeholder="Describe the positive and negative consequences..."
                            value={formData.consequences}
                            onChange={e => setFormData({ ...formData, consequences: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-violet-500 hover:border-slate-600 transition-colors placeholder-slate-600"
                        />
                    </Card>
                </div>
            </div>
        </main>
    );
}
