"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
    repositoryId: string;
    isFavorite: boolean;
    className?: string;
    onToggle?: (newState: boolean) => void;
}

export default function FavoriteButton({
    repositoryId,
    isFavorite: initialIsFavorite,
    className = "",
    onToggle
}: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;
        setLoading(true);

        const newState = !isFavorite;
        // Optimistic update
        setIsFavorite(newState);
        if (onToggle) onToggle(newState);

        try {
            const method = newState ? "POST" : "DELETE";
            const url = newState
                ? "/api/favorites"
                : `/api/favorites?repositoryId=${repositoryId}`;

            const body = newState ? JSON.stringify({ repositoryId }) : undefined;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body
            });

            if (!res.ok) {
                throw new Error("Failed to update favorite");
            }

            router.refresh();
        } catch (error) {
            console.error("Error toggling favorite:", error);
            // Revert on error
            setIsFavorite(!newState);
            if (onToggle) onToggle(!newState);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            className={`p-1.5 rounded-md transition-all duration-200 hover:bg-slate-800 ${isFavorite ? "text-amber-400" : "text-slate-400 hover:text-amber-400"} ${loading ? "opacity-50 cursor-wait" : ""} ${className}`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            <Star
                size={18}
                fill={isFavorite ? "currentColor" : "none"}
                className={loading ? "animate-pulse" : ""}
            />
        </button>
    );
}
