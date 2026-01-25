import { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Task, TaskCardProps as TaskCardPropsType } from "@/lib/types";

export type { Task }
export type TaskCardProps = TaskCardPropsType

export function TaskCard({
    task,
    recommendedModelName,
    onClick,
    className
}: TaskCardProps) {

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex flex-col items-start p-5",
                "bg-background/50 hover:bg-background border border-border/40 hover:border-border",
                "rounded-xl transition-all duration-300 cursor-pointer",
                "hover:shadow-md hover:shadow-primary/5 hover:-translate-y-1",
                className
            )}
        >
            {/* Content */}
            <div className="flex-1 w-full">
                <h3 className="font-semibold text-foreground text-sm mb-1.5 flex items-center gap-2">
                    {task.title}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-muted-foreground" />
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {task.description}
                </p>
            </div>

            {/* Recommended Model Badge */}
            {recommendedModelName && (
                <div className="mt-4 w-full pt-3 border-t border-border/30 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium">Best Match</span>
                    <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 h-5 bg-secondary/50 hover:bg-secondary font-normal whitespace-nowrap"
                    >
                        {recommendedModelName}
                    </Badge>
                </div>
            )}
        </div>
    );
}
