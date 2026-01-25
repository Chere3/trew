"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, BrainCircuit } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { MarkdownRenderer } from "@/components/media/MarkdownRenderer"
import { THINKING_COLLAPSED_DEFAULT_KEY } from "@/lib/constants"

interface ThinkingProps {
    content: string
    isStreaming?: boolean
}

function getDefaultExpandedState(): boolean {
    if (typeof window === "undefined") return false
    const stored = localStorage.getItem(THINKING_COLLAPSED_DEFAULT_KEY)
    // If stored is "true", expand by default. Otherwise (null or "false"), collapse by default
    return stored === "true"
}

export function Thinking({ content, isStreaming = false }: ThinkingProps) {
    const [isExpanded, setIsExpanded] = useState(() => {
        // Default to collapsed (false) if setting is not set or is false
        return getDefaultExpandedState()
    })

    if (!content) return null

    return (
        <div className="mb-2 max-w-[85%] sm:max-w-[75%] ml-12">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70 hover:text-foreground transition-colors mb-2 select-none"
            >
                <div className={cn("p-1 rounded-md bg-muted/50", isStreaming && "animate-pulse")}>
                    <BrainCircuit className="w-3.5 h-3.5" />
                </div>
                <span>Thought Process</span>
                {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                )}
            </button>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="relative pl-4 border-l-2 border-border/40 ml-2 my-2">
                            <div className="text-sm text-muted-foreground/60 italic max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <MarkdownRenderer
                                    content={content + (isStreaming ? " ●" : "")}
                                    className="prose-p:leading-relaxed prose-pre:bg-muted/30 text-xs"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
