import {
  ArrowRightLeft,
  Layers3,
  Wallet,
  Infinity as InfinityIcon,
  ShieldCheck,
  Workflow,
  CheckCircle2,
  Zap,
  MoreHorizontal,
  Bot,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Feature = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  visual: React.ReactNode;
};

function FauxShot({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative h-36 overflow-hidden rounded-lg border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted/40 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/15" />
        </div>
        <span className="text-[10px] text-muted-foreground">{title}</span>
      </div>

      <div className="relative h-[calc(100%-30px)] p-2.5">{children}</div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

const features: Feature[] = [
  {
    title: "Context-safe model switching",
    description: "Move from GPT to Claude to Gemini without resetting threads or re-explaining your work.",
    icon: ArrowRightLeft,
    visual: (
      <FauxShot title="Model Router">
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-md border bg-background px-2 py-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
                <Bot className="h-3 w-3" />
              </div>
              <span className="text-[10px] text-foreground/90">GPT-4o</span>
            </div>
            <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="rounded-md border border-dashed bg-muted/30 px-2 py-1.5 text-[10px] text-muted-foreground">
            Switching to Claude 3.5 Sonnet (context preserved)
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div className="h-1.5 w-4/5 rounded-full bg-primary" />
          </div>
        </div>
      </FauxShot>
    ),
  },
  {
    title: "Single control surface",
    description: "Operate multiple providers in one interface with consistent behavior and shared history.",
    icon: Layers3,
    visual: (
      <FauxShot title="Unified Workspace">
        <div className="grid h-full grid-cols-[44px_1fr] gap-2">
          <div className="space-y-1.5 border-r pr-2">
            <div className="h-6 rounded bg-primary/20" />
            <div className="h-6 rounded bg-muted" />
            <div className="h-6 rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px]">OpenAI</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px]">Claude</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px]">Gemini</span>
            </div>
            <div className="h-10 rounded-md border bg-muted/20" />
            <div className="h-8 rounded-md border bg-muted/20" />
          </div>
        </div>
      </FauxShot>
    ),
  },
  {
    title: "Consolidated billing",
    description: "Replace stacked subscriptions with one predictable plan for your entire team.",
    icon: Wallet,
    visual: (
      <FauxShot title="Billing">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between rounded-md border bg-background px-2 py-1.5">
            <div className="flex items-center gap-2 text-[10px]">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              Team Plan
            </div>
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
              Active
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Monthly Usage</span>
              <span>$450 / $1k</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div className="h-1.5 w-[45%] rounded-full bg-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[9px] text-muted-foreground">
            <div className="rounded border bg-muted/20 px-1.5 py-1">Vendors: 3 → 1</div>
            <div className="rounded border bg-muted/20 px-1.5 py-1">Invoices: unified</div>
          </div>
        </div>
      </FauxShot>
    ),
  },
  {
    title: "High-throughput ready",
    description: "Designed for long sessions, frequent switches, and heavy day-to-day usage.",
    icon: InfinityIcon,
    visual: (
      <FauxShot title="Request Monitor">
        <div className="space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between rounded bg-green-500/10 px-2 py-1 text-green-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> POST /v1/chat
            </span>
            <span>45ms</span>
          </div>
          <div className="flex items-center justify-between rounded bg-green-500/10 px-2 py-1 text-green-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> GET /v1/models
            </span>
            <span>12ms</span>
          </div>
          <div className="flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MoreHorizontal className="h-3 w-3 animate-pulse" /> STREAM
            </span>
            <span>…</span>
          </div>
        </div>
      </FauxShot>
    ),
  },
  {
    title: "Operational reliability",
    description: "Stable sessions and practical safeguards for production-oriented workflows.",
    icon: ShieldCheck,
    visual: (
      <FauxShot title="Reliability">
        <div className="grid h-full grid-cols-2 gap-2">
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-md border bg-background">
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="text-[10px] text-muted-foreground">Systems</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-md border bg-background">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] text-muted-foreground">99.9% Uptime</span>
          </div>
        </div>
      </FauxShot>
    ),
  },
  {
    title: "Workflow-first UX",
    description: "Fast interactions, clear hierarchy, and fewer distractions from prompt to output.",
    icon: Workflow,
    visual: (
      <FauxShot title="Conversation">
        <div className="flex h-full flex-col justify-center gap-2">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 h-4 w-4 rounded-full bg-primary/20" />
            <div className="rounded-lg rounded-tl-none bg-muted px-2 py-1.5 text-[10px] text-muted-foreground">
              Generate Q3 report…
            </div>
          </div>
          <div className="flex items-start justify-end gap-2">
            <div className="rounded-lg rounded-tr-none bg-primary px-2 py-1.5 text-[10px] text-primary-foreground">
              Analyzing data…
            </div>
            <div className="mt-0.5 h-4 w-4 rounded-full bg-primary" />
          </div>
        </div>
      </FauxShot>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Capabilities</p>
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
              Structured for teams running across models.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:justify-self-end">
            Trew keeps operations clear: one interface, one billing surface, and one continuous context thread.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/20"
              >
                <div className="p-6">
                  <div className="mb-4 inline-flex rounded-lg border border-border bg-background p-2 text-muted-foreground transition-colors group-hover:text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium leading-snug tracking-[-0.01em]">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>

                <div className="mt-auto border-t border-border bg-muted/10 p-6 pt-4">{feature.visual}</div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
