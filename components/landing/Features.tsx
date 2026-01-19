"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ChevronDown, DollarSign, Link2, Infinity, XCircle, Check, Zap, Bot, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// FeatureCard Component
export interface FeatureCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function FeatureCard({ title, description, children }: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-border/50",
        "bg-card/80 backdrop-blur-sm transition-all duration-300",
        "shadow-soft",
        "hover:border-primary/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b",
        "before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none",
        "before:opacity-50"
      )}
    >
      {/* Image/Mockup Area */}
      <div className="relative aspect-video overflow-hidden bg-muted/20">
        {children}
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent p-4 pt-8">
          <h3 className="text-lg font-bold text-foreground">
            {title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <CardContent className="p-6 pt-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

// Mockup components for each feature
function ModelSwitcherMockup() {
  return (
    <div className="flex flex-col h-full p-4 bg-gradient-to-br from-background to-muted/30 rounded-lg">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Model</span>
        </div>
        
        {/* Model Selector */}
        <div className="relative">
          <div className="flex items-center justify-between rounded-lg border-2 border-primary/40 bg-background px-4 py-3 shadow-sm ring-2 ring-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">GPT-4o</span>
                <span className="text-xs text-muted-foreground">OpenAI</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Available Models */}
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 rounded-md border border-border/30 bg-card/50 px-3 py-2 hover:bg-card transition-colors">
              <Bot className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium text-foreground flex-1">Claude 3.5 Sonnet</span>
              <Badge variant="outline" className="text-[10px] px-1.5">Available</Badge>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border/30 bg-card/50 px-3 py-2 hover:bg-card transition-colors">
              <Brain className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-xs font-medium text-foreground flex-1">Gemini Pro</span>
              <Badge variant="outline" className="text-[10px] px-1.5">Available</Badge>
            </div>
          </div>
        </div>
        
        {/* Quick Switch Hint */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-xs text-muted-foreground">Switch mid-conversation</span>
        </div>
      </div>
    </div>
  );
}

function UnifiedPlanMockup() {
  const models = [
    { name: "GPT-4", provider: "OpenAI", icon: Sparkles, color: "text-green-600 dark:text-green-400" },
    { name: "Claude", provider: "Anthropic", icon: Bot, color: "text-blue-600 dark:text-blue-400" },
    { name: "Gemini", provider: "Google", icon: Brain, color: "text-purple-600 dark:text-purple-400" },
  ];
  
  return (
    <div className="flex flex-col h-full p-4 bg-gradient-to-br from-background to-muted/30 rounded-lg">
      <div className="w-full space-y-4">
        {/* Plan Header */}
        <div className="text-center space-y-1 pb-3 border-b border-border/30">
          <div className="text-xl font-bold text-foreground">Unified Plan</div>
          <div className="text-xs text-muted-foreground">All models included</div>
        </div>
        
        {/* Models Grid */}
        <div className="grid grid-cols-3 gap-2">
          {models.map((model) => {
            const Icon = model.icon;
            return (
              <div
                key={model.name}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-border/40 bg-card/60 hover:border-primary/40 transition-colors"
              >
                <Icon className={cn("h-5 w-5 mb-1.5", model.color)} />
                <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{model.name}</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">{model.provider}</span>
              </div>
            );
          })}
        </div>
        
        {/* Features List */}
        <div className="space-y-1.5 pt-2 border-t border-border/30">
          {["Unlimited messages", "All models access", "Priority support"].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Check className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="text-xs text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SaveMoneyMockup() {
  const services = [
    { name: "GPT-4 Pro", price: 20, icon: Sparkles },
    { name: "Claude Pro", price: 20, icon: Bot },
    { name: "Gemini Pro", price: 20, icon: Brain },
  ];
  const totalSeparate = services.reduce((sum, s) => sum + s.price, 0);
  const unifiedPrice = 29;
  const savings = totalSeparate - unifiedPrice;
  
  return (
    <div className="flex flex-col h-full p-4 bg-gradient-to-br from-background to-muted/30 rounded-lg">
      <div className="w-full space-y-3">
        {/* Comparison Header */}
        <div className="text-center space-y-1 pb-2 border-b border-border/30">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Monthly Cost</div>
        </div>
        
        {/* Separate Services */}
        <div className="space-y-1.5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.name}
                className="flex items-center justify-between px-2.5 py-1.5 rounded border border-border/30 bg-card/40"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-foreground">{service.name}</span>
                </div>
                <span className="text-xs font-medium text-foreground">${service.price}</span>
              </div>
            );
          })}
        </div>
        
        {/* Total */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded border border-border/40 bg-muted/30">
          <span className="text-xs font-semibold text-foreground">Total (Separate)</span>
          <span className="text-xs font-bold text-foreground">${totalSeparate}</span>
        </div>
        
        {/* Unified Plan */}
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg border-2 border-primary/40 bg-primary/10">
          <span className="text-xs font-semibold text-primary">Trew Unified</span>
          <span className="text-sm font-bold text-primary">${unifiedPrice}</span>
        </div>
        
        {/* Savings */}
        <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-border/30">
          <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">Save ${savings}/month</span>
        </div>
      </div>
    </div>
  );
}

function ContextPreservationMockup() {
  return (
    <div className="flex flex-col h-full p-4 bg-gradient-to-br from-background to-muted/30 rounded-lg">
      <div className="w-full space-y-2">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-primary px-3 py-2">
            <p className="text-xs text-primary-foreground">Explain async/await in JavaScript</p>
          </div>
        </div>
        
        {/* Assistant Message (GPT-4) */}
        <div className="flex gap-2">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[10px] bg-blue-500/10 text-blue-500">G4</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="text-[10px] text-muted-foreground px-1">GPT-4o</div>
            <div className="rounded-2xl rounded-tl-sm border border-border/50 bg-card px-3 py-2">
              <p className="text-xs text-foreground">Async/await is syntactic sugar for Promises...</p>
            </div>
          </div>
        </div>
        
        {/* Context Preserved Indicator */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-primary/30 bg-primary/5">
          <Link2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="text-[10px] text-primary font-medium">Context preserved</span>
        </div>
        
        {/* Switched Model Message */}
        <div className="flex gap-2">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[10px] bg-purple-500/10 text-purple-500">C3</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="text-[10px] text-muted-foreground px-1">Claude 3.5 Sonnet</div>
            <div className="rounded-2xl rounded-tl-sm border border-primary/40 bg-primary/10 px-3 py-2">
              <p className="text-xs text-foreground">Continuing from previous context: The async keyword...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnlimitedUsageMockup() {
  const stats = [
    { label: "Conversations", value: "∞", icon: Infinity, color: "text-blue-600 dark:text-blue-400" },
    { label: "Messages", value: "∞", icon: Infinity, color: "text-purple-600 dark:text-purple-400" },
    { label: "Model Switches", value: "∞", icon: Infinity, color: "text-green-600 dark:text-green-400" },
  ];
  
  return (
    <div className="flex flex-col h-full p-4 bg-gradient-to-br from-background to-muted/30 rounded-lg">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="text-center space-y-1 pb-2 border-b border-border/30">
          <Infinity className="h-6 w-6 text-primary mx-auto" />
          <div className="text-xs font-semibold text-foreground uppercase tracking-wider">Unlimited Usage</div>
        </div>
        
        {/* Stats */}
        <div className="space-y-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/40 bg-card/50"
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", stat.color)} />
                  <span className="text-xs text-foreground">{stat.label}</span>
                </div>
                <span className={cn("text-sm font-bold", stat.color)}>{stat.value}</span>
              </div>
            );
          })}
        </div>
        
        {/* Usage Indicator */}
        <div className="pt-2 border-t border-border/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">This Month</span>
            <span className="text-[10px] font-semibold text-primary">No Limits</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-primary to-primary/60 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlexibilityMockup() {
  return (
    <div className="flex flex-col h-full p-4 bg-gradient-to-br from-background to-muted/30 rounded-lg">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="text-center space-y-1 pb-2 border-b border-border/30">
          <XCircle className="h-5 w-5 text-primary mx-auto" />
          <div className="text-xs font-semibold text-foreground">Flexible Plans</div>
        </div>
        
        {/* Current Plan */}
        <div className="rounded-lg border border-border/40 bg-card/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Current Plan</span>
            <Badge variant="outline" className="text-[10px] px-1.5">Active</Badge>
          </div>
          <div className="text-sm font-bold text-foreground">Unified Plan</div>
          <div className="text-[10px] text-muted-foreground">Billed monthly</div>
        </div>
        
        {/* Features */}
        <div className="space-y-1.5">
          {["No commitments", "Cancel anytime", "No hidden fees"].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-xs text-foreground">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* Manage Button */}
        <Button variant="outline" size="sm" className="w-full text-xs h-7">
          Manage Subscription
        </Button>
      </div>
    </div>
  );
}

const features = [
  {
    title: "Seamless Model Switching",
    description: "Switch between GPT-4, Claude, and Gemini instantly. No need to juggle multiple apps or lose your workflow.",
    mockup: ModelSwitcherMockup,
  },
  {
    title: "One Plan, All Models",
    description: "Access all AI models in one unified subscription. No need to choose—get everything you need.",
    mockup: UnifiedPlanMockup,
  },
  {
    title: "Save Hundreds Monthly",
    description: "Cancel multiple subscriptions and save money. One plan replaces three separate services.",
    mockup: SaveMoneyMockup,
  },
  {
    title: "Context Preservation",
    description: "Switch models mid-conversation without losing context. Your conversation history stays intact.",
    mockup: ContextPreservationMockup,
  },
  {
    title: "Unlimited Usage",
    description: "Unlimited conversations, messages, and model switches. Use as much as you need, whenever you need it.",
    mockup: UnlimitedUsageMockup,
  },
  {
    title: "Cancel Anytime",
    description: "No commitments, no long-term contracts. Cancel your subscription whenever you want, no questions asked.",
    mockup: FlexibilityMockup,
  },
];

export function Features() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Everything you need in <span className="text-primary">one place</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Powerful features designed to streamline your AI workflow and save you time and money.
          </p>
        </div>

        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => {
            const MockupComponent = feature.mockup;
            return (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
              >
                <MockupComponent />
              </FeatureCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
