"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, User, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  modelColor?: string;
};

type DemoStep = {
  type: "user" | "assistant" | "switch";
  content?: string;
  model?: string;
  modelColor?: string;
};

const MODELS = {
  gpt4: { name: "GPT-4o", color: "text-emerald-600 dark:text-emerald-400" },
  claude: { name: "Claude 3.5", color: "text-amber-600 dark:text-amber-400" },
  gemini: { name: "Gemini Pro", color: "text-violet-600 dark:text-violet-400" },
};

const DEMO_SCRIPT: DemoStep[] = [
  { type: "user", content: "Help me write a Python function to parse JSON" },
  {
    type: "assistant",
    content: "Here's a clean function to parse JSON safely:\n\n```python\nimport json\n\ndef parse_json(data: str) -> dict:\n    try:\n        return json.loads(data)\n    except json.JSONDecodeError:\n        return {}\n```",
    model: "gpt4",
    modelColor: MODELS.gpt4.color,
  },
  { type: "user", content: "Now review it for edge cases" },
  { type: "switch", model: "claude" },
  {
    type: "assistant",
    content: "Good start! Consider these improvements:\n\n1. Handle `None` input\n2. Add type hints for return\n3. Log errors for debugging\n4. Consider returning `Optional[dict]`",
    model: "claude",
    modelColor: MODELS.claude.color,
  },
  { type: "user", content: "Summarize the key changes" },
  { type: "switch", model: "gemini" },
  {
    type: "assistant",
    content: "Key improvements: null-safety, better typing, error logging, and explicit Optional return type for clearer API contracts.",
    model: "gemini",
    modelColor: MODELS.gemini.color,
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

function MessageBubble({ message, isTyping }: { message: Message; isTyping?: boolean }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
          isUser
            ? "border-border bg-muted"
            : "border-border bg-card"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <Bot className={cn("h-3.5 w-3.5", message.modelColor || "text-muted-foreground")} />
        )}
      </div>
      <div className={cn("flex max-w-[85%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {!isUser && message.model && (
          <span className={cn("text-[10px] font-medium", message.modelColor)}>
            {MODELS[message.model as keyof typeof MODELS]?.name}
          </span>
        )}
        <div
          className={cn(
            "rounded-xl px-3 py-2 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {isTyping ? <TypingIndicator /> : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ModelSwitchIndicator({ from, to }: { from: string; to: string }) {
  const fromModel = MODELS[from as keyof typeof MODELS];
  const toModel = MODELS[to as keyof typeof MODELS];

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
        <span className={cn("font-medium", fromModel?.color)}>{fromModel?.name}</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className={cn("font-medium", toModel?.color)}>{toModel?.name}</span>
      </div>
    </div>
  );
}

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModel, setCurrentModel] = useState("gpt4");
  const [stepIndex, setStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showSwitch, setShowSwitch] = useState<{ from: string; to: string } | null>(null);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => setIsInView(entries[0]?.isIntersecting ?? false),
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, showSwitch]);

  // Animation loop
  useEffect(() => {
    if (!isInView) return;

    const step = DEMO_SCRIPT[stepIndex];
    if (!step) {
      // Reset after pause
      const timeout = setTimeout(() => {
        setMessages([]);
        setCurrentModel("gpt4");
        setStepIndex(0);
        setShowSwitch(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }

    let timeout: NodeJS.Timeout;

    if (step.type === "switch") {
      setShowSwitch({ from: currentModel, to: step.model! });
      timeout = setTimeout(() => {
        setCurrentModel(step.model!);
        setShowSwitch(null);
        setStepIndex((i) => i + 1);
      }, 1200);
    } else if (step.type === "user") {
      timeout = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: `msg-${stepIndex}`, role: "user", content: step.content! },
        ]);
        setStepIndex((i) => i + 1);
      }, 800);
    } else if (step.type === "assistant") {
      setIsTyping(true);
      setMessages((prev) => [
        ...prev,
        { id: `msg-${stepIndex}`, role: "assistant", content: "", model: step.model, modelColor: step.modelColor },
      ]);

      timeout = setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === `msg-${stepIndex}` ? { ...m, content: step.content! } : m
          )
        );
        setStepIndex((i) => i + 1);
      }, 1500);
    }

    return () => clearTimeout(timeout);
  }, [stepIndex, isInView, currentModel]);

  return (
    <div ref={containerRef} className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Bot className={cn("h-4 w-4", MODELS[currentModel as keyof typeof MODELS]?.color)} />
          <span className="text-sm font-medium text-foreground">
            {MODELS[currentModel as keyof typeof MODELS]?.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isTyping={isTyping && index === messages.length - 1 && message.role === "assistant"}
            />
          ))}
          {showSwitch && <ModelSwitchIndicator from={showSwitch.from} to={showSwitch.to} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input (decorative) */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <span className="flex-1 text-sm text-muted-foreground">Message Trew...</span>
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
