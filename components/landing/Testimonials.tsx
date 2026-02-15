"use client";

import { ShieldCheck, Star, Sparkles, Timer, Layers3, TrendingUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company?: string;
  initials: string;
  rating: number;
  avatarImage: string;
  highlight?: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Being able to switch models mid-conversation is a game-changer. I use Claude for coding and GPT-4 for creative writing without losing context. Saved me 5+ hours per week.",
    author: "Sarah Chen",
    role: "Founder",
    company: "TechFlow",
    initials: "SC",
    rating: 5,
    avatarImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    highlight: "Switch models mid-thread",
  },
  {
    quote:
      "Finally, one place for all my AI needs. I canceled 3 different subscriptions and saved $45/month while getting a better workflow. The unified interface is exactly what I needed.",
    author: "Marcus Rivera",
    role: "Senior Developer",
    company: "TechCorp",
    initials: "MR",
    rating: 5,
    avatarImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    highlight: "Replace 3 subscriptions",
  },
  {
    quote:
      "The unified interface feels native. It just works, regardless of which model I’m using. Increased my productivity by 40%.",
    author: "Dr. Emily Kim",
    role: "AI Researcher",
    company: "Stanford AI Lab",
    initials: "EK",
    rating: 5,
    avatarImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
    highlight: "One interface, many models",
  },
  {
    quote:
      "As a startup founder, cost matters. Trew replaced my $60/month in multiple subscriptions with one plan. Best ROI decision I made this quarter.",
    author: "James Park",
    role: "Co-Founder",
    company: "InnovateAI",
    initials: "JP",
    rating: 5,
    avatarImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    highlight: "Best ROI this quarter",
  },
  {
    quote:
      "Context preservation when switching models is flawless. I can start with GPT-4 for brainstorming, switch to Claude for code, then back — all seamless.",
    author: "Alex Thompson",
    role: "Product Manager",
    company: "CloudScale",
    initials: "AT",
    rating: 5,
    avatarImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
    highlight: "No context loss",
  },
  {
    quote:
      "Unlimited usage means I never hit rate limits. I’ve sent over 10,000 messages this month across models. The flexibility is unmatched.",
    author: "Lisa Wang",
    role: "Data Scientist",
    company: "DataDriven Inc",
    initials: "LW",
    rating: 5,
    avatarImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
    highlight: "Unlimited usage",
  },
];

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
              : "fill-none text-muted-foreground/25"
          )}
        />
      ))}
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ReviewCard({ testimonial, featured = false }: { testimonial: Testimonial; featured?: boolean }) {
  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden rounded-xl border border-border bg-card transition-colors",
        "hover:border-foreground/20",
        featured ? "shadow-sm" : ""
      )}
    >
      {/* subtle rail: uses theme, not arbitrary colors */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 bg-primary/10 transition-colors group-hover:bg-primary/25"
      />

      <CardContent className={cn("relative p-6", featured ? "sm:p-7" : "")}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Verified
              </span>
              {testimonial.highlight ? (
                <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
                  {testimonial.highlight}
                </span>
              ) : null}
            </div>

            <Stars rating={testimonial.rating} />
          </div>

          <span className="select-none font-serif text-4xl leading-none text-muted-foreground/20">“</span>
        </div>

        <figure className="mt-4">
          <blockquote className={cn("text-sm leading-relaxed text-foreground", featured ? "sm:text-base" : "")}>
            {testimonial.quote}
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={testimonial.avatarImage} alt={`${testimonial.author} avatar`} loading="lazy" />
              <AvatarFallback className="bg-muted text-foreground font-medium">{testimonial.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{testimonial.author}</p>
              <p className="truncate text-xs text-muted-foreground">
                {testimonial.role}
                {testimonial.company ? ` • ${testimonial.company}` : null}
              </p>
            </div>
          </figcaption>
        </figure>
      </CardContent>
    </Card>
  );
}

export function Testimonials() {
  const featured = testimonials[0];
  const rest = testimonials.slice(1);

  return (
    <section id="reviews" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Reviews
            </div>
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
              Proof from teams shipping across models.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Built for daily production work: switch providers mid-thread, keep context intact, and keep the workflow
              clean.
            </p>
          </header>

          <aside className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Stars rating={5} />
                  <span className="text-sm font-medium text-foreground">4.9</span>
                </div>
                <p className="text-xs text-muted-foreground">Based on 2,847 reviews</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Median time-to-value
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">~7 minutes</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-border bg-background/60 px-3 py-2">
                <p className="font-medium text-foreground">Context continuity</p>
                <p className="mt-0.5 text-muted-foreground">No re-explaining</p>
              </div>
              <div className="rounded-lg border border-border bg-background/60 px-3 py-2">
                <p className="font-medium text-foreground">Unified billing</p>
                <p className="mt-0.5 text-muted-foreground">Replace subscriptions</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <ReviewCard testimonial={featured} featured />
            <div className="grid gap-3 sm:grid-cols-3">
              <StatChip icon={TrendingUp} label="Reported lift" value="+40%" />
              <StatChip icon={Timer} label="Median time-to-value" value="~7 min" />
              <StatChip icon={Layers3} label="Tabs replaced" value="3–5" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:pt-1">
            {rest.map((t) => (
              <ReviewCard key={`${t.author}-${t.company ?? ""}`} testimonial={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
