"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { MessageList, MessageBubble } from "@/components/chat";
import { MessageComposer } from "@/components/input/MessageComposer";
import { ModelSelector, AVAILABLE_MODELS, type Model } from "@/components/input/ModelSelector";
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

interface ChatData {
  messages: Message[];
  hasMore?: boolean;
  nextCursor?: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ChatInterface() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AUTO_MODEL_ID);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
  const { data: initialChatData, mutate: mutateInitialMessages } = useSWR<ChatData>(
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

  // Initialize messages when chat changes or initial data loads
  useEffect(() => {
    if (conversationId && initialChatData) {
      const msgs = initialChatData.messages || [];
      
      if (conversationId !== lastInitializedChatId.current) {
        // Chat changed: replace all messages
        setLoadedMessages(msgs);
        setHasMore(initialChatData.hasMore || false);
        setOldestCursor(initialChatData.nextCursor || null);
        // Preserve streaming messages when initializing a new chat
        // This prevents clearing the typing indicator/streaming message on first message
        setTempMessages((prev) => {
          // Keep only streaming messages (assistant messages with isStreaming=true)
          const streamingMessages = prev.filter(m => m.isStreaming && m.role === MESSAGE_ROLE_ASSISTANT);
          return streamingMessages;
        });
        lastInitializedChatId.current = conversationId;
      } else {
        // Same chat: update loadedMessages with new messages from initialChatData
        // This handles the case where mutateInitialMessages() updates initialChatData
        // after a new message is saved to the DB
        setLoadedMessages((prev) => {
          if (msgs.length === 0) return prev;
          
          // Check if initialChatData has newer messages
          const prevNewestId = prev.length > 0 ? prev[prev.length - 1]?.id : null;
          const newNewestId = msgs[msgs.length - 1]?.id;
          
          if (prevNewestId && newNewestId && prevNewestId !== newNewestId) {
            // New messages detected: replace with initialChatData
            // initialChatData contains the most recent messages, so we use it
            // This may lose older paginated messages, but they can be reloaded by scrolling
            // Remove messages from tempMessages that are now in loadedMessages
            // This prevents duplicates when messages move from temp to loaded
            setTempMessages((prev) => {
              const loadedMessageIds = new Set(msgs.map(m => m.id));
              const filtered = prev.filter(m => {
                // Keep streaming messages (they're not in loadedMessages yet)
                if (m.isStreaming && m.role === MESSAGE_ROLE_ASSISTANT) return true;
                // Remove messages that are now in loadedMessages
                return !loadedMessageIds.has(m.id);
              });
              return filtered;
            });
            return msgs;
          } else if (prev.length === 0) {
            // No previous messages: use new messages
            // Remove messages from tempMessages that are now in loadedMessages
            setTempMessages((prev) => {
              const loadedMessageIds = new Set(msgs.map(m => m.id));
              const filtered = prev.filter(m => {
                if (m.isStreaming && m.role === MESSAGE_ROLE_ASSISTANT) return true;
                return !loadedMessageIds.has(m.id);
              });
              return filtered;
            });
            return msgs;
          } else {
            // Messages are the same: keep prev to preserve any paginated older messages
            return prev;
          }
        });
        setHasMore(initialChatData.hasMore || false);
        setOldestCursor(initialChatData.nextCursor || null);
      }
    } else if (!conversationId) {
      setLoadedMessages([]);
      setHasMore(false);
      setOldestCursor(null);
      setTempMessages([]);
      lastInitializedChatId.current = undefined;
    }
  }, [initialChatData, conversationId]);

  // Combine loaded messages with temp messages (optimistic/streaming)
  const messages = [...loadedMessages, ...tempMessages];

  // Load older messages when scrolling near top
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
        // Prepend older messages to the beginning
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

  // Scroll detection for loading older messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      // Load more when within 200px of top
      if (scrollTop < 200 && hasMore && !isLoadingOlderRef.current) {
        loadOlderMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadOlderMessages, hasMore]);

  // Auto-scroll user message to top when sent
  // Note: This is now fully handled in MessageList component, so we disable this fallback
  // to avoid conflicts with MessageList's scroll calculations
  // useEffect(() => {
  //   if (!messages.length) return;

  //   const lastMsg = messages[messages.length - 1];

  //   // Check if it's a user message and new
  //   if (lastMsg.role === MESSAGE_ROLE_USER && lastMsg.id !== lastUserMessageIdRef.current) {
  //     lastUserMessageIdRef.current = lastMsg.id;

  //     // Use requestAnimationFrame to ensure virtualizer has rendered
  //     requestAnimationFrame(() => {
  //       requestAnimationFrame(() => {
  //         requestAnimationFrame(() => {
  //           const container = messagesContainerRef.current;
  //           const element = document.getElementById(`message-${lastMsg.id}`);
  //           if (container && element) {
  //             // Calculate the position to scroll: user message at top of visible area
  //             const containerRect = container.getBoundingClientRect();
  //             const elementRect = element.getBoundingClientRect();
  //             const relativeTop = elementRect.top - containerRect.top + container.scrollTop;
              
  //             // Scroll so the user message is at the top of the container
  //             // This reserves space below for the assistant message
  //             container.scrollTo({
  //               top: relativeTop,
  //               behavior: 'smooth'
  //             });
  //           }
  //         });
  //       });
  //     });
  //   }
  // }, [messages]);

  // Set selected model from last assistant message only when switching chats
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

  // Helper function to convert File to base64 data URL
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

    // Convert files to base64 for storage
    const attachments = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        url: await fileToBase64(file),
        type: file.type
      }))
    );

    const now = Date.now();

    // Optimistic update for message list
    const tempId = `temp-${now}`;
    const userMessage: Message = {
      id: tempId,
      role: "user",
      content: content.trim(),
      createdAt: now,
      attachments
    };

    // If no chat selected, create new chat
    if (!conversationId) {
      try {
        const res = await fetch(API_ENDPOINTS.CHATS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            attachments
          }),
        });

        if (res.ok) {
          const newChat = await res.json();
          await mutate("/api/chats"); // Refresh chat list
          // Navigate to the new chat URL
          router.push(`/chat/${newChat.id}`);
          // SWR will automatically fetch the new chat data
          // Trigger AI response after a short delay to allow data to load
          setTimeout(() => handleAIResponse(newChat.id), 100);
        }
      } catch (error) {
        console.error("Failed to create chat", error);
      }
      return;
    }

    // Existing chat: Optimistically update UI with temp message
    setTempMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch(`/api/chats/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: content,
          attachments
        }),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        // Replace temp message with saved message
        setTempMessages((prev) => 
          prev.map(m => m.id === tempId ? { ...savedMessage, isStreaming: false } : m)
        );
        // Refresh initial data to get updated messages
        mutateInitialMessages();
        mutate(API_ENDPOINTS.CHATS); // Update chat preview in sidebar

        // Trigger AI response immediately
        if (conversationId) {
          handleAIResponse(conversationId);
        }

      } else {
        // Rollback on error
        setTempMessages((prev) => prev.filter(m => m.id !== tempId));
      }
    } catch (error) {
      console.error("Failed to send message", error);
      setTempMessages((prev) => prev.filter(m => m.id !== tempId));
    }
  };

  const handleAIResponse = async (chatId: string) => {
    // 1. Create a temporary ID for the AI response
    const tempId = `ai-${Date.now()}`;

    try {
      // 2. Immediately add an empty "streaming" assistant message
      // This triggers the TypingIndicator because content is empty and isStreaming is true
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
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Stream finished, mark isStreaming as false
          setTempMessages((prev) =>
            prev.map(m =>
              m.id === tempId ? { ...m, isStreaming: false } : m
            )
          );
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantMessageContent += chunk;

        // Update the streaming message
        setTempMessages((prev) =>
          prev.map(m =>
            m.id === tempId
              ? { ...m, content: assistantMessageContent, isStreaming: true }
              : m
          )
        );
      }

      // Final revalidation to sync with DB
      // Refresh initial data to get the saved message
      await mutateInitialMessages();
      mutate("/api/chats");

      // Remove temp message after a short delay to allow DB sync
      setTimeout(() => {
        setTempMessages((prev) => prev.filter(m => m.id !== tempId));
      }, 500);
    } catch (e) {
      console.error("AI response failed", e);
      // Remove the temp message on error
      setTempMessages((prev) => prev.filter(m => m.id !== tempId));
    }
  };

  const handleRegenerate = async (messageId: string) => {
    if (!conversationId) return;

    try {
      // Find message index in combined messages
      const messageIndex = messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;

      // Separate loaded and temp messages
      const loadedCount = loadedMessages.length;
      const messageInLoaded = messageIndex < loadedCount;

      if (messageInLoaded) {
        // Message is in loaded messages - keep up to this message
        const messagesToKeep = loadedMessages.slice(0, messageIndex + 1);
        setLoadedMessages(messagesToKeep);
        setTempMessages([]);
      } else {
        // Message is in temp messages - remove all temp messages after this point
        const tempIndex = messageIndex - loadedCount;
        setTempMessages((prev) => prev.slice(0, tempIndex + 1));
      }

      // Delete messages from database
      const res = await fetch(`/api/chats/${conversationId}/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete messages");
      }

      // Revalidate to sync with DB
      await mutateInitialMessages();
      mutate("/api/chats");

      // Trigger new AI response
      if (conversationId) {
        handleAIResponse(conversationId);
      }
    } catch (error) {
      console.error("Failed to regenerate", error);
      // Revalidate on error
      mutateInitialMessages();
    }
  };

  const handleRegenerateAssistant = async (assistantMessageId: string, newModelId: string) => {
    if (!conversationId) return;

    try {
      // Find the assistant message and the user message before it
      const assistantIndex = messages.findIndex(m => m.id === assistantMessageId);
      if (assistantIndex === -1) return;

      // Find the user message that triggered this assistant response
      // (the last user message before this assistant message)
      let userMessageIndex = -1;
      for (let i = assistantIndex - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          userMessageIndex = i;
          break;
        }
      }

      if (userMessageIndex === -1) return;

      // Separate loaded and temp messages
      const loadedCount = loadedMessages.length;
      const userMessageInLoaded = userMessageIndex < loadedCount;

      if (userMessageInLoaded) {
        // User message is in loaded messages - keep up to this message
        const messagesToKeep = loadedMessages.slice(0, userMessageIndex + 1);
        setLoadedMessages(messagesToKeep);
        setTempMessages([]);
      } else {
        // User message is in temp messages - remove all temp messages after this point
        const tempIndex = userMessageIndex - loadedCount;
        setTempMessages((prev) => prev.slice(0, tempIndex + 1));
      }

      // Delete the assistant message and any subsequent messages from database
      const res = await fetch(`/api/chats/${conversationId}/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: assistantMessageId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete messages");
      }

      // Revalidate to sync with DB
      await mutateInitialMessages();
      mutate("/api/chats");

      // Trigger new AI response with the selected model
      const previousModel = selectedModel;
      setSelectedModel(newModelId);
      
      // Use handleAIResponse but with the new model
      if (conversationId) {
        await handleAIResponseWithModel(conversationId, newModelId);
      }
      
      // Restore previous model selection
      setSelectedModel(previousModel);
    } catch (error) {
      console.error("Failed to regenerate assistant message", error);
      // Revalidate on error
      mutateInitialMessages();
    }
  };

  const handleAIResponseWithModel = async (chatId: string, modelId: string) => {
    // 1. Create a temporary ID for the AI response
    const tempId: string = `ai-${Date.now()}`;

    try {
      // 2. Immediately add an empty "streaming" assistant message
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
        throw new Error("Failed to generate response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Stream finished, mark isStreaming as false
          setTempMessages((prev) =>
            prev.map(m =>
              m.id === tempId ? { ...m, isStreaming: false } : m
            )
          );
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        assistantMessageContent += chunk;

        // Update the streaming message
        setTempMessages((prev) =>
          prev.map(m =>
            m.id === tempId
              ? { ...m, content: assistantMessageContent, isStreaming: true }
              : m
          )
        );
      }

      // Final revalidation to sync with DB
      // Refresh initial data to get the saved message
      await mutateInitialMessages();
      mutate("/api/chats");

      // Remove temp message after a short delay to allow DB sync
      setTimeout(() => {
        setTempMessages((prev) => prev.filter(m => m.id !== tempId));
      }, 500);
    } catch (e) {
      console.error("AI response failed", e);
      // Remove the temp message on error
      setTempMessages((prev) => prev.filter(m => m.id !== tempId));
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

  // Transform chats to Conversation interface
  const conversations: Conversation[] = (chats || []).map(chat => ({
    id: chat.id,
    title: chat.title || "New Chat",
    preview: chat.preview || "No messages yet",
    timestamp: new Date(chat.updatedAt || 0),
  }));

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
    // Optimistic update
    mutate("/api/chats", (currentChats: Chat[] | undefined) => {
      return currentChats?.filter(c => c.id !== chatId) || [];
    }, { revalidate: false });

    // API call
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      mutate("/api/chats");
    } catch (e) {
      console.error("Failed to archive chat", e);
      mutate("/api/chats"); // Revalidate on error
    }
  };

  const handleDelete = async (chatId: string) => {
    // Optimistic update
    mutate("/api/chats", (currentChats: Chat[] | undefined) => {
      return currentChats?.filter(c => c.id !== chatId) || [];
    }, { revalidate: false });

    if (conversationId === chatId) {
      router.push("/chat");
    }

    // API call
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });
      mutate("/api/chats");
    } catch (e) {
      console.error("Failed to delete chat", e);
      mutate("/api/chats"); // Revalidate on error
    }
  };

  return (
    <div className="flex h-screen bg-secondary/30 relative">
      {/* Toggle button - shown when sidebar is collapsed */}
      {sidebarCollapsed && (
        <div className="absolute left-2 top-2 z-50">
          <SidebarToggle
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      )}
      
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        className="h-full border-r-0 bg-transparent"
      >
        <SidebarHeader>
          {!sidebarCollapsed && (
            <>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
                Conversations
              </span>
              <SidebarToggle
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </>
          )}
        </SidebarHeader>

        <SidebarContent>
          {!sidebarCollapsed ? (
            <ConversationList
              conversations={conversations}
              selectedId={conversationId}
              onSelect={handleSelectConversation}
              onNew={handleNewConversation}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 p-2">
              {/* Collapsed state: show icon-only items if needed */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 my-2 mr-2 rounded-2xl bg-background shadow-sm border border-border/50 overflow-hidden">
        {/* Model Selector */}
        <ModelSelector
          selectedModelId={selectedModel}
          onModelChange={setSelectedModel}
        />

        {/* Messages */}
        <div className="flex-1 min-h-0" ref={messagesContainerRef}>
          {!conversationId && messages.length === 0 ? (
            <NewChatPage
              onModelSelect={setSelectedModel}
              userName={user.name}
            />
          ) : (
            <MessageList 
              className="h-full"
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
          )}
        </div>

        {/* Message Composer */}
        <MessageComposer
          onSend={handleSend}
          placeholder="Type your message..."
          autoFocus
        />
      </div>

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
}
