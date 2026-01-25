"use client";

import useSWR, { mutate } from "swr";
import { ArchiveRestore, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Chat {
    id: string;
    title: string;
    updatedAt: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ArchivedChatsList() {
    const { data: chats, isLoading } = useSWR<Chat[]>("/api/chats?archived=true", fetcher);

    const handleUnarchive = async (chatId: string) => {
        // Optimistic update for archived list
        mutate("/api/chats?archived=true", (currentChats: Chat[] | undefined) => {
            return currentChats?.filter(c => c.id !== chatId) || [];
        }, { revalidate: false });

        // Optimistic update for main chat list (optional, but good for UX if visible)
        // We can't easily add it back to the main list optimistically without full data, 
        // but we can at least invalidate the query.

        try {
            const res = await fetch(`/api/chats/${chatId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: false }),
            });

            if (res.ok) {
                mutate("/api/chats"); // Refresh main chat list
                mutate("/api/chats?archived=true"); // Refresh archived list to be sure
            }
        } catch (error) {
            console.error("Failed to unarchive chat:", error);
            mutate("/api/chats?archived=true"); // Revert on error
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!chats || chats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                    <ArchiveRestore className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No archived chats</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                    When you archive chats, they will appear here for safe keeping.
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full pr-4">
            <div className="space-y-2">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/50 flex-shrink-0">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-medium truncate">{chat.title || "Untitled Chat"}</h4>
                                <p className="text-xs text-muted-foreground">
                                    Last activity: {new Date(chat.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnarchive(chat.id)}
                            className="ml-2 hover:bg-background hover:text-primary shrink-0"
                        >
                            <ArchiveRestore className="h-4 w-4 mr-2" />
                            Unarchive
                        </Button>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
