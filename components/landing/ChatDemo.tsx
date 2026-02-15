"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, User, ChevronDown, ArrowRight, BrainCircuit, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ApiModel = {
  id: string;
  name: string;
  provider: string;
  flagship?: boolean;
  rank?: number | null;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
};

type DemoStep = {
  type: "user" | "assistant" | "switch" | "thinking";
  content?: string;
  model?: string;
};

type DemoModel = {
  id: string;
  name: string;
  provider: string;
};

const FALLBACK_MODELS: DemoModel[] = [
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "anthropic" },
  { id: "google/gemini-2.0-pro", name: "Gemini 2.0 Pro", provider: "google" },
];

const DEMO_SCRIPT: DemoStep[] = [
  { type: "user", content: "Help me write a Python function to parse JSON" },
  {
    type: "assistant",
    content:
      "Here's a clean function to parse JSON safely:\n\n```python\nimport json\n\ndef parse_json(data: str) -> dict:\n    try:\n        return json.loads(data)\n    except json.JSONDecodeError:\n        return {}\n```",
    model: "m0",
  },
  { type: "user", content: "I'm getting a hydration error in Next.js. How do I debug it?" },
  { type: "switch", model: "m1" },
  {
    type: "thinking",
    model: "m1",
    content:
      "Let’s narrow down the mismatch source.\n- Check if the component reads browser-only state on first render\n- Look for non-determinism (Date/Math.random)\n- Verify the DOM structure is valid\n- If needed, isolate the problematic subtree behind a Client Component",
  },
  {
    type: "assistant",
    content:
      "Common causes are browser-only APIs (window/localStorage), non-deterministic values (Date/Math.random), or invalid HTML nesting.\n\nDebug checklist:\n1) Check the console hydration diff\n2) Search for `new Date()` in render\n3) Move browser-only logic into `useEffect`\n4) Ensure server/client output matches",
    model: "m1",
  },
  { type: "user", content: "Summarize the key changes" },
  { type: "switch", model: "m2" },
  {
    type: "assistant",
    content:
      "Key improvements: make rendering deterministic, isolate browser-only code to effects, and validate markup so server + client output match.",
    model: "m2",
  },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60" style={{ animationDelay: "150ms" }} />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground/60" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function ThinkingCollapsible({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  if (!isStreaming && !content) return null;

  return (
    <div className="mb-2 max-w-[85%] sm:max-w-[75%] ml-10">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/75 mb-2 select-none">
        <div className={cn("-ml-0.5 p-1 rounded-md bg-muted/50", isStreaming && "animate-pulse")}>
          <BrainCircuit className={cn("w-3.5 h-3.5", isStreaming && "animate-[spin_2.4s_linear_infinite]")} />
        </div>
        <span>{isStreaming ? "Thinking..." : "Thought Process"}</span>
        {isStreaming && <span className="text-[10px] animate-pulse opacity-70">●</span>}
        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
      </div>

      <div className="overflow-hidden">
        <div className="relative pl-4 border-l-2 border-border/40 ml-2 my-2">
          <div className="text-sm text-muted-foreground/60 italic max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            <span className="whitespace-pre-wrap text-xs">{content}</span>
            {isStreaming ? <span className="ml-1 text-[10px] animate-pulse opacity-70">●</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isTyping,
  modelLabel,
}: {
  message: Message;
  isTyping?: boolean;
  modelLabel?: string;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ring-2 ring-background",
          isUser ? "border-border bg-muted" : "border-border bg-card"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className={cn("flex max-w-[85%] flex-col min-w-0", isUser ? "items-end" : "items-start")}>
        {!isUser && modelLabel ? (
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-medium text-foreground/70">{modelLabel}</span>
          </div>
        ) : null}

        <div
          className={cn(
            "relative rounded-2xl px-5 py-3 max-w-[85%] sm:max-w-[75%] break-words",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm shadow-soft"
              : "bg-card text-foreground rounded-bl-sm border border-border/60 shadow-soft"
          )}
        >
          {isTyping ? <TypingIndicator /> : <span className="whitespace-pre-wrap">{message.content}</span>}
        </div>
      </div>
    </div>
  );
}

function ModelSwitchIndicator({ from, to, models }: { from: number; to: number; models: DemoModel[] }) {
  const fromModel = models[from];
  const toModel = models[to];

  return (
    <div className="flex items-center justify-center py-2">
      <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="text-foreground/70">{fromModel?.name}</span>
        <ArrowRight className="h-3 w-3" />
        <span className="text-foreground/70">{toModel?.name}</span>
      </div>
    </div>
  );
}

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [demoModels, setDemoModels] = useState<DemoModel[]>(FALLBACK_MODELS);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState("");
  const [showSwitch, setShowSwitch] = useState<{ from: number; to: number } | null>(null);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentModel = demoModels[currentModelIndex] || demoModels[0];

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => setIsInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;

    async function loadModels() {
      try {
        const res = await fetch("/api/models");
        if (!res.ok) return;
        const json = (await res.json()) as { models?: ApiModel[] };
        const models = Array.isArray(json.models) ? json.models : [];

        const sorted = [...models].sort((a, b) => {
          const aRank = a.rank ?? Number.POSITIVE_INFINITY;
          const bRank = b.rank ?? Number.POSITIVE_INFINITY;
          return aRank - bRank;
        });

        const flagship = sorted.filter((m) => m.flagship);
        const picked = (flagship.length ? flagship : sorted).slice(0, 3);
        if (!picked.length) return;

        const next: DemoModel[] = picked.map((m) => ({ id: m.id, name: m.name, provider: m.provider }));
        if (!cancelled) setDemoModels(next);
      } catch {
        // fail-open to fallback models
      }
    }

    void loadModels();

    return () => {
      cancelled = true;
    };
  }, [isInView]);

  const resolveStepModelIndex = (token?: string) => {
    if (token === "m1") return 1;
    if (token === "m2") return 2;
    return 0;
  };

  const startThinkingReveal = (fullText: string) => {
    const seeded = fullText.slice(0, 2);
    setThinkingText(seeded);

    let i = 2;
    const interval = setInterval(() => {
      i += 2;
      const next = fullText.slice(0, i);
      setThinkingText(next);
      if (i >= fullText.length) clearInterval(interval);
    }, 24);

    return () => clearInterval(interval);
  };

  // Animation loop
  useEffect(() => {
    if (!isInView) return;

    const step = DEMO_SCRIPT[stepIndex];
    if (!step) {
      const timeout = setTimeout(() => {
        setMessages([]);
        setCurrentModelIndex(0);
        setStepIndex(0);
        setShowSwitch(null);
        setIsTyping(false);
        setIsThinking(false);
        setThinkingText("");
      }, 3000);
      return () => clearTimeout(timeout);
    }

    let timeout: NodeJS.Timeout;

    if (step.type === "switch") {
      const toIndex = resolveStepModelIndex(step.model);
      setShowSwitch({ from: currentModelIndex, to: toIndex });
      timeout = setTimeout(() => {
        setCurrentModelIndex(toIndex);
        setShowSwitch(null);
        setStepIndex((i) => i + 1);
      }, 1200);
    } else if (step.type === "user") {
      timeout = setTimeout(() => {
        setMessages((prev) => [...prev, { id: `msg-${stepIndex}`, role: "user", content: step.content! }]);
        setStepIndex((i) => i + 1);
      }, 800);
    } else if (step.type === "thinking") {
      setIsThinking(true);
      const fullText = step.content ?? "";

      const stop = startThinkingReveal(fullText);

      timeout = setTimeout(() => {
        stop();
        setIsThinking(false);
        setStepIndex((i) => i + 1);
      }, Math.min(2200, Math.max(1400, fullText.length * 14)));
    } else if (step.type === "assistant") {
      const modelIndex = resolveStepModelIndex(step.model);
      setIsTyping(true);
      setMessages((prev) => [...prev, { id: `msg-${stepIndex}`, role: "assistant", content: "", model: `m${modelIndex}` }]);

      timeout = setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => prev.map((m) => (m.id === `msg-${stepIndex}` ? { ...m, content: step.content! } : m)));
        setStepIndex((i) => i + 1);
      }, 1500);
    }

    return () => clearTimeout(timeout);
  }, [stepIndex, isInView, currentModelIndex]);

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col bg-background pointer-events-none select-none"
      aria-hidden
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5">
            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground/80">{currentModel?.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary/40" />
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden px-4 py-4">
        <div className="flex h-full flex-col justify-end space-y-4">
          {isThinking ? (
            <ThinkingCollapsible content={thinkingText} isStreaming />
          ) : null}

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              modelLabel={
                message.role === "assistant"
                  ? demoModels[resolveStepModelIndex(message.model)]?.name
                  : undefined
              }
              isTyping={isTyping && index === messages.length - 1 && message.role === "assistant"}
            />
          ))}
          {showSwitch && <ModelSwitchIndicator from={showSwitch.from} to={showSwitch.to} models={demoModels} />}
        </div>
      </div>

      {/* Input (decorative) */}
      <div className="border-t border-border bg-background px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-soft">
          <div className="flex-1 rounded-xl bg-muted/30 px-3 py-2">
            <div className="h-4 w-40 rounded bg-muted-foreground/15" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
