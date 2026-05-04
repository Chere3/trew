"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  PanelLeft,
  Plus,
  Send,
  Paperclip,
  Globe,
  Cloud,
  LayoutGrid,
  Image as ImageIcon,
  Mic,
  Info,
  Wand2,
  Megaphone,
  Search,
  FileText,
  Code as CodeIcon,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getProviderConfig } from "@/lib/models/providers";

const POC_AUTOROUTE_ENDPOINT = "/api/poc/autoroute";

interface PocAutorouteResponse {
  selectedModelId: string;
  modelName: string;
  provider?: string;
  category: string;
  confidence: number;
  reasoning?: string;
  offline?: boolean;
}

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
  const [routing, setRouting] = useState(false);
  const [routeResult, setRouteResult] = useState<PocAutorouteResponse | null>(
    null
  );
  const [routeError, setRouteError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRoutedPromptRef = useRef<string>("");

  const routePrompt = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed === lastRoutedPromptRef.current) return;
    lastRoutedPromptRef.current = trimmed;
    setRouting(true);
    setRouteError(null);
    try {
      const res = await fetch(POC_AUTOROUTE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Autoroute failed (${res.status})`);
      }
      const data = (await res.json()) as PocAutorouteResponse;
      setRouteResult(data);
    } catch (e) {
      setRouteError(e instanceof Error ? e.message : "Autoroute failed");
    } finally {
      setRouting(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!prompt.trim()) {
      setRouteResult(null);
      setRouteError(null);
      lastRoutedPromptRef.current = "";
      return;
    }
    debounceRef.current = setTimeout(() => {
      routePrompt(prompt);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [prompt, routePrompt]);

  const toggleSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleQuickAction = (q: QuickAction) => setPrompt(q.prompt);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;
    await routePrompt(prompt);
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
            onClick={() => {
              setPrompt("");
              setRouteResult(null);
            }}
          >
            <Plus className="h-4 w-4" />
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
        <header className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
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
          </div>
          <div className="flex items-center gap-4">
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

        {/* Centered hero + composer */}
        <main className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="flex w-full max-w-3xl flex-col items-center">
            {/* Logo tile */}
            <div className="mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-[#830051]/20 ring-1 ring-[#830051]/40">
              <Wand2 className="h-7 w-7 text-[#da338c]" />
            </div>

            <h1 className="flex items-center gap-3 text-5xl font-semibold tracking-tight text-white">
              Autorouter
              <ChevronDown className="h-7 w-7 text-[#909296]" />
            </h1>
            <p className="mt-5 max-w-xl text-center text-base leading-relaxed text-[#909296]">
              Intelligent model manager that classifies your prompt and routes
              it to the best available model.
            </p>
            <p className="mt-2 text-center text-sm font-medium text-[#5c5f66]">
              Proof of concept
            </p>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="mt-10 w-full rounded-2xl border border-white/10 bg-[#1a1b1e] shadow-lg"
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything..."
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                className="block w-full resize-none bg-transparent px-5 pt-5 text-base text-[#c1c2c5] placeholder:text-[#5c5f66] focus:outline-none"
              />
              <div className="flex items-center gap-2 px-3 pb-3 pt-2">
                <ModelBadge
                  routing={routing}
                  result={routeResult}
                  hasPrompt={!!prompt.trim()}
                />
                <IconChip>
                  <Paperclip className="h-4 w-4" />
                </IconChip>
                <IconChip className="gap-1.5 px-3">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm text-[#a6a7ab]">Off</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#909296]" />
                </IconChip>
                <IconChip>
                  <Cloud className="h-4 w-4" />
                </IconChip>
                <IconChip>
                  <LayoutGrid className="h-4 w-4" />
                </IconChip>
                <IconChip>
                  <ImageIcon className="h-4 w-4" />
                </IconChip>
                <IconChip>
                  <Info className="h-4 w-4" />
                </IconChip>
                <div className="ml-auto flex items-center gap-2">
                  <IconChip>
                    <Mic className="h-4 w-4" />
                  </IconChip>
                  <button
                    type="submit"
                    disabled={!prompt.trim() || routing}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#830051] text-white transition hover:bg-[#65003f] disabled:opacity-40"
                    aria-label="Send"
                  >
                    {routing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Autorouter status panel */}
            {(routeResult || routeError) && (
              <RouteStatus error={routeError} result={routeResult} />
            )}

            {/* Quick action buttons */}
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
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-9 items-center justify-center rounded-full bg-[#25262b] px-2.5 text-[#a6a7ab] hover:bg-[#2c2e33]",
        className
      )}
    >
      {children}
    </button>
  );
}

function ModelBadge({
  routing,
  result,
  hasPrompt,
}: {
  routing: boolean;
  result: PocAutorouteResponse | null;
  hasPrompt: boolean;
}) {
  const providerConfig = result?.provider
    ? getProviderConfig(result.provider)
    : null;

  return (
    <div
      className="flex h-9 items-center gap-2 rounded-full bg-[#25262b] px-3 text-sm text-[#c1c2c5]"
      title={
        result
          ? `Auto: routed to ${result.modelName} (${result.category}, ${Math.round(result.confidence * 100)}%)`
          : "Auto-router (intelligent model selection)"
      }
    >
      {routing ? (
        <Loader2 className="h-4 w-4 animate-spin text-[#da338c]" />
      ) : result && providerConfig?.logoUrl ? (
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
      <span className="font-medium">
        {result
          ? `Auto · ${result.modelName}`
          : hasPrompt && routing
            ? "Auto · routing…"
            : "Auto"}
      </span>
      <ChevronDown className="h-3.5 w-3.5 text-[#909296]" />
    </div>
  );
}

function RouteStatus({
  error,
  result,
}: {
  error: string | null;
  result: PocAutorouteResponse | null;
}) {
  if (error) {
    return (
      <div className="mt-4 w-full rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-300">
        Autorouter error: {error}
      </div>
    );
  }
  if (!result) return null;

  const pct = Math.round((result.confidence ?? 0) * 100);
  return (
    <div className="mt-4 flex w-full items-center gap-3 rounded-lg border border-white/10 bg-[#1a1b1e] px-4 py-2.5 text-sm text-[#a6a7ab]">
      <Sparkles className="h-4 w-4 text-[#da338c]" />
      <span className="font-medium text-[#c1c2c5]">
        {result.modelName}
      </span>
      <span className="text-[#5c5f66]">·</span>
      <span className="capitalize">{result.category.replace("_", " ")}</span>
      <span className="text-[#5c5f66]">·</span>
      <span>{pct}% confidence</span>
      {result.reasoning && (
        <span
          className="ml-auto truncate text-[#5c5f66]"
          title={result.reasoning}
        >
          {result.reasoning}
        </span>
      )}
    </div>
  );
}
