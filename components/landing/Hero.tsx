import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatDemo } from "./ChatDemo";

const pillars = [
  "One plan with access to all major models",
  "Switch models mid-conversation",
  "No context loss between providers",
  "Built for daily production workflows",
];

export function Hero({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(560px,0.95fr)] lg:gap-12">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Trew</p>
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
                One plan for every leading model.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Use GPT, Claude, Gemini and more inside one workspace. Switch mid-conversation and keep full context
                continuity.
              </p>
            </div>

            <div className="grid max-w-xl gap-3 sm:grid-cols-2">
              {pillars.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-3.5 py-3 text-sm text-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 rounded-md px-6 text-sm font-medium">
                <Link href={isLoggedIn ? "/chat" : "/register"}>{isLoggedIn ? "Open Workspace" : "Get Started"}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 rounded-md px-6 text-sm font-medium">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">No credit card required.</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-2 shadow-sm">
            <div className="mb-2 flex items-center justify-between px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span>Workspace Preview</span>
              <span>Smart Routing Active</span>
            </div>
            <div className="h-[500px] overflow-hidden rounded-xl border border-border bg-background">
              <ChatDemo />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
