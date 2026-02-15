"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ShieldCheck, Sparkles, TrendingUp, Timer, Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  initials: string;
  rating: number;
  gradient: string;
  avatarImage: string;
  highlight?: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Being able to switch models mid-conversation is a game-changer. I use Claude for coding and GPT-4 for creative writing without losing context. Saved me 5+ hours per week.",
    author: "Sarah Chen",
    role: "Founder",
    company: "TechFlow",
    initials: "SC",
    rating: 5,
    gradient: "from-blue-500/10 to-purple-500/10",
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
    gradient: "from-primary/10 to-blue-500/10",
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
    gradient: "from-green-500/10 to-teal-500/10",
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
    gradient: "from-purple-500/10 to-pink-500/10",
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
    gradient: "from-amber-500/10 to-orange-500/10",
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
    gradient: "from-cyan-500/10 to-blue-500/10",
    avatarImage:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
    highlight: "Unlimited usage",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating
              ? "fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400"
              : "fill-none text-border"
          )}
        />
      ))}
    </div>
  );
}

function ReviewHeader({ t }: { t: Testimonial }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground/80">Verified review</span>
          {t.highlight ? <span className="hidden sm:inline">• {t.highlight}</span> : null}
        </div>
        <Stars rating={t.rating} />
      </div>
      <div className="text-5xl font-serif leading-none text-primary/20 select-none">&quot;</div>
    </div>
  );
}

function ReviewFooter({ t }: { t: Testimonial }) {
  return (
    <div className="border-t border-border/50 pt-4 mt-auto">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/20 ring-2 ring-primary/10 flex-shrink-0">
          <AvatarImage src={t.avatarImage} alt={`${t.author} avatar`} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {t.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-none text-foreground truncate">{t.author}</p>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            {t.role}
            {t.company ? ` • ${t.company}` : null}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeaturedReview({ t }: { t: Testimonial }) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/60",
        "bg-card/80 backdrop-blur-sm",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_18px_40px_rgba(0,0,0,0.10)]",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br",
        `before:${t.gradient}`,
        "before:opacity-60 before:pointer-events-none"
      )}
    >
      <CardContent className="relative p-6 sm:p-7 flex h-full flex-col">
        <ReviewHeader t={t} />
        <p className="mt-5 mb-7 text-base leading-relaxed text-foreground flex-grow sm:text-[15px]">
          {t.quote}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatChip icon={TrendingUp} label="Reported lift" value="+40%" />
          <StatChip icon={Timer} label="Median time-to-value" value="~7 min" />
          <StatChip icon={Layers3} label="Tabs replaced" value="3–5" />
        </div>
        <ReviewFooter t={t} />
      </CardContent>
    </Card>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function CompactReview({ t }: { t: Testimonial }) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-border/60",
        "bg-card/70 backdrop-blur-sm transition-transform duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br",
        `before:${t.gradient}`,
        "before:opacity-40 before:pointer-events-none"
      )}
    >
      <CardContent className="relative p-5 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <Stars rating={t.rating} />
          <div className="text-3xl font-serif leading-none text-primary/20 select-none">&quot;</div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground flex-grow">{t.quote}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{t.author}</p>
            <p className="text-xs text-muted-foreground truncate">{t.role}</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-1 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-primary" />
            verified
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Testimonials() {
  const featured = testimonials[0]
  const grid = testimonials.slice(1)

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 -z-20 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="absolute inset-0 -z-20 opacity-0 dark:opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 bottom-0 h-[520px] w-[520px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[440px] w-[440px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground/80">Reviews</span>
              <span className="hidden sm:inline">• real workflows, real teams</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Trusted when the work is real.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl">
              Not "AI toy" praise. These are teams shipping with multiple models—without losing context, time, or budget.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Stars rating={5} />
                  <span className="text-sm font-semibold text-foreground">4.9</span>
                </div>
                <p className="text-sm text-muted-foreground">Based on 2,847 reviews</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Most cited outcome</p>
                <p className="text-lg font-semibold text-foreground">less tab switching</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <FeaturedReview t={featured} />

          <div className="grid gap-4 sm:grid-cols-2">
            {grid.map((t) => (
              <CompactReview key={t.author} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
