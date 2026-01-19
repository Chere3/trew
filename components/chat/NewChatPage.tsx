"use client";

import { useEffect, useState, useMemo } from "react";
import { TaskCard, type Task } from "./TaskCard";
import { Model } from "@/components/input/ModelSelector";
import {
    Sun,
    Moon,
    Sunset
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NewChatPageProps {
    onModelSelect: (modelId: string) => void;
    userName?: string;
}

const TASKS: Task[] = [
    // Coding
    {
        id: "refactor",
        title: "Refactor Code",
        description: "Improve code structure",
        category: "coding",
    },
    {
        id: "debug",
        title: "Find Bugs",
        description: "Fix logical errors",
        category: "coding",
    },

    // Creative
    {
        id: "story",
        title: "Write Story",
        description: "Create engaging narratives",
        category: "creative",
    },
    {
        id: "brainstorm",
        title: "Brainstorm",
        description: "Generate new ideas",
        category: "creative",
    },

    // Analysis / Math
    {
        id: "analysis",
        title: "Analyze",
        description: "Interpret complex data",
        category: "analysis",
    },
    {
        id: "logic",
        title: "Reasoning",
        description: "Solve complex problems",
        category: "analysis",
    },
];

export function NewChatPage({ onModelSelect, userName = "there" }: NewChatPageProps) {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState({ text: "Hello", icon: Sun });

    // Time-based greeting
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting({ text: "Good morning", icon: Sun });
        } else if (hour < 18) {
            setGreeting({ text: "Good afternoon", icon: Sun });
        } else if (hour < 22) {
            setGreeting({ text: "Good evening", icon: Sunset });
        } else {
            setGreeting({ text: "Good night", icon: Moon });
        }
    }, []);

    // Fetch models
    useEffect(() => {
        async function fetchModels() {
            try {
                const res = await fetch("/api/models");
                if (res.ok) {
                    const data = await res.json();
                    if (data.models) {
                        setModels(data.models);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch models", error);
            } finally {
                setLoading(false);
            }
        }
        fetchModels();
    }, []);

    // Compute best models
    const bestModels = useMemo(() => {
        if (models.length === 0) return {};

        const findBest = (criterion: (m: Model) => number) => {
            return models.reduce((prev, current) => {
                return criterion(current) > criterion(prev) ? current : prev;
            }, models[0]);
        };

        return {
            coding: findBest(m => m.codingIndex || 0),
            math: findBest(m => m.mathIndex || 0),
            creative: findBest(m => m.intelligenceIndex || 0),
            analysis: findBest(m => m.intelligenceIndex || 0),
        };
    }, [models]);

    const getRecommendedModel = (category: Task["category"]) => {
        if (loading || models.length === 0) return undefined;

        switch (category) {
            case "coding": return bestModels.coding;
            case "math": return bestModels.math;
            case "creative": return bestModels.creative;
            case "analysis": return bestModels.analysis;
            default: return bestModels.creative;
        }
    };

    const GreetingIcon = greeting.icon;

    return (
        <div className="flex flex-col h-full relative overflow-hidden bg-background/50">
            {/* Ambient Warmth - simplified and warmer */}
            <div className="absolute inset-0 overflow-hidden -z-10 select-none pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[60%] bg-gradient-to-t from-orange-500/10 via-amber-500/5 to-transparent blur-3xl" />
            </div>

            <div className="flex-1 flex flex-col justify-end pb-0 px-4 sm:px-8 max-w-5xl mx-auto w-full">
                {/* Welcome Section - Positioned comfortably above input */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 pl-1"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-medium tracking-tight text-foreground/90">
                            {greeting.text}, <span className="text-foreground font-semibold">{userName}</span>
                        </h1>
                        <GreetingIcon className="w-6 h-6 text-amber-500/80" />
                    </div>
                    <p className="text-base text-muted-foreground/80 font-light max-w-lg">
                        What would you like to create today?
                    </p>
                </motion.div>

                {/* Tasks - Horizontal Scrollable Row */}
                <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="overflow-x-auto pb-2 hide-scrollbar flex gap-3 snap-x">
                        {TASKS.map((task, index) => {
                            const recommendedModel = getRecommendedModel(task.category);
                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="snap-start shrink-0 first:pl-1"
                                >
                                    <TaskCard
                                        task={task}
                                        recommendedModelName={recommendedModel?.name}
                                        className={cn(
                                            "w-[180px] h-full", // Fixed width for horizontal items
                                            "bg-card/40 hover:bg-card/80 border-border/30 hover:border-border/60",
                                            "transition-all duration-300 backdrop-blur-sm"
                                        )}
                                        onClick={() => {
                                            if (recommendedModel) {
                                                onModelSelect(recommendedModel.id);
                                            }
                                        }}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                    {/* Fade edges for scroll indication */}
                    <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
                </div>
            </div>
        </div>
    );
}
