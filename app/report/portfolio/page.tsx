"use client";

import { Card, Title, Text, Button, Select, SelectItem, Badge } from "@tremor/react";
import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, GripVertical, Plus, Trash2, Save, RotateCcw, Library } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// --- Types ---
type CanvasItem = {
    id: string;
    content: string; // For simple strings like Value Prop
    details?: any;   // For complex objects
};

type CanvasData = {
    valueProposition: CanvasItem[];
    customerSegments: CanvasItem[];
    revenueStreams: CanvasItem[];
    costStructure: CanvasItem[];
};

const STANDARD_ITEMS = {
    valueProposition: [
        "High Availability", "Cost Reduction", "User Experience", "Security", "Scalability", "Innovation", "Open Source", "Privacy Focused"
    ],
    customerSegments: [
        "Enterprise", "SMB", "Startups", "Developers", "Internal Users", "End Consumers", "Government", "Education"
    ],
    revenueStreams: [
        "SaaS Subscription", "Licensing", "Usage-based", "Freemium", "Consulting", "Ad-supported", "One-time Purchase"
    ],
    costStructure: [
        "Cloud Infrastructure", "Personnel", "Marketing", "Software Licenses", "Office Space", "Legal & Compliance", "R&D"
    ]
};

// --- Draggable Library Item Component ---
function LibraryItem({ content, category }: { content: string, category: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `lib-${category}-${content}`,
        data: { type: 'library-item', content, category }
    });

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab bg-slate-800/50 p-2 rounded border border-slate-700 text-xs text-slate-300 hover:border-violet-500 hover:text-white transition-colors mb-2">
            {content}
        </div>
    );
}

// --- Sortable Item Component ---
function SortableItem({ id, item, category, onDelete }: { id: string, item: CanvasItem, category: string, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id,
        data: {
            type: 'item',
            item,
            containerId: category
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-slate-800 p-3 rounded-md border border-slate-700 flex items-center gap-3 mb-2 group hover:border-violet-500/50 transition-colors">
            <div {...attributes} {...listeners} className="cursor-grab text-slate-500 hover:text-slate-300">
                <GripVertical size={16} />
            </div>
            <div className="flex-1 text-sm text-slate-200">
                {item.content}
                {item.details && (
                    <div className="text-xs text-slate-500 mt-1">
                        {JSON.stringify(item.details).slice(0, 50)}...
                    </div>
                )}
            </div>
            <button onClick={() => onDelete(id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
            </button>
        </div>
    );
}

// --- Droppable Column Component ---
function CanvasColumn({ category, items, onDelete }: { category: keyof CanvasData, items: CanvasItem[], onDelete: (id: string) => void }) {
    const { setNodeRef } = useDroppable({
        id: category,
        data: { type: 'column', category }
    });

    return (
        <Card className="glass-card flex flex-col h-full min-h-[400px]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                <h3 className="font-semibold text-slate-200 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <Badge size="xs" color="violet">{items.length}</Badge>
            </div>

            <div ref={setNodeRef} className="flex-1 min-h-[200px]">
                <SortableContext
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map(item => (
                        <SortableItem
                            key={item.id}
                            id={item.id}
                            item={item}
                            category={category}
                            onDelete={onDelete}
                        />
                    ))}
                </SortableContext>

                {items.length === 0 && (
                    <div className="text-center py-10 text-slate-600 italic text-sm border-2 border-dashed border-slate-800 rounded-lg">
                        Drop items here
                    </div>
                )}
            </div>
        </Card>
    );
}

// --- Main Page Component ---
export default function PortfolioReportPage() {
    const [repos, setRepos] = useState<any[]>([]);
    const [selectedRepoId, setSelectedRepoId] = useState<string>("");
    const [canvasData, setCanvasData] = useState<CanvasData>({
        valueProposition: [],
        customerSegments: [],
        revenueStreams: [],
        costStructure: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [draggedLibraryItem, setDraggedLibraryItem] = useState<{ content: string, category: string } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const searchParams = useSearchParams();
    const repoIdParam = searchParams.get('repoId');

    // Derived state for active repo details
    const activeRepo = repos.find(r => r.id === selectedRepoId);

    useEffect(() => {
        // Fetch Repos
        fetch('/api/repos')
            .then(res => res.json())
            .then(data => {
                // Handle API response which is an array
                const rawData = Array.isArray(data) ? data : (data.repos || []);

                // Flatten the structure for easier usage
                const flattenedRepos = rawData.map((item: any) => ({
                    ...item.repo, // id, name, description
                    technologies: item.technologies,
                    businessCanvas: item.businessCanvas
                }));

                setRepos(flattenedRepos);

                // Prioritize URL param, then fallback to first repo
                if (repoIdParam && flattenedRepos.some((r: any) => r.id === repoIdParam)) {
                    setSelectedRepoId(repoIdParam);
                } else if (flattenedRepos.length > 0 && !selectedRepoId) {
                    setSelectedRepoId(flattenedRepos[0].id);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch repos:", err);
                setLoading(false);
            });
    }, [repoIdParam]);

    useEffect(() => {
        if (!selectedRepoId || repos.length === 0) return;

        const repo = repos.find(r => r.id === selectedRepoId);

        if (repo) {
            const parse = (json: string | null) => {
                try {
                    const parsed = JSON.parse(json || '[]');
                    return Array.isArray(parsed) ? parsed.map((item: any, idx: number) => ({
                        id: `${Date.now()}-${idx}-${Math.random()}`,
                        content: typeof item === 'string' ? item : (item.name || item.source || item.service || 'Unknown'),
                        details: typeof item === 'object' ? item : undefined
                    })) : [];
                } catch { return []; }
            };

            // Use the flattened structure directly
            const vp = parse(repo.businessCanvas?.valueProposition);
            const cs = parse(repo.businessCanvas?.customerSegments);
            const rs = parse(repo.businessCanvas?.revenueStreams);
            const cost = parse(repo.businessCanvas?.costStructure);

            // Smart Defaults if empty
            if (vp.length === 0 && repo.description) {
                vp.push({ id: `auto-${Date.now()}`, content: repo.description, details: undefined });
            }
            if (cost.length === 0 && repo.technologies) {
                repo.technologies.forEach((tech: any, idx: number) => {
                    cost.push({ id: `auto-tech-${idx}`, content: tech.name, details: { service: tech.name, amount: 0 } });
                });
            }
            if (rs.length === 0) {
                rs.push({ id: `auto-rs-1`, content: "Unknown Revenue Stream", details: undefined });
            }
            if (cs.length === 0) {
                cs.push({ id: `auto-cs-1`, content: "General Users", details: undefined });
            }

            setCanvasData({
                valueProposition: vp,
                customerSegments: cs,
                revenueStreams: rs,
                costStructure: cost
            });
        }
    }, [selectedRepoId, repos]);

    const handleDragStart = (event: any) => {
        const { active } = event;
        setActiveId(active.id);
        if (active.data.current?.type === 'library-item') {
            setDraggedLibraryItem({
                content: active.data.current.content,
                category: active.data.current.category
            });
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        setActiveId(null);
        setDraggedLibraryItem(null);

        if (!over) return;

        // Handle Drop from Library
        if (active.data.current?.type === 'library-item') {
            const category = active.data.current.category as keyof CanvasData;

            // Check if dropped on the correct column (or an item in that column)
            // We check over.data.current.containerId (from SortableItem) or over.id (from CanvasColumn droppable)

            const targetCategory = over.data.current?.containerId || over.id;

            if (targetCategory === category) {
                setCanvasData(prev => ({
                    ...prev,
                    [category]: [...prev[category], {
                        id: `lib-added-${Date.now()}-${Math.random()}`,
                        content: active.data.current.content
                    }]
                }));
            }
            return;
        }

        // Handle Reordering within Canvas
        // We need to know which category we are reordering
        const activeContainer = active.data.current?.containerId;
        const overContainer = over.data.current?.containerId || over.id;

        if (activeContainer && activeContainer === overContainer && active.id !== over.id) {
            const category = activeContainer as keyof CanvasData;
            setCanvasData((prev) => {
                const oldIndex = prev[category].findIndex(item => item.id === active.id);
                const newIndex = prev[category].findIndex(item => item.id === over.id);
                return {
                    ...prev,
                    [category]: arrayMove(prev[category], oldIndex, newIndex)
                };
            });
        }
    };

    const handleDelete = (id: string, category: keyof CanvasData) => {
        setCanvasData(prev => ({
            ...prev,
            [category]: prev[category].filter(item => item.id !== id)
        }));
    };

    const handleAdd = (category: keyof CanvasData) => {
        const newItem = prompt("Enter new item:");
        if (newItem) {
            setCanvasData(prev => ({
                ...prev,
                [category]: [...prev[category], { id: `new-${Date.now()}`, content: newItem }]
            }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Transform back to DB format
            const transform = (items: CanvasItem[]) => items.map(item => item.details || item.content);

            const payload = {
                repositoryId: selectedRepoId,
                valueProposition: transform(canvasData.valueProposition),
                customerSegments: transform(canvasData.customerSegments),
                revenueStreams: transform(canvasData.revenueStreams),
                costStructure: transform(canvasData.costStructure)
            };

            const res = await fetch('/api/portfolio/canvas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Canvas saved successfully!");
            } else {
                alert("Failed to save canvas.");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving canvas.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="p-6 bg-slate-950 min-h-screen">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/portfolio" className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                            <ArrowLeft size={24} />
                            <span className="text-sm font-medium hidden md:block">Back to Portfolio</span>
                        </Link>
                        <div>
                            <Title className="text-3xl font-bold text-white">Portfolio Management Report</Title>
                            <Text className="text-slate-400">Interactive Business Canvas Editor</Text>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            icon={RotateCcw}
                            onClick={() => setSelectedRepoId(selectedRepoId)} // Trigger reload
                        >
                            Reset
                        </Button>
                        <Button
                            variant="primary"
                            color="violet"
                            icon={Save}
                            loading={saving}
                            onClick={handleSave}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Context Header */}
                {activeRepo && (
                    <Card className="bg-slate-900/50 border-l-4 border-l-violet-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">{activeRepo.name}</h2>
                                <p className="text-slate-400 text-sm max-w-3xl">{activeRepo.description || "No description available."}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Tech Stack</span>
                                <div className="flex gap-2 mt-1">
                                    {activeRepo.technologies?.slice(0, 3).map((t: any) => (
                                        <span key={t.id} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                            {t.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Controls */}
                <Card className="glass-card">
                    <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-sm font-medium">Select Repository:</span>
                        <div className="w-96">
                            <Select value={selectedRepoId} onValueChange={setSelectedRepoId} enableClear={false}>
                                {repos.map(repo => (
                                    <SelectItem key={repo.id} value={repo.id}>
                                        {repo.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                </Card>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-12 gap-6">
                        {/* Canvas Grid (9 columns) */}
                        <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(['valueProposition', 'customerSegments', 'revenueStreams', 'costStructure'] as const).map(category => (
                                <CanvasColumn
                                    key={category}
                                    category={category}
                                    items={canvasData[category]}
                                    onDelete={(id) => handleDelete(id, category)}
                                />
                            ))}
                        </div>

                        {/* Library Sidebar (3 columns) */}
                        <div className="col-span-12 lg:col-span-3">
                            <Card className="glass-card h-full border-l border-slate-800">
                                <div className="flex items-center gap-2 mb-4 text-violet-400">
                                    <Library size={20} />
                                    <h3 className="font-bold text-lg">Item Library</h3>
                                </div>
                                <Text className="text-xs text-slate-500 mb-4">Drag items to the canvas to add them.</Text>

                                <div className="space-y-6">
                                    {(Object.keys(STANDARD_ITEMS) as Array<keyof typeof STANDARD_ITEMS>).map(category => (
                                        <div key={category}>
                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                                {category.replace(/([A-Z])/g, ' $1').trim()}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {STANDARD_ITEMS[category].map(item => (
                                                    <LibraryItem key={item} content={item} category={category} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>

                    <DragOverlay>
                        {activeId ? (
                            draggedLibraryItem ? (
                                <div className="bg-violet-600 text-white p-2 rounded shadow-lg text-sm font-medium opacity-90 rotate-3">
                                    {draggedLibraryItem.content}
                                </div>
                            ) : (
                                <div className="bg-slate-800 p-3 rounded-md border border-violet-500 shadow-lg opacity-90">
                                    Dragging...
                                </div>
                            )
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </main>
    );
}
