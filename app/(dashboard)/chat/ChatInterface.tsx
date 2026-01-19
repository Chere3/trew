"use client";

import { useState } from "react";
import { MessageList, MessageBubble } from "@/components/chat";
import { MessageComposer } from "@/components/input/MessageComposer";
import { ModelSelector } from "@/components/input/ModelSelector";
import { NewChatPage } from "@/components/chat/NewChatPage";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarToggle
} from "@/components/navigation";
import { ConversationList, type Conversation } from "@/components/navigation/ConversationList";
import { UserMenu } from "@/components/user/UserMenu";
import { SettingsDialog } from "@/components/user/SettingsDialog";
import { useSession } from "@/lib/auth-client";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Mock conversations data - will be replaced with real data later
const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "New Conversation",
    preview: "Start a new conversation...",
    timestamp: new Date("2024-01-01T12:00:00"),
  },
  {
    id: "2",
    title: "React Best Practices",
    preview: "What are the best practices for...",
    timestamp: new Date("2024-01-01T10:00:00"),
  },
  {
    id: "3",
    title: "TypeScript Tips",
    preview: "Can you explain type guards?",
    timestamp: new Date("2023-12-31T15:00:00"),
  },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>("1");
  const [selectedModel, setSelectedModel] = useState("gpt-5o");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSend = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // TODO: Add AI response handling here
    // For now, we'll just add a placeholder assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "This is a placeholder response. AI integration will be added here.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  const handleNewConversation = () => {
    // TODO: Create new conversation
    const newId = `conv-${Date.now()}`;
    setSelectedChatId(newId);
    setMessages([]);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedChatId(conversation.id);
    // TODO: Load conversation messages
    setMessages([]);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

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
    };

  return (
    <div className="flex h-screen bg-secondary/30">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        className="h-full border-r-0 bg-transparent"
      >
        <SidebarHeader>
          {!sidebarCollapsed && (
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
              Conversations
            </span>
          )}
          <SidebarToggle
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </SidebarHeader>

        <SidebarContent>
          {!sidebarCollapsed ? (
            <ConversationList
              conversations={mockConversations}
              selectedId={selectedChatId}
              onSelect={handleSelectConversation}
              onNew={handleNewConversation}
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
        <div className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            <NewChatPage
              onModelSelect={setSelectedModel}
              userName={user.name}
            />
          ) : (
            <MessageList className="h-full">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  onCopy={() => {
                    navigator.clipboard.writeText(message.content);
                  }}
                />
              ))}
            </MessageList>
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
