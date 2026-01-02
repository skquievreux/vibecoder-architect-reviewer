"use client";

import { Card, Title, Text, Badge, Grid, TabGroup, TabList, Tab, TabPanels, TabPanel } from "@tremor/react";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, RefreshCw, Check, Play } from "lucide-react";
import Link from "next/link";

type Task = {
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
    createdAt: string;
    repository: {
        name: string;
    };
};

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            const data = await res.json();
            if (data.tasks) setTasks(data.tasks);
            setLoading(false);
        } catch (e) {
            console.error("Failed to fetch tasks");
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (verifying) return;
        setVerifying(true);
        try {
            const res = await fetch('/api/scripts/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script: 'verify-tasks' })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.output || 'Verification complete!');
                fetchTasks(); // Refresh list
            } else {
                alert('Verification failed: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Verification failed: Network error');
        } finally {
            setVerifying(false);
        }
    };

    const updateTaskStatus = async (id: string, status: string) => {
        try {
            await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            // Optimistic update
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        } catch (e) {
            console.error("Failed to update task");
        }
    };

    const openTasks = tasks.filter(t => t.status === 'OPEN');
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    const ignoredTasks = tasks.filter(t => t.status === 'IGNORED');

    const renderTaskList = (taskList: Task[]) => (
        <div className="space-y-4">
            {taskList.length === 0 ? (
                <Text className="italic text-slate-500">No tasks found.</Text>
            ) : (
                taskList.map(task => (
                    <Card key={task.id} className="glass-card flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${task.priority === 'HIGH' ? 'bg-rose-900/30 text-rose-400' :
                                task.priority === 'MEDIUM' ? 'bg-amber-900/30 text-amber-400' :
                                    'bg-blue-900/30 text-blue-400'
                                }`}>
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/repo/${task.repository?.name}`}
                                        className="font-bold text-slate-200 hover:text-violet-400 transition-colors hover:underline"
                                    >
                                        {task.repository?.name || "Unknown Repo"}
                                    </Link>
                                    <Badge size="xs" color={task.type === 'SECURITY' ? 'rose' : 'slate'}>{task.type}</Badge>
                                </div>
                                <div className="text-slate-300">{task.title}</div>
                                <div className="text-xs text-slate-500 mt-1">Created: {new Date(task.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {task.status === 'OPEN' && (
                                <>
                                    <button
                                        onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                                        className="p-2 rounded hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-400 transition-colors"
                                        title="Mark as Done"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                    <button
                                        onClick={() => updateTaskStatus(task.id, 'IGNORED')}
                                        className="p-2 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                                        title="Ignore"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </>
                            )}
                            {task.status !== 'OPEN' && (
                                <Badge color={task.status === 'COMPLETED' ? 'emerald' : 'slate'}>{task.status}</Badge>
                            )}
                        </div>
                    </Card>
                ))
            )}
        </div>
    );

    return (
        <main className="p-10 bg-slate-950 min-h-screen">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <Title className="text-3xl font-bold text-white">Task Management</Title>
                            <Text className="text-slate-400">Track and verify repository maintenance tasks.</Text>
                        </div>
                    </div>
                    <button
                        onClick={handleVerify}
                        disabled={verifying}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${verifying ? 'bg-slate-700 cursor-wait' : 'bg-violet-600 hover:bg-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                            }`}
                    >
                        <RefreshCw size={18} className={verifying ? 'animate-spin' : ''} />
                        {verifying ? 'Verifying...' : 'Auto-Verify Tasks'}
                    </button>
                </div>

                <TabGroup>
                    <TabList className="mt-8">
                        <Tab icon={AlertTriangle}>Open ({openTasks.length})</Tab>
                        <Tab icon={CheckCircle}>Completed ({completedTasks.length})</Tab>
                        <Tab icon={XCircle}>Ignored ({ignoredTasks.length})</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <div className="mt-6">
                                {renderTaskList(openTasks)}
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="mt-6">
                                {renderTaskList(completedTasks)}
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="mt-6">
                                {renderTaskList(ignoredTasks)}
                            </div>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </main>
    );
}
