"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  PanelLeft,
  Edit3,
  ArrowUp,
  Paperclip,
  Globe,
  Cloud,
  Image as ImageIcon,
  Info,
  Wand2,
  Megaphone,
  Search,
  FileText,
  Code as CodeIcon,
  Sparkles,
  Loader2,
  Settings,
  Check,
  Copy,
  RotateCcw,
  AlertTriangle,
  Download,
  Share2,
  Pin,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getProviderConfig } from "@/lib/models/providers";
import { MarkdownRenderer } from "@/components/media/MarkdownRenderer";
import { POC_MODELS, type PocModel } from "./poc-models";

const POC_AUTOROUTE_ENDPOINT = "/api/poc/autoroute";
const POC_CHAT_ENDPOINT = "/api/poc/chat";

interface PocAutorouteResponse {
  selectedModelId: string;
  modelName: string;
  provider?: string;
  category: string;
  confidence: number;
  reasoning?: string;
  classifier?: "ai" | "heuristic" | "ai-fallback";
  offline?: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  routing?: PocAutorouteResponse | null;
  modelId?: string;
  modelName?: string;
  provider?: string;
  error?: string;
}

const CLASSIFIER_LABEL: Record<
  NonNullable<PocAutorouteResponse["classifier"]>,
  string
> = {
  ai: "AI classifier",
  heuristic: "Heuristic classifier",
  "ai-fallback": "Heuristic (AI key failed)",
};

interface SidebarSection {
  id: string;
  label: string;
  defaultOpen?: boolean;
  items?: { id: string; label: string }[];
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: "pinned",
    label: "Pinned",
    defaultOpen: true,
    items: [{ id: "pinned-1", label: "adapta este mensaje para que s..." }],
  },
  { id: "scheduled", label: "Scheduled for Deletion" },
  { id: "today", label: "Today" },
  { id: "7days", label: "Previous 7 Days" },
  { id: "30days", label: "Previous 30 Days" },
  { id: "older", label: "Older" },
];

interface QuickAction {
  id: string;
  label: string;
  icon: typeof Megaphone;
  prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "communicate",
    label: "Communicate",
    icon: Megaphone,
    prompt: "Help me draft a clear, friendly announcement for my team.",
  },
  {
    id: "find",
    label: "Find Content",
    icon: Search,
    prompt: "Find relevant information about ",
  },
  {
    id: "analyse",
    label: "Analyse Text",
    icon: FileText,
    prompt: "Analyse the following text and summarise key insights:\n\n",
  },
  {
    id: "code",
    label: "Code",
    icon: CodeIcon,
    prompt: "Write a TypeScript function that ",
  },
];

export function PocInterface() {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SIDEBAR_SECTIONS.map((s) => [s.id, !!s.defaultOpen]))
  );
  const [prompt, setPrompt] = useState("");
  const [pinnedModel, setPinnedModel] = useState<PocModel | null>(null);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleQuickAction = (q: QuickAction) => setPrompt(q.prompt);

  const resolveModel = async (
    text: string
  ): Promise<{
    modelId: string;
    modelName: string;
    provider?: string;
    routing: PocAutorouteResponse | null;
  }> => {
    if (pinnedModel) {
      return {
        modelId: pinnedModel.id,
        modelName: pinnedModel.name,
        provider: pinnedModel.provider,
        routing: null,
      };
    }
    const res = await fetch(POC_AUTOROUTE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Autoroute failed (${res.status})`);
    }
    const data = (await res.json()) as PocAutorouteResponse;
    return {
      modelId: data.selectedModelId,
      modelName: data.modelName,
      provider: data.provider,
      routing: data,
    };
  };

  const streamReply = async (
    assistantId: string,
    modelId: string,
    history: ChatMessage[]
  ) => {
    const apiMessages = history
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch(POC_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: modelId, messages: apiMessages }),
    });

    if (!res.ok || !res.body) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Chat failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: acc } : m
        )
      );
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, isStreaming: false } : m
      )
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = prompt.trim();
    if (!text || busy) return;

    const userId = `u-${Date.now()}`;
    const assistantId = `a-${Date.now()}`;
    const userMsg: ChatMessage = { id: userId, role: "user", content: text };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setBusy(true);

    try {
      const route = await resolveModel(text);

      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
        routing: route.routing,
        modelId: route.modelId,
        modelName: route.modelName,
        provider: route.provider,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      await streamReply(assistantId, route.modelId, [...messages, userMsg]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === assistantId);
        if (exists) {
          return prev.map((m) =>
            m.id === assistantId
              ? { ...m, isStreaming: false, error: message }
              : m
          );
        }
        return [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            error: message,
          },
        ];
      });
    } finally {
      setBusy(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setPrompt("");
  };

  const pickAuto = () => {
    setPinnedModel(null);
    setModelPickerOpen(false);
  };

  const pickModel = (m: PocModel) => {
    setPinnedModel(m);
    setModelPickerOpen(false);
  };

  const userInitials = "U";

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#101113] text-[#c1c2c5]">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-white/5 bg-[#101113] transition-[width] duration-200",
          collapsed ? "w-0 overflow-hidden" : "w-[300px]"
        )}
      >
        <div className="flex items-center gap-2 px-4 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="h-10 w-10 text-[#a6a7ab] hover:bg-white/5"
            aria-label="Collapse sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            className="ml-auto h-10 gap-2 rounded-full bg-[#830051] px-4 text-sm font-medium text-white hover:bg-[#65003f]"
            onClick={handleNewChat}
          >
            <Edit3 className="h-4 w-4" />
            New
          </Button>
        </div>

        <div className="px-5 pb-3 pt-7 text-base font-semibold text-[#c1c2c5]">
          Chat History
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {SIDEBAR_SECTIONS.map((section) => {
            const open = !!openSections[section.id];
            return (
              <div key={section.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2.5 text-left text-sm font-semibold text-[#a6a7ab] hover:bg-white/5"
                >
                  <span>{section.label}</span>
                  {open ? (
                    <ChevronDown className="h-4 w-4 text-[#909296]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#909296]" />
                  )}
                </button>
                {open && section.items && section.items.length > 0 && (
                  <ul className="mt-0.5 space-y-0.5 pl-2">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="block w-full truncate rounded-md px-2 py-2 text-left text-sm text-[#a6a7ab] hover:bg-white/5"
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between gap-4 px-6">
          <div className="flex min-w-0 items-center gap-3">
            {collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                className="h-10 w-10 text-[#a6a7ab] hover:bg-white/5"
                aria-label="Expand sidebar"
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            )}
            {messages.length > 0 && (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-white">
                  {messages.find((m) => m.role === "user")?.content.slice(0, 60) ||
                    "New conversation"}
                </h1>
                <p className="text-xs text-[#909296]">
                  Created {new Date().toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <ChatHeaderIconButton ariaLabel="Export Chat">
                  <Download className="h-5 w-5" />
                </ChatHeaderIconButton>
                <ChatHeaderIconButton ariaLabel="Share Chat">
                  <Share2 className="h-5 w-5" />
                </ChatHeaderIconButton>
                <ChatHeaderIconButton ariaLabel="Pin Chat">
                  <Pin className="h-5 w-5" />
                </ChatHeaderIconButton>
                <span className="mx-1 h-6 w-px bg-white/10" />
              </>
            )}
            <Button
              variant="outline"
              className="h-10 rounded-full border-white/10 bg-transparent px-5 text-sm text-[#c1c2c5] hover:bg-white/5"
            >
              Feedback
            </Button>
            <Avatar className="h-10 w-10 ring-1 ring-white/10">
              <AvatarFallback className="bg-[#f5c652] text-sm font-semibold text-black">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main content: hero (empty state) or message list, with anchored composer */}
        <main className="flex min-h-0 flex-1 flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4">
              <div className="flex w-full max-w-3xl flex-col items-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-[#830051]/20 ring-1 ring-[#830051]/40">
                  <Wand2 className="h-7 w-7 text-[#da338c]" />
                </div>
                <h1 className="flex items-center gap-3 text-5xl font-semibold tracking-tight text-white">
                  Autorouter
                  <ChevronDown className="h-7 w-7 text-[#909296]" />
                </h1>
                <p className="mt-5 max-w-xl text-center text-base leading-relaxed text-[#909296]">
                  Intelligent model manager that classifies your prompt and
                  routes it to the best available model.
                </p>
                <p className="mt-2 text-center text-sm font-medium text-[#5c5f66]">
                  Proof of concept
                </p>

                <Composer
                  className="mt-10 w-full"
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onSubmit={handleSubmit}
                  busy={busy}
                  modelPickerOpen={modelPickerOpen}
                  setModelPickerOpen={setModelPickerOpen}
                  pinnedModel={pinnedModel}
                  pickAuto={pickAuto}
                  pickModel={pickModel}
                />

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  {QUICK_ACTIONS.map((q) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleQuickAction(q)}
                        className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-[#1a1b1e] px-5 text-sm text-[#c1c2c5] transition hover:border-white/20 hover:bg-[#25262b]"
                      >
                        <Icon className="h-4 w-4 text-[#909296]" />
                        {q.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
                  {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="bg-[#101113] px-4 pb-6 pt-2">
                <div className="mx-auto w-full max-w-3xl">
                  <Composer
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onSubmit={handleSubmit}
                    busy={busy}
                    modelPickerOpen={modelPickerOpen}
                    setModelPickerOpen={setModelPickerOpen}
                    pinnedModel={pinnedModel}
                    pickAuto={pickAuto}
                    pickModel={pickModel}
                  />
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-center px-6 pb-4 text-xs text-[#5c5f66]">
          <span>AI-generated responses may be inaccurate or unreliable.</span>
        </footer>
      </div>
    </div>
  );
}

function IconChip({
  children,
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "flex h-9 items-center justify-center rounded-full bg-[#25262b] px-2.5 text-[#a6a7ab] hover:bg-[#2c2e33]",
        className
      )}
    >
      {children}
    </button>
  );
}

function ChatHeaderIconButton({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25262b] text-[#c1c2c5] transition hover:bg-[#2c2e33]"
    >
      {children}
    </button>
  );
}

function MessageActionButton({
  children,
  ariaLabel,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full text-[#909296] transition hover:bg-[#25262b] hover:text-[#c1c2c5]"
    >
      {children}
    </button>
  );
}

function ModelPicker({
  open,
  onOpenChange,
  pinnedModel,
  onPickAuto,
  onPickModel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinnedModel: PocModel | null;
  onPickAuto: () => void;
  onPickModel: (m: PocModel) => void;
}) {
  const providerConfig = pinnedModel
    ? getProviderConfig(pinnedModel.provider)
    : null;

  const label = pinnedModel ? pinnedModel.name : "Auto";

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-full bg-[#25262b] px-3 text-sm text-[#c1c2c5] hover:bg-[#2c2e33]"
          title={
            pinnedModel
              ? `Pinned: ${pinnedModel.name}`
              : "Auto-router (intelligent model selection)"
          }
        >
          {providerConfig?.logoUrl ? (
            <Image
              src={providerConfig.logoUrl}
              alt={providerConfig.displayName}
              width={16}
              height={16}
              className="object-contain"
              unoptimized
            />
          ) : (
            <Wand2 className="h-4 w-4 text-[#da338c]" />
          )}
          <span className="font-medium">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#909296]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-[360px] rounded-xl border border-[#373a40] bg-[#1a1b1e] p-0 text-[#c1c2c5] shadow-lg"
      >
        <div className="px-4 pb-2 pt-4 text-sm font-semibold text-[#c1c2c5]">
          Models ({POC_MODELS.length + 1})
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          <button
            type="button"
            onClick={onPickAuto}
            className={cn(
              "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#25262b]",
              !pinnedModel && "bg-[#25262b]/60"
            )}
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#830051]/20 ring-1 ring-[#830051]/40">
              <Wand2 className="h-4 w-4 text-[#da338c]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-base font-semibold text-white">Auto</span>
                {!pinnedModel && (
                  <Check className="h-4 w-4 text-[#da338c]" />
                )}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-[#909296]">
                Smart routing — classifies your prompt and picks the best model
                from the catalogue.
              </span>
            </span>
          </button>
          <div className="mx-4 my-1 border-t border-[#25262b]" />
          {POC_MODELS.map((m) => {
            const cfg = getProviderConfig(m.provider);
            const selected = pinnedModel?.id === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onPickModel(m)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#25262b]",
                  selected && "bg-[#25262b]/60"
                )}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
                  {cfg.logoUrl ? (
                    <Image
                      src={cfg.logoUrl}
                      alt={cfg.displayName}
                      width={20}
                      height={20}
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <Sparkles className="h-4 w-4 text-[#909296]" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {m.name}
                    </span>
                    {selected && (
                      <Check className="h-4 w-4 text-[#da338c]" />
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-[#909296]">
                    {m.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 border-t border-[#25262b] px-4 py-3 text-sm text-[#a6a7ab]">
          <Settings className="h-4 w-4" />
          <span>Change default model…</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Composer({
  className,
  prompt,
  setPrompt,
  onSubmit,
  busy,
  modelPickerOpen,
  setModelPickerOpen,
  pinnedModel,
  pickAuto,
  pickModel,
}: {
  className?: string;
  prompt: string;
  setPrompt: (v: string) => void;
  onSubmit: (e?: React.FormEvent) => void | Promise<void>;
  busy: boolean;
  modelPickerOpen: boolean;
  setModelPickerOpen: (v: boolean) => void;
  pinnedModel: PocModel | null;
  pickAuto: () => void;
  pickModel: (m: PocModel) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "rounded-2xl border border-white/10 bg-[#1a1b1e] shadow-lg",
        className
      )}
    >
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask anything..."
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        className="block w-full resize-none bg-transparent px-5 pt-5 text-base text-[#c1c2c5] placeholder:text-[#5c5f66] focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-2 px-3 pb-3 pt-2">
        <ModelPicker
          open={modelPickerOpen}
          onOpenChange={setModelPickerOpen}
          pinnedModel={pinnedModel}
          onPickAuto={pickAuto}
          onPickModel={pickModel}
        />
        <IconChip ariaLabel="Attach files">
          <Paperclip className="h-4 w-4" />
        </IconChip>
        <IconChip className="gap-1.5 px-3" ariaLabel="Web Search">
          <Globe className="h-4 w-4" />
          <span className="text-sm text-[#a6a7ab]">Off</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#909296]" />
        </IconChip>
        <IconChip className="gap-1.5 px-3" ariaLabel="OneDrive">
          <Cloud className="h-4 w-4" />
          <span className="text-sm text-[#a6a7ab]">Connected</span>
        </IconChip>
        <IconChip ariaLabel="Teams transcript">
          <Users className="h-4 w-4" />
        </IconChip>
        <IconChip ariaLabel="Image generation">
          <ImageIcon className="h-4 w-4" />
        </IconChip>
        <IconChip ariaLabel="Feature guidelines">
          <Info className="h-4 w-4" />
        </IconChip>
        <div className="ml-auto flex items-center gap-2">
          <IconChip ariaLabel="Enhance prompt">
            <Wand2 className="h-4 w-4" />
          </IconChip>
          <button
            type="submit"
            disabled={!prompt.trim() || busy}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#830051] text-white transition hover:bg-[#65003f] disabled:opacity-40"
            aria-label="Send Message"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const stamp = new Date().toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-[#5c5f66]">{stamp}</span>
        <div className="max-w-[85%] whitespace-pre-wrap text-right text-base leading-relaxed text-[#c1c2c5]">
          {message.content}
        </div>
      </div>
    );
  }

  const providerCfg = message.provider
    ? getProviderConfig(message.provider)
    : null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-[#5c5f66]">{stamp}</span>
      {(message.routing || message.modelName) && (
        <RoutingChip message={message} />
      )}
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25262b]">
          {providerCfg?.logoUrl ? (
            <Image
              src={providerCfg.logoUrl}
              alt={providerCfg.displayName}
              width={28}
              height={28}
              className="object-contain"
              unoptimized
            />
          ) : (
            <Sparkles className="h-5 w-5 text-[#da338c]" />
          )}
        </div>
        <div className="min-w-0 flex-1 text-base leading-relaxed text-[#c1c2c5]">
          {message.error ? (
            <span className="text-red-300">Error: {message.error}</span>
          ) : message.content ? (
            <>
              <MarkdownRenderer
                content={message.content}
                className="poc-markdown text-[#c1c2c5]"
              />
              {message.isStreaming && (
                <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-[#da338c] align-middle" />
              )}
            </>
          ) : (
            <span className="text-[#5c5f66]">Thinking…</span>
          )}
        </div>
      </div>
      {!message.isStreaming && !message.error && message.content && (
        <div className="ml-16 mt-1 flex items-center gap-1">
          <MessageActionButton
            ariaLabel="Copy response"
            onClick={() => navigator.clipboard?.writeText(message.content)}
          >
            <Copy className="h-4 w-4" />
          </MessageActionButton>
          <MessageActionButton ariaLabel="Report response">
            <AlertTriangle className="h-4 w-4" />
          </MessageActionButton>
          <MessageActionButton ariaLabel="Retry response">
            <RotateCcw className="h-4 w-4" />
          </MessageActionButton>
        </div>
      )}
    </div>
  );
}

function RoutingChip({ message }: { message: ChatMessage }) {
  const routing = message.routing;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-[#909296]">
      {routing ? (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#830051]/15 px-2.5 py-1 text-[#da338c] ring-1 ring-[#830051]/30">
            <Wand2 className="h-3 w-3" />
            Auto
          </span>
          <span>routed to</span>
          <span className="font-medium text-[#c1c2c5]">
            {message.modelName}
          </span>
          <span className="text-[#5c5f66]">·</span>
          <span className="capitalize">
            {routing.category.replace("_", " ")}
          </span>
          <span className="text-[#5c5f66]">·</span>
          <span>{Math.round(routing.confidence * 100)}% confidence</span>
          {routing.classifier && routing.classifier !== "ai" && (
            <span
              className="rounded-full bg-[#25262b] px-2 py-0.5 text-[#909296]"
              title={routing.reasoning}
            >
              {routing.classifier === "heuristic"
                ? "heuristic"
                : "heuristic (AI fallback)"}
            </span>
          )}
        </>
      ) : (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25262b] px-2.5 py-1 text-[#a6a7ab]">
            <Sparkles className="h-3 w-3" />
            Pinned
          </span>
          <span className="font-medium text-[#c1c2c5]">
            {message.modelName}
          </span>
        </>
      )}
    </div>
  );
}
