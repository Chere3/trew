"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import useSWR from "swr";
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
import { API_ENDPOINTS } from "@/lib/constants";
import { getProviderConfig } from "@/lib/models/providers";
import type { Model, AutorouteResult } from "@/lib/types";

const POC_AUTOROUTE_ENDPOINT = "/api/poc/autoroute";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
  const [routeResult, setRouteResult] = useState<AutorouteResult | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRoutedPromptRef = useRef<string>("");

  const { data: modelsData } = useSWR<{ models: Model[] }>(
    API_ENDPOINTS.MODELS,
    fetcher
  );
  const models = modelsData?.models ?? [];

  const selectedModel = useMemo(() => {
    if (!routeResult) return null;
    return models.find((m) => m.id === routeResult.selectedModelId) ?? null;
  }, [routeResult, models]);

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
      const data = (await res.json()) as AutorouteResult;
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
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#0d0f12] text-zinc-100">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-white/5 bg-[#0d0f12] transition-[width] duration-200",
          collapsed ? "w-0 overflow-hidden" : "w-[260px]"
        )}
      >
        <div className="flex items-center gap-2 px-3 pt-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="h-8 w-8 text-zinc-300 hover:bg-white/5"
            aria-label="Collapse sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            className="ml-auto h-8 gap-1.5 rounded-full bg-fuchsia-600 px-3 text-xs font-medium text-white hover:bg-fuchsia-500"
            onClick={() => {
              setPrompt("");
              setRouteResult(null);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>

        <div className="px-4 pb-2 pt-5 text-sm font-medium text-zinc-200">
          Chat History
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {SIDEBAR_SECTIONS.map((section) => {
            const open = !!openSections[section.id];
            return (
              <div key={section.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-medium text-zinc-400 hover:bg-white/5"
                >
                  <span>{section.label}</span>
                  {open ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
                {open && section.items && section.items.length > 0 && (
                  <ul className="mt-0.5 space-y-0.5 pl-2">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="block w-full truncate rounded-md px-2 py-1.5 text-left text-xs text-zinc-300 hover:bg-white/5"
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
        <header className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                className="h-8 w-8 text-zinc-300 hover:bg-white/5"
                aria-label="Expand sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-8 rounded-full border-white/10 bg-transparent px-4 text-xs text-zinc-200 hover:bg-white/5"
            >
              Feedback
            </Button>
            <Avatar className="h-8 w-8 ring-1 ring-white/10">
              <AvatarFallback className="bg-amber-500/80 text-[11px] font-semibold text-black">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Centered hero + composer */}
        <main className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="flex w-full max-w-2xl flex-col items-center">
            {/* Logo tile */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-fuchsia-600/15 ring-1 ring-fuchsia-500/30">
              <Wand2 className="h-5 w-5 text-fuchsia-400" />
            </div>

            <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-zinc-50">
              Autorouter
              <ChevronDown className="h-5 w-5 text-zinc-400" />
            </h1>
            <p className="mt-3 max-w-md text-center text-sm text-zinc-400">
              Intelligent model manager that classifies your prompt and routes
              it to the best available model.
            </p>
            <p className="mt-1 text-center text-[11px] font-medium text-zinc-500">
              Proof of concept
            </p>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 w-full rounded-2xl border border-white/10 bg-[#1a1c20] shadow-lg"
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
                className="block w-full resize-none bg-transparent px-4 pt-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />
              <div className="flex items-center gap-2 px-3 pb-3 pt-1">
                <ModelBadge
                  routing={routing}
                  selectedModel={selectedModel}
                  category={routeResult?.category}
                  confidence={routeResult?.confidence}
                  hasPrompt={!!prompt.trim()}
                />
                <IconChip>
                  <Paperclip className="h-3.5 w-3.5" />
                </IconChip>
                <IconChip className="gap-1 px-2.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="text-[11px] text-zinc-300">Off</span>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </IconChip>
                <IconChip>
                  <Cloud className="h-3.5 w-3.5" />
                </IconChip>
                <IconChip>
                  <LayoutGrid className="h-3.5 w-3.5" />
                </IconChip>
                <IconChip>
                  <ImageIcon className="h-3.5 w-3.5" />
                </IconChip>
                <IconChip>
                  <Info className="h-3.5 w-3.5" />
                </IconChip>
                <div className="ml-auto flex items-center gap-1.5">
                  <IconChip>
                    <Mic className="h-3.5 w-3.5" />
                  </IconChip>
                  <button
                    type="submit"
                    disabled={!prompt.trim() || routing}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-600 text-white transition hover:bg-fuchsia-500 disabled:opacity-40"
                    aria-label="Send"
                  >
                    {routing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Autorouter status panel */}
            {(routeResult || routeError) && (
              <RouteStatus
                error={routeError}
                result={routeResult}
                model={selectedModel}
              />
            )}

            {/* Quick action buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {QUICK_ACTIONS.map((q) => {
                const Icon = q.icon;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleQuickAction(q)}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1a1c20] px-3.5 py-1.5 text-xs text-zinc-300 transition hover:border-white/20 hover:bg-[#22252b]"
                  >
                    <Icon className="h-3.5 w-3.5 text-zinc-400" />
                    {q.label}
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-center px-6 pb-3 text-[11px] text-zinc-500">
          <span>
            AI-generated responses may be inaccurate or unreliable.
          </span>
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
        "flex h-7 items-center justify-center rounded-full bg-[#22252b] px-2 text-zinc-300 hover:bg-[#2c3037]",
        className
      )}
    >
      {children}
    </button>
  );
}

function ModelBadge({
  routing,
  selectedModel,
  category,
  confidence,
  hasPrompt,
}: {
  routing: boolean;
  selectedModel: Model | null;
  category?: string;
  confidence?: number;
  hasPrompt: boolean;
}) {
  const providerConfig = selectedModel
    ? getProviderConfig(selectedModel.provider)
    : null;

  return (
    <div
      className="flex h-7 items-center gap-1.5 rounded-full bg-[#22252b] px-2.5 text-[11px] text-zinc-200"
      title={
        selectedModel
          ? `Auto: routed to ${selectedModel.name} (${category}, ${Math.round((confidence ?? 0) * 100)}%)`
          : "Auto-router (intelligent model selection)"
      }
    >
      {routing ? (
        <Loader2 className="h-3 w-3 animate-spin text-fuchsia-400" />
      ) : selectedModel && providerConfig?.logoUrl ? (
        <Image
          src={providerConfig.logoUrl}
          alt={providerConfig.displayName}
          width={12}
          height={12}
          className="object-contain"
          unoptimized
        />
      ) : (
        <Wand2 className="h-3 w-3 text-fuchsia-400" />
      )}
      <span className="font-medium">
        {selectedModel
          ? `Auto · ${selectedModel.name}`
          : hasPrompt && routing
            ? "Auto · routing…"
            : "Auto"}
      </span>
      <ChevronDown className="h-3 w-3 text-zinc-400" />
    </div>
  );
}

function RouteStatus({
  error,
  result,
  model,
}: {
  error: string | null;
  result: AutorouteResult | null;
  model: Model | null;
}) {
  if (error) {
    return (
      <div className="mt-3 w-full rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
        Autorouter error: {error}
      </div>
    );
  }
  if (!result) return null;

  const pct = Math.round((result.confidence ?? 0) * 100);
  return (
    <div className="mt-3 flex w-full items-center gap-3 rounded-lg border border-white/10 bg-[#1a1c20] px-3 py-2 text-xs text-zinc-300">
      <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
      <span className="font-medium text-zinc-200">
        {model?.name ?? result.selectedModelId}
      </span>
      <span className="text-zinc-500">·</span>
      <span className="capitalize">{result.category.replace("_", " ")}</span>
      <span className="text-zinc-500">·</span>
      <span>{pct}% confidence</span>
      {result.reasoning && (
        <span
          className="ml-auto truncate text-zinc-500"
          title={result.reasoning}
        >
          {result.reasoning}
        </span>
      )}
    </div>
  );
}
