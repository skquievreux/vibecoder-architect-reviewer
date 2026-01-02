"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal, X } from "lucide-react";

interface ActionGroupProps {
    primaryAction: ReactNode;
    secondaryActions: ReactNode[];
    className?: string;
}

export function ActionGroup({ primaryAction, secondaryActions, className }: ActionGroupProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (secondaryActions.length === 0) {
        return <div className={className}>{primaryAction}</div>;
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Desktop: Show all */}
            <div className="hidden md:flex items-center gap-2">
                {secondaryActions}
                {primaryAction}
            </div>

            {/* Mobile: Show Primary + Menu */}
            <div className="flex md:hidden items-center gap-2 w-full">
                <div className="flex-1">
                    {primaryAction}
                </div>

                <button
                    onClick={() => setIsOpen(true)}
                    className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Mobile Bottom Sheet / Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sheet */}
                    <div className="relative w-full bg-slate-900 border-t border-slate-800 rounded-t-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white">Actions</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 bg-slate-800 rounded-full text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {secondaryActions.map((action, idx) => (
                                <div key={idx} className="w-full [&>*]:w-full [&_button]:w-full [&_a]:w-full [&_a]:justify-center [&_button]:justify-center">
                                    {action}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-800">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 text-slate-400 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
