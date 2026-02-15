"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { MessageList } from "@/components/chat";
import { MessageComposer } from "@/components/input/MessageComposer";
import { ModelSelector, AVAILABLE_MODELS, type Model } from "@/components/input/ModelSelector";
import { ModelSelectorSkeleton } from "@/components/input/ModelSelectorSkeleton";
import { ConversationListSkeleton } from "@/components/chat/ConversationListSkeleton";
import { cn } from "@/lib/utils";
import { NewChatPage } from "@/components/chat/NewChatPage";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarToggle
} from "@/components/navigation";
import { getProviderConfig } from "@/lib/models/providers";
import Image from "next/image";
import { ConversationList, type Conversation } from "@/components/navigation/ConversationList";
import { UserMenu } from "@/components/user/UserMenu";
import { SettingsDialog } from "@/components/user/SettingsDialog";
import { useSession } from "@/lib/auth-client";
import { signOut } from "@/lib/auth-client";
import { useRouter, useParams } from "next/navigation";
import type { Message, Chat } from "@/lib/types";
import { AUTO_MODEL_ID, API_ENDPOINTS, MESSAGE_ROLE_USER, MESSAGE_ROLE_ASSISTANT } from "@/lib/constants";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatData {
  messages: Message[];
  hasMore?: boolean;
  nextCursor?: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ChatInterface() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });
  const [selectedModel, setSelectedModel] = useState(AUTO_MODEL_ID);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [visualViewportHeight, setVisualViewportHeight] = useState<number | null>(null);

  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.conversationId as string | undefined;

  // Fetch chats
  const { data: chats, isLoading: isLoadingChats } = useSWR<Chat[]>(API_ENDPOINTS.CHATS, fetcher);

  // Pagination state
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [oldestCursor, setOldestCursor] = useState<number | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [tempMessages, setTempMessages] = useState<Message[]>([]); // For optimistic/streaming messages

  // Fetch initial messages for selected chat (most recent batch)
  const { data: initialChatData, isLoading: isLoadingMessages, mutate: mutateInitialMessages } = useSWR<ChatData>(
    conversationId ? `/api/chats/${conversationId}?limit=50` : null,
    fetcher
  );

  // Fetch models for regenerate dropdown
  const { data: modelsData } = useSWR<{ models: Model[] }>("/api/models", fetcher);
  const availableModels = modelsData?.models || AVAILABLE_MODELS;

  const lastInitializedChatId = useRef<string | undefined>(undefined);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastUserMessageIdRef = useRef<string | null>(null);
  const isLoadingOlderRef = useRef(false);

  // Mobile keyboard avoidance: keep composer above the on-screen keyboard.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const vv = window.visualViewport;
    if (!vv) return;

    // Prevent the page itself from scrolling while the chat is mounted.
    // The chat manages its own internal scrolling.
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const onViewportChange = () => {
      setVisualViewportHeight(vv.height);
      // visualViewport.height excludes the browser UI + keyboard. When the keyboard opens,
      // `innerHeight - visualViewport.height` approximates the occluded bottom area.
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardInset(inset);
    };

    onViewportChange();
    vv.addEventListener("resize", onViewportChange);
    vv.addEventListener("scroll", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);

    return () => {
      vv.removeEventListener("resize", onViewportChange);
      vv.removeEventListener("scroll", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  // Initialize messages when chat changes or initial data loads
  useEffect(() => {
    if (!conversationId) {
      setLoadedMessages([]);
      setHasMore(false);
      setOldestCursor(null);
      setTempMessages([]);
      lastInitializedChatId.current = undefined;
      return;
    }

    if (!initialChatData) {
      return;
    }

    if (conversationId && initialChatData) {
      const msgs = initialChatData.messages || [];
      
      if (conversationId !== lastInitializedChatId.current) {
        setLoadedMessages(msgs);
        setHasMore(initialChatData.hasMore || false);
        setOldestCursor(initialChatData.nextCursor || null);
        setTempMessages((prev) => {
          // Keep optimistic messages only until their persisted equivalents appear.
          const loadedMessageIds = new Set(msgs.map((m) => m.id));
          const loadedAssistantContents = new Set(
            msgs
              .filter((m) => m.role === MESSAGE_ROLE_ASSISTANT && typeof m.content === "string")
              .map((m) => m.content.trim())
              .filter(Boolean)
          );

          const loadedUserContents = new Set(
            msgs
              .filter((m) => m.role === MESSAGE_ROLE_USER && typeof m.content === "string")
              .map((m) => m.content.trim())
              .filter(Boolean)
          );

          return prev.filter((m) => {
            if (m.isStreaming && m.role === MESSAGE_ROLE_ASSISTANT) return true;
            if (loadedMessageIds.has(m.id)) return false;

            // Temp ids never match DB ids; de-dup by content once the message is persisted.
            if (m.role === MESSAGE_ROLE_ASSISTANT && !m.isStreaming && typeof m.content === "string") {
              return !loadedAssistantContents.has(m.content.trim());
            }

            if (m.role === MESSAGE_ROLE_USER && typeof m.content === "string") {
              return !loadedUserContents.has(m.content.trim());
            }

            return true;
          });
        });
        lastInitializedChatId.current = conversationId;
      } else {
        setLoadedMessages((prev) => {
          if (msgs.length === 0) return prev;

          // Merge instead of replace to avoid UI "blink/disappear" when SWR returns
          // a stale/shorter snapshot right after optimistic updates.
          const byId = new Map<string, any>();
          [...prev, ...msgs].forEach((m) => byId.set(m.id, m));
          const merged = Array.from(byId.values()).sort((a, b) => a.createdAt - b.createdAt);

          // Never shrink loaded messages during active conversation refreshes.
          const nextLoaded = merged.length >= prev.length ? merged : prev;

          setTempMessages((tempPrev) => {
            const loadedMessageIds = new Set(nextLoaded.map((m: any) => m.id));
            const loadedAssistantContents = new Set(
              nextLoaded
                .filter((m: any) => m.role === MESSAGE_ROLE_ASSISTANT && typeof m.content === "string")
                .map((m: any) => m.content.trim())
                .filter(Boolean)
            );

            const loadedUserContents = new Set(
              nextLoaded
                .filter((m: any) => m.role === MESSAGE_ROLE_USER && typeof m.content === "string")
                .map((m: any) => m.content.trim())
                .filter(Boolean)
            );

            return tempPrev.filter((m) => {
              if (m.isStreaming && m.role === MESSAGE_ROLE_ASSISTANT) return true;
              if (loadedMessageIds.has(m.id)) return false;

              if (m.role === MESSAGE_ROLE_ASSISTANT && !m.isStreaming && typeof m.content === "string") {
                return !loadedAssistantContents.has(m.content.trim());
              }

              if (m.role === MESSAGE_ROLE_USER && typeof m.content === "string") {
                return !loadedUserContents.has(m.content.trim());
              }

              return true;
            });
          });

          return nextLoaded;
        });
        setHasMore(initialChatData.hasMore || false);
        setOldestCursor(initialChatData.nextCursor || null);
      }
    }
  }, [conversationId, initialChatData]);

  const messages = [...loadedMessages, ...tempMessages];

  const loadOlderMessages = useCallback(async () => {
    if (!conversationId || !oldestCursor || isLoadingOlderRef.current || !hasMore) {
      return;
    }

    isLoadingOlderRef.current = true;
    setIsLoadingOlder(true);

    try {
      const response = await fetch(
        `/api/chats/${conversationId}?limit=50&before=${oldestCursor}`
      );
      if (!response.ok) throw new Error("Failed to load messages");

      const data: ChatData = await response.json();
      const newMessages = data.messages || [];

      if (newMessages.length > 0) {
        setLoadedMessages((prev) => [...newMessages, ...prev]);
        setHasMore(data.hasMore || false);
        setOldestCursor(data.nextCursor || null);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load older messages", error);
    } finally {
      isLoadingOlderRef.current = false;
      setIsLoadingOlder(false);
    }
  }, [conversationId, oldestCursor, hasMore]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      if (scrollTop < 200 && hasMore && !isLoadingOlderRef.current) {
        loadOlderMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadOlderMessages, hasMore]);

  useEffect(() => {
    if (conversationId && initialChatData && conversationId !== lastInitializedChatId.current) {
      const msgs = initialChatData.messages || [];
      if (msgs.length > 0) {
        const lastAssistantMessage = [...msgs].reverse().find(m => m.role === MESSAGE_ROLE_ASSISTANT);
        if (lastAssistantMessage?.model) {
          setSelectedModel(lastAssistantMessage.model);
        }
      }
    }
  }, [initialChatData, conversationId]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async (content: string, files: File[]) => {
    if (!content.trim() && files.length === 0) return;

    const attachments = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        url: await fileToBase64(file),
        type: file.type
      }))
    );

    const now = Date.now();

    if (!conversationId) {
      const optimisticChatId = `chat-${now}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticTitle = content.substring(0, 50);

      mutate(API_ENDPOINTS.CHATS, (currentChats: Chat[] | undefined) => {
        const newChat: Chat = {
          id: optimisticChatId,
          title: optimisticTitle,
          createdAt: now,
          updatedAt: now,
          preview: content,
        };
        return currentChats ? [newChat, ...currentChats] : [newChat];
      }, { revalidate: false });

      const tempId = `temp-${now}`;
      const userMessage: Message = {
        id: tempId,
        role: "user",
        content: content.trim(),
        createdAt: now,
        attachments
      };
      setTempMessages([userMessage]);

      router.push(`/chat/${optimisticChatId}`);

      fetch(API_ENDPOINTS.CHATS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          attachments
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const newChat = await res.json();
            mutate(API_ENDPOINTS.CHATS, (currentChats: Chat[] | undefined) => {
              if (!currentChats) return currentChats;
              return currentChats.map(chat => 
                chat.id === optimisticChatId 
                  ? { ...chat, id: newChat.id, title: newChat.title }
                  : chat
              );
            }, { revalidate: false });

            // We just navigated to the optimistic route above, so always swap to the real chat id.
            router.replace(`/chat/${newChat.id}`);

            handleAIResponse(newChat.id);
          } else {
            mutate(API_ENDPOINTS.CHATS, (currentChats: Chat[] | undefined) => {
              return currentChats?.filter(c => c.id !== optimisticChatId) || [];
            }, { revalidate: false });
            setTempMessages([]);
            console.error("Failed to create chat");
          }
        })
        .catch((error) => {
          console.error("Failed to create chat", error);
          mutate(API_ENDPOINTS.CHATS, (currentChats: Chat[] | undefined) => {
            return currentChats?.filter(c => c.id !== optimisticChatId) || [];
          }, { revalidate: false });
          setTempMessages([]);
        });

      mutate(API_ENDPOINTS.CHATS);
      return;
    }

    const tempId = `temp-${now}`;
    const userMessage: Message = {
      id: tempId,
      role: "user",
      content: content.trim(),
      createdAt: now,
      attachments
    };
    setTempMessages((prev) => [...prev, userMessage]);

    mutate(API_ENDPOINTS.CHATS, (currentChats: Chat[] | undefined) => {
      if (!currentChats) return currentChats;
      return currentChats.map(chat => 
        chat.id === conversationId 
          ? { ...chat, updatedAt: now, preview: content.substring(0, 100) }
          : chat
      );
    }, { revalidate: false });

    // Start generation immediately to reduce TTFB; backend will include this pending message.
    handleAIResponse(conversationId, { content, attachments: files });

    fetch(`/api/chats/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "user",
        content: content,
        attachments
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const savedMessage = await res.json();
          setTempMessages((prev) => 
            prev.map(m => m.id === tempId ? { ...savedMessage, isStreaming: false } : m)
          );
          mutateInitialMessages();
          mutate(API_ENDPOINTS.CHATS);
        } else {
          setTempMessages((prev) => prev.filter(m => m.id !== tempId));
          mutate(API_ENDPOINTS.CHATS);
        }
      })
      .catch((error) => {
        console.error("Failed to send message", error);
        setTempMessages((prev) => prev.filter(m => m.id !== tempId));
        mutate(API_ENDPOINTS.CHATS);
      });
  };

  const finalizeTempAssistant = (tempId: string, fullText: string) => {
    const finalText = fullText.trim();
    setTempMessages((prev) =>
      prev.map((m) => {
        if (m.id !== tempId) return m;
        if (!finalText) {
          return {
            ...m,
            isStreaming: false,
            content: "Response failed to generate. Please try again.",
          };
        }
        return { ...m, isStreaming: false };
      })
    );
  };

  const handleAIResponse = async (chatId: string, pendingUserMessage?: { content: string; attachments: File[] }) => {
    const tempId = `ai-${Date.now()}`;

    try {
      const streamingMessage: Message = {
        id: tempId,
        role: MESSAGE_ROLE_ASSISTANT,
        content: "",
        createdAt: Date.now(),
        isStreaming: true,
        model: selectedModel
      };
      setTempMessages((prev) => [...prev, streamingMessage]);

      const response = await fetch(`/api/chats/${chatId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          pendingUserMessage: pendingUserMessage ? {
            content: pendingUserMessage.content,
            attachments: pendingUserMessage.attachments,
          } : undefined,
        }),
      });

      if (!response.ok || !response.body) {
        // New chats can hit a tiny race while cache-backed writes flush to DB.
        // Retry once shortly after for 404/409 type transient states.
        if ((response.status === 404 || response.status === 409) && !chatId.startsWith("chat-")) {
          await new Promise((r) => setTimeout(r, 350));
          const retry = await fetch(`/api/chats/${chatId}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: selectedModel,
              pendingUserMessage: pendingUserMessage ? {
                content: pendingUserMessage.content,
                attachments: pendingUserMessage.attachments,
              } : undefined,
            }),
          });
          if (retry.ok && retry.body) {
            const reader = retry.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessageContent = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                setTempMessages((prev) =>
                  prev.map(m => m.id === tempId ? { ...m, isStreaming: false } : m)
                );
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              assistantMessageContent += chunk;
              setTempMessages((prev) =>
                prev.map(m =>
                  m.id === tempId
                    ? { ...m, content: assistantMessageContent, isStreaming: true }
                    : m
                )
              );
            }

            await mutateInitialMessages();
            mutate("/api/chats");

            return;
          }
        }

        const errText = await response.text().catch(() => "");
        throw new Error(`Failed to generate response (${response.status}) ${errText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          finalizeTempAssistant(tempId, assistantMessageContent);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantMessageContent += chunk;

        setTempMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, content: assistantMessageContent, isStreaming: true }
              : m
          )
        );
      }

      await mutateInitialMessages();
      mutate("/api/chats");
      // Do not force-remove temp assistant here; keep it visible until server state catches up.

    } catch (e) {
      console.error("AI response failed", e);
      setTempMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, isStreaming: false, content: "Response failed to generate. Please try again." }
            : m
        )
      );
    }
  };

  const handleRegenerate = async (messageId: string) => {
    if (!conversationId) return;

    try {
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;

      const loadedCount = loadedMessages.length;
      const messageInLoaded = messageIndex < loadedCount;

      if (messageInLoaded) {
        const messagesToKeep = loadedMessages.slice(0, messageIndex + 1);
        setLoadedMessages(messagesToKeep);
        setTempMessages([]);
      } else {
        const tempIndex = messageIndex - loadedCount;
        setTempMessages((prev) => prev.slice(0, tempIndex + 1));
      }

      const res = await fetch(`/api/chats/${conversationId}/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete messages");
      }

      await mutateInitialMessages();
      mutate("/api/chats");

      if (conversationId) {
        handleAIResponse(conversationId);
      }
    } catch (error) {
      console.error("Failed to regenerate", error);
      mutateInitialMessages();
    }
  };

  const handleRegenerateAssistant = async (assistantMessageId: string, newModelId: string) => {
    if (!conversationId) return;

    try {
      const assistantIndex = messages.findIndex(m => m.id === assistantMessageId);
      if (assistantIndex === -1) return;

      let userMessageIndex = -1;
      for (let i = assistantIndex - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userMessageIndex = i;
          break;
        }
      }

      if (userMessageIndex === -1) return;

      const loadedCount = loadedMessages.length;
      const userMessageInLoaded = userMessageIndex < loadedCount;

      if (userMessageInLoaded) {
        const messagesToKeep = loadedMessages.slice(0, userMessageIndex + 1);
        setLoadedMessages(messagesToKeep);
        setTempMessages([]);
      } else {
        const tempIndex = userMessageIndex - loadedCount;
        setTempMessages((prev) => prev.slice(0, tempIndex + 1));
      }

      const res = await fetch(`/api/chats/${conversationId}/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: assistantMessageId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete messages");
      }

      await mutateInitialMessages();
      // Do not force-remove temp assistant here; keep it visible until server state catches up.
      mutate("/api/chats", async (currentChats: Chat[] | undefined) => {
        if (!currentChats) return currentChats;
        return currentChats.map(chat => 
          chat.id === conversationId 
            ? { ...chat, updatedAt: Date.now() }
            : chat
        );
      }, { revalidate: false });

      const previousModel = selectedModel;
      setSelectedModel(newModelId);
      
      if (conversationId) {
        await handleAIResponseWithModel(conversationId, newModelId);
      }
      
      setSelectedModel(previousModel);
    } catch (error) {
      console.error("Failed to regenerate assistant message", error);
      mutateInitialMessages();
    }
  };

  const handleAIResponseWithModel = async (chatId: string, modelId: string) => {
    const tempId: string = `ai-${Date.now()}`;

    try {
      const streamingMessage: Message = {
        id: tempId,
        role: MESSAGE_ROLE_ASSISTANT,
        content: "",
        createdAt: Date.now(),
        isStreaming: true,
        model: modelId
      };
      setTempMessages((prev) => [...prev, streamingMessage]);

      const response = await fetch(`/api/chats/${chatId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelId,
        }),
      });

      if (!response.ok || !response.body) {
        // New chats can hit a tiny race while cache-backed writes flush to DB.
        // Retry once shortly after for 404/409 type transient states.
        if ((response.status === 404 || response.status === 409) && !chatId.startsWith("chat-")) {
          await new Promise((r) => setTimeout(r, 350));
          const retry = await fetch(`/api/chats/${chatId}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: modelId,
            }),
          });
          if (retry.ok && retry.body) {
            const reader = retry.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessageContent = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                setTempMessages((prev) =>
                  prev.map(m => m.id === tempId ? { ...m, isStreaming: false } : m)
                );
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              assistantMessageContent += chunk;
              setTempMessages((prev) =>
                prev.map(m =>
                  m.id === tempId
                    ? { ...m, content: assistantMessageContent, isStreaming: true }
                    : m
                )
              );
            }

            await mutateInitialMessages();
            mutate("/api/chats");

            return;
          }
        }

        const errText = await response.text().catch(() => "");
        throw new Error(`Failed to generate response (${response.status}) ${errText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          finalizeTempAssistant(tempId, assistantMessageContent);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantMessageContent += chunk;

        setTempMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, content: assistantMessageContent, isStreaming: true }
              : m
          )
        );
      }

      await mutateInitialMessages();
      mutate("/api/chats", async (currentChats: Chat[] | undefined) => {
        if (!currentChats) return currentChats;
        return currentChats.map((chat) =>
          chat.id === chatId
            ? { ...chat, updatedAt: Date.now() }
            : chat
        );
      }, { revalidate: false });

    } catch (e) {
      console.error("AI response failed", e);
      setTempMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, isStreaming: false, content: "Response failed to generate. Please try again." }
            : m
        )
      );
    }
  };

  const handleNewConversation = () => {
    router.push("/chat");
  };

  const handleSelectConversation = (conversation: Conversation) => {
    router.push(`/chat/${conversation.id}`);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const conversations: Conversation[] = useMemo(() => {
    return (chats || []).map(chat => ({
      id: chat.id,
      title: chat.title || "New Chat",
      preview: chat.preview || "No messages yet",
      timestamp: new Date(chat.updatedAt || 0),
    }));
  }, [chats]);

  const user = session?.user
    ? {
      name: session.user.name || session.user.email?.split("@")[0] || "User",
      email: session.user.email || undefined,
      avatar: session.user.image || undefined,
      avatarFallback: session.user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    }
    : {
      name: "User",
      email: undefined,
      avatar: undefined,
      avatarFallback: "U",
      nameFallback: "User"
    };


  const handleArchive = async (chatId: string) => {
    mutate("/api/chats", (currentChats: Chat[] | undefined) => {
      return currentChats?.filter(c => c.id !== chatId) || [];
    }, { revalidate: false });

    try {
      await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      mutate("/api/chats");
    } catch (e) {
      console.error("Failed to archive chat", e);
      mutate("/api/chats");
    }
  };

  const handleDelete = async (chatId: string) => {
    mutate("/api/chats", (currentChats: Chat[] | undefined) => {
      return currentChats?.filter(c => c.id !== chatId) || [];
    }, { revalidate: false });

    if (conversationId === chatId) {
      router.push("/chat");
    }

    try {
      await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });
      mutate("/api/chats");
    } catch (e) {
      console.error("Failed to delete chat", e);
      mutate("/api/chats");
    }
  };

  return (
    <div
      className="relative flex min-h-[100svh] h-[100dvh] overflow-hidden bg-background font-sans"
      style={visualViewportHeight ? { height: `${Math.round(visualViewportHeight)}px` } : undefined}
    >
      {/* Sidebar Toggle (Mobile/Collapsed) */}
      {sidebarCollapsed && (
        <div className="absolute left-4 top-4 z-50">
          <SidebarToggle
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      )}
      
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        className="h-full border-r border-border/50 bg-secondary/10"
      >
        <SidebarHeader className="flex justify-between items-center px-4 pt-4 pb-2">
           {!sidebarCollapsed && (
             <div className="flex w-full items-center justify-between">
                <Button 
                    onClick={handleNewConversation}
                    variant="outline" 
                    className="w-full justify-start gap-2 border-dashed border-border hover:bg-muted/50"
                >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">New Chat</span>
                </Button>
             </div>
           )}
           <SidebarToggle
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={cn("ml-2", sidebarCollapsed && "hidden")}
           />
        </SidebarHeader>

        <SidebarContent className="px-2 py-2">
          {!sidebarCollapsed ? (
            isLoadingChats || !chats ? (
              <ConversationListSkeleton />
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={conversationId}
                onSelect={handleSelectConversation}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-2 pt-4">
               <Button
                  onClick={handleNewConversation}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
               >
                 <Plus className="h-4 w-4" />
               </Button>
            </div>
          )}
        </SidebarContent>

        <SidebarFooter>
          <UserMenu
            user={user}
            collapsed={sidebarCollapsed}
            onSettings={() => setIsSettingsOpen(true)}
            onSignOut={handleSignOut}
          />
        </SidebarFooter>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col h-full relative">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 border-b border-border/30 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
             {!modelsData ? (
                <ModelSelectorSkeleton />
                ) : (
                <ModelSelector
                    selectedModelId={selectedModel}
                    onModelChange={setSelectedModel}
                />
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Right side header items (share, etc.) could go here */}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide" ref={messagesContainerRef}>
          <div className="max-w-3xl mx-auto w-full h-full flex flex-col px-4 sm:px-6">
              {!conversationId && messages.length === 0 ? (
                <NewChatPage
                  onModelSelect={setSelectedModel}
                  userName={user.name}
                />
              ) : (
                <div style={{ paddingBottom: `calc(10rem + ${keyboardInset}px)` }}>
                <MessageList 
                  className="pb-40 sm:pb-44 pt-5 sm:pt-6" // Extra bottom padding so composer never overlaps message actions
                  messages={messages}
                  isLoadingOlder={isLoadingOlder}
                  hasMore={hasMore}
                  onScrollNearTop={loadOlderMessages}
                  availableModels={availableModels}
                  onRegenerate={handleRegenerate}
                  onRegenerateWithModel={handleRegenerateAssistant}
                  getProviderIcon={(message) => {
                    if (message.role === MESSAGE_ROLE_USER || !message.model) return undefined;

                    const model = availableModels.find(m => m.id === message.model);
                    if (!model) return undefined;

                    const config = getProviderConfig(model.provider);
                    const Icon = config.icon;

                    if (config.logoUrl) {
                      return (
                        <Image
                          src={config.logoUrl}
                          alt={config.displayName}
                          width={14}
                          height={14}
                          className="object-contain"
                          unoptimized
                        />
                      );
                    }

                    return <Icon className={cn("h-4 w-4", config.color)} />;
                  }}
                />
                </div>
              )}
          </div>
        </div>

        {/* Message Composer - Fixed Bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20"
          style={{
            transform: keyboardInset ? `translateY(-${keyboardInset}px)` : undefined,
            transition: "transform 180ms ease",
          }}
        >
             <MessageComposer
                onSend={handleSend}
                placeholder="Ask anything..."
                autoFocus
                className="bg-transparent border-t-0 pb-6"
             />
        </div>
      </div>

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
}
