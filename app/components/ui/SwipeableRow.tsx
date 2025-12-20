import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SwipeableRowProps {
    children: ReactNode;
    className?: string;
}

export function SwipeableRow({ children, className }: SwipeableRowProps) {
    return (
        <div className={cn("relative group", className)}>
            {/* Gradient Fade Masks - Visible only when content overflows, but hard to detect in pure CSS. 
                We use a subtle persistent fade on mobile usually. */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none md:hidden z-10" />

            <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scrollbar-hide snap-x md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
                {children}
            </div>
        </div>
    );
}

interface SwipeableItemProps {
    children: ReactNode;
    className?: string;
}

export function SwipeableItem({ children, className }: SwipeableItemProps) {
    return (
        <div className={cn("snap-start shrink-0", className)}>
            {children}
        </div>
    );
}
