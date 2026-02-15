"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Carousel } from "@/components/ui/carousel";
import { Star } from "lucide-react";
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
}

const testimonials: Testimonial[] = [
  {
    quote: "Being able to switch models mid-conversation is a game-changer. I use Claude for coding and GPT-4 for creative writing without losing context. Saved me 5+ hours per week.",
    author: "Sarah Chen",
    role: "Founder",
    company: "TechFlow",
    initials: "SC",
    rating: 5,
    gradient: "from-blue-500/10 to-purple-500/10",
    avatarImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
  },
  {
    quote: "Finally, one place for all my AI needs. I canceled 3 different subscriptions and saved $45/month while getting a better workflow. The unified interface is exactly what I needed.",
    author: "Marcus Rivera",
    role: "Senior Developer",
    company: "TechCorp",
    initials: "MR",
    rating: 5,
    gradient: "from-primary/10 to-blue-500/10",
    avatarImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
  },
  {
    quote: "The unified interface is beautiful. It feels like a native tool that just works, regardless of which model I'm using. Increased my productivity by 40%.",
    author: "Dr. Emily Kim",
    role: "AI Researcher",
    company: "Stanford AI Lab",
    initials: "EK",
    rating: 5,
    gradient: "from-green-500/10 to-teal-500/10",
    avatarImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
  },
  {
    quote: "As a startup founder, cost matters. Trew replaced my $60/month in multiple subscriptions with one $30 plan. Best ROI decision I made this quarter.",
    author: "James Park",
    role: "Co-Founder",
    company: "InnovateAI",
    initials: "JP",
    rating: 5,
    gradient: "from-purple-500/10 to-pink-500/10",
    avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
  },
  {
    quote: "Context preservation when switching models is flawless. I can start with GPT-4 for brainstorming, switch to Claude for code, then back to GPT-4—all seamless.",
    author: "Alex Thompson",
    role: "Product Manager",
    company: "CloudScale",
    initials: "AT",
    rating: 5,
    gradient: "from-amber-500/10 to-orange-500/10",
    avatarImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
  },
  {
    quote: "Unlimited usage means I never hit rate limits. I've sent over 10,000 messages this month across all models. The flexibility is unmatched.",
    author: "Lisa Wang",
    role: "Data Scientist",
    company: "DataDriven Inc",
    initials: "LW",
    rating: 5,
    gradient: "from-cyan-500/10 to-blue-500/10",
    avatarImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
  },
  {
    quote: "The ability to cancel anytime with no commitments gave me the confidence to try it. Now I'm a loyal user—it's become essential to my workflow.",
    author: "Michael Brown",
    role: "Freelance Developer",
    company: "Independent",
    initials: "MB",
    rating: 5,
    gradient: "from-indigo-500/10 to-purple-500/10",
    avatarImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces",
  },
  {
    quote: "Compared to juggling ChatGPT Plus, Claude Pro, and Gemini Advanced, Trew is a no-brainer. Better UX, same models, half the cost. Highly recommended.",
    author: "Rachel Green",
    role: "Creative Director",
    company: "Design Studio",
    initials: "RG",
    rating: 5,
    gradient: "from-emerald-500/10 to-green-500/10",
    avatarImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-border/50 h-full",
        "bg-card/80 backdrop-blur-sm transition-all duration-300",
        "hover:border-primary/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b",
        "before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none",
        "before:opacity-50",
        `bg-gradient-to-br ${testimonial.gradient}`
      )}
    >
      <CardContent className="relative p-6 flex flex-col h-full">
        {/* Quote Mark and Star Rating */}
        <div className="mb-4 flex items-start justify-between">
          <div className="text-5xl font-serif leading-none text-primary/20 select-none">&quot;</div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < testimonial.rating
                    ? "fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400"
                    : "fill-none text-border"
                )}
              />
            ))}
          </div>
        </div>

        {/* Quote Text */}
        <p className="mb-6 text-sm leading-relaxed text-foreground flex-grow">
          {testimonial.quote}
        </p>

        {/* Author Info */}
        <div className="border-t border-border/50 pt-4 mt-auto">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20 ring-2 ring-primary/10 flex-shrink-0">
              <AvatarImage 
                src={testimonial.avatarImage}
                alt={`${testimonial.author} avatar`}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {testimonial.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-none text-foreground truncate">
                {testimonial.author}
              </p>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {testimonial.role}
                {testimonial.company && ` • ${testimonial.company}`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 -z-20 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      {/* Dark mode grid */}
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

      {/* Background Accent Gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 bottom-0 h-[600px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        {/* Section Header with Trust Elements */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-bold text-foreground">4.9</span>
            <span className="text-muted-foreground">(2,847 reviews)</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Loved by <span className="text-primary">builders</span> worldwide
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Join thousands of developers, researchers, and creators who trust Trew for their AI workflows.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          slidesToShow={3}
          slidesToShowTablet={2}
          slidesToShowMobile={1}
          showDots={true}
          showArrows={true}
          className="max-w-7xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
