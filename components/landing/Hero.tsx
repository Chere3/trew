"use client";

import { ArrowDown, Star, Users, TrendingUp, CheckCircle2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ChatDemo } from "./ChatDemo";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useSWR from "swr";
import type { Model } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Get flagship model names for display
 */
function getFlagshipModelNames(models: Model[]): string[] {
  const flagshipModels = models.filter(m => m.flagship === true);
  
  if (flagshipModels.length === 0) return [];
  
  // Sort by rank if available, otherwise by name
  const sorted = flagshipModels.sort((a, b) => {
    if (a.rank !== undefined && b.rank !== undefined) {
      return a.rank - b.rank;
    }
    return a.name.localeCompare(b.name);
  });
  
  // Get top 4 model names
  return sorted.slice(0, 4).map(m => m.name.split(" ")[1] || m.name);
}

/**
 * Format model names for display in description
 */
function formatModelNamesForDescription(modelNames: string[]): string {
  if (modelNames.length === 0) {
    return "top AI models";
  }
  
  if (modelNames.length === 1) {
    return `${modelNames[0]} and more`;
  }
  
  if (modelNames.length === 2) {
    return `${modelNames[0]} and ${modelNames[1]}`;
  }
  
  // For 3+ models, show first few and "and more"
  const firstFew = modelNames.slice(0, 3).join(", ");
  return `${firstFew}, and more`;
}

/**
 * Format model names for feature checklist, ensuring GPT-4 is first
 */
function formatModelNamesForChecklist(modelNames: string[]): string {
  if (modelNames.length === 0) {
    return "Switch between GPT-4, Claude, and Gemini seamlessly";
  }
  
  // Find GPT-4 model
  const gpt4Model = modelNames.find(n => 
    n.toLowerCase().includes('gpt-4') || 
    n.toLowerCase().includes('gpt4') ||
    n.toLowerCase().includes('gpt 4')
  );
  
  const otherModels = modelNames.filter(n => n !== gpt4Model).slice(0, 2);
  
  // Always include GPT-4 first if available, otherwise prepend it
  if (gpt4Model) {
    if (otherModels.length > 0) {
      return `Switch between ${gpt4Model}, ${otherModels.join(", ")}, and more seamlessly`;
    }
    return `Switch between ${gpt4Model} and more seamlessly`;
  }
  
  // If no GPT-4 in list, prepend it
  if (modelNames.length === 1) {
    return `Switch between ${modelNames[0]}, and more seamlessly`;
  }
  
  if (modelNames.length === 2) {
    return `Switch between ${modelNames[0]}, ${modelNames[1]}, and more seamlessly`;
  }
  
  return `Switch between ${modelNames.slice(0, 2).join(", ")}, and more seamlessly`;
}

export function Hero({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  // Fetch models to get flagship model names
  const { data: modelsData } = useSWR<{ models: Model[] }>("/api/models", fetcher);
  const availableModels = modelsData?.models || [];
  const flagshipModelNames = getFlagshipModelNames(availableModels);
  
  const descriptionText = formatModelNamesForDescription(flagshipModelNames);
  const checklistText = formatModelNamesForChecklist(flagshipModelNames);
  return (
    <section className="relative flex min-h-screen flex-col lg:flex-row items-center justify-center px-4 py-12 sm:px-6 lg:px-8 lg:py-8 overflow-hidden">
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 -z-20 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
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
          backgroundSize: '24px 24px',
        }}
      />
      {/* Background accent */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Hero text content - left side on desktop */}
        <div className="flex flex-col justify-center w-full lg:w-[48%] lg:pr-8 space-y-6 lg:space-y-8 text-center lg:text-left">
          {/* Top Badge and Rating - like nomads.com */}
          <div className="flex flex-col items-center lg:items-start gap-3">
            <Badge variant="outline" className="px-4 py-1.5 border-primary/20 bg-primary/5 text-sm">
              #1 AI Platform Since 2024
            </Badge>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
                ))}
              </div>
              <span className="font-semibold text-foreground">4.9</span>
              <span className="text-muted-foreground">(2,847 reviews)</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl leading-[1.1]">
              Stop juggling AI subscriptions.{" "}
              <span className="text-primary">Start switching models{" "}
                <span className="relative inline-block">
                  instantly
                  <Image 
                    src="/noun-underline-4303795.svg" 
                    alt="" 
                    width={90}
                    height={12}
                    className="absolute -bottom-6 left-0 w-full h-auto -z-0"
                    style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1352%) hue-rotate(221deg) brightness(100%) contrast(95%)' }}
                  />
                </span>
                .
              </span>
            </h1>
            
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg lg:text-base mx-auto lg:mx-0 max-w-3xl">
              Access {descriptionText} in one unified app. Save hundreds per month 
              on multiple subscriptions. Switch between models mid-conversation—no context lost. 
              One plan. All models. Cancel anytime.
            </p>
          </div>

          {/* Member Avatars - like nomads.com */}
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="flex -space-x-3">
              {[
                { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces', name: 'SC' },
                { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces', name: 'MR' },
                { image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces', name: 'EK' },
                { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces', name: 'JS' },
                { image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces', name: 'AK' },
                { image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces', name: 'LS' },
                { image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces', name: 'PT' },
                { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces', name: 'NM' },
                { image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces', name: 'DM' },
                { image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces', name: 'CL' },
              ].map((person, i) => (
                <Avatar key={i} className="h-10 w-10 border-2 border-background ring-2 ring-primary/10">
                  <AvatarImage 
                    src={person.image}
                    alt={`${person.name} avatar`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {person.name}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">+ 50K members</span>
          </div>

          {/* Feature Checklist - like nomads.com */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto lg:mx-0 text-left">
            {[
              checklistText,
              "Cancel anytime, no commitments",
              "One plan, all AI models included",
              "Unlimited conversations and messages",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <Button variant="hero" size="xl" className="group" asChild>
              <Link href={isLoggedIn ? "/chat" : "/register"}>
                {isLoggedIn ? "Go to chat" : "Get Started free"}
              </Link>
            </Button>
           
          </div>
        </div>

        {/* Demo - right side on desktop */}
        <div className="relative flex items-center justify-center w-full lg:w-[52%] lg:pl-8 min-h-[500px] lg:min-h-0">
          {/* Text above arrow - positioned relative to parent */}
          <div className="absolute -left-20 lg:-left-30 top-[15%] lg:top-[36%] z-20 whitespace-nowrap rotate-[-15deg] hidden sm:block">
            <p className="text-sm lg:text-base xl:text-lg font-bold text-primary drop-shadow-md" style={{ fontFamily: 'var(--font-caveat), cursive', letterSpacing: '0.02em' }}>
              See it switch models instantly
            </p>
          </div>
          
          {/* Handwritten arrow */}
          <div className="absolute -left-8 lg:-left-12 top-1/2 -translate-y-1/2 z-10 opacity-90 hover:opacity-100 transition-opacity hidden sm:block">
            <div className="w-32 h-20 lg:w-40 lg:h-28 text-primary rotate-[-12deg]">
              <Image 
                src="/handwritten-arrow.svg" 
                alt="Arrow pointing to demo" 
                width={208}
                height={144}
                className="w-full h-full drop-shadow-lg"
              />
            </div>
          </div>

          {/* Chat demo - standalone without mockup */}
          <div className="relative w-full max-w-[800px] sm:max-w-[900px] lg:max-w-[1000px] xl:max-w-[1100px] h-[500px] sm:h-[550px] lg:h-[600px] xl:h-[650px] rounded-xl border border-border/50 bg-background shadow-2xl overflow-hidden">
            <ChatDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
