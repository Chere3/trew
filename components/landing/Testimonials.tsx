import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company?: string;
  initials: string;
  avatarImage: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Being able to switch models mid-conversation is a game-changer. I use Claude for coding and GPT-4 for creative writing without losing context.",
    author: "Sarah Chen",
    role: "Founder",
    company: "TechFlow",
    initials: "SC",
    avatarImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
  },
  {
    quote:
      "Finally, one place for all my AI needs. I canceled 3 different subscriptions and saved $45/month while getting a better workflow.",
    author: "Marcus Rivera",
    role: "Senior Developer",
    company: "TechCorp",
    initials: "MR",
    avatarImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
  },
  {
    quote:
      "Context preservation when switching models is flawless. I can start with GPT-4 for brainstorming, switch to Claude for code, then back.",
    author: "Alex Thompson",
    role: "Product Manager",
    company: "CloudScale",
    initials: "AT",
    avatarImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
  },
];

function Stars({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
        />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
      <Stars className="mb-4" />
      <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
        "{testimonial.quote}"
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
        <Avatar className="h-9 w-9 border border-border">
          <AvatarImage src={testimonial.avatarImage} alt={testimonial.author} loading="lazy" />
          <AvatarFallback className="bg-muted text-xs font-medium text-foreground">
            {testimonial.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{testimonial.author}</p>
          <p className="truncate text-xs text-muted-foreground">
            {testimonial.role}
            {testimonial.company ? `, ${testimonial.company}` : null}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <section id="reviews" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Reviews
          </p>
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
            Trusted by teams shipping daily.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            See what developers and teams say about switching to Trew.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.author} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
