"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, X, Sparkles, Bot, Brain, Zap, Shield, Users, Infinity, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export type BillingPeriod = "monthly" | "annual";

interface PricingFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  badge?: string;
  popular?: boolean;
  features: PricingFeature[];
  cta: string;
  ctaVariant?: "default" | "hero" | "outline";
}

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out AI models",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { name: "Flagship models", included: true },
      { name: "Other models", included: false },
      { name: "Outdated models", included: false },
      { name: "250 messages/month", included: true },
      { name: "Unlimited conversations", included: true },
      { name: "Model switching", included: true },
      { name: "Context preservation", included: true },
      { name: "Community support", included: true },
      { name: "Email support", included: false },
      { name: "Priority support", included: false },
      { name: "API access", included: false },
      { name: "Team collaboration", included: false },
    ],
    cta: "Get Started",
    ctaVariant: "outline",
  },
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individuals getting started with AI",
    monthlyPrice: 19,
    annualPrice: 15, // $15/month when billed annually
    features: [
      { name: "Flagship models", included: true },
      { name: "Other models", included: true },
      { name: "Outdated models", included: false },
      { name: "5,000 messages/month", included: true },
      { name: "Unlimited conversations", included: true },
      { name: "Model switching", included: true },
      { name: "Context preservation", included: true },
      { name: "Email support", included: true },
      { name: "Priority support", included: false },
      { name: "API access", included: false },
      { name: "Team collaboration", included: false },
    ],
    cta: "Start Free Trial",
    ctaVariant: "outline",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals who need more messages and advanced features",
    monthlyPrice: 29,
    annualPrice: 24, // $24/month when billed annually
    badge: "Most Popular",
    popular: true,
    features: [
      { name: "Flagship models", included: true },
      { name: "Other models", included: true },
      { name: "Outdated models", included: true },
      { name: "Unlimited messages", included: true },
      { name: "Unlimited conversations", included: true },
      { name: "Model switching", included: true },
      { name: "Context preservation", included: true },
      { name: "Email support", included: true },
      { name: "Priority support", included: true },
      { name: "API access", included: true },
      { name: "Team collaboration", included: false },
    ],
    cta: "Start Free Trial",
    ctaVariant: "hero",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Advanced features for teams and organizations",
    monthlyPrice: 99,
    annualPrice: 79, // $79/month when billed annually
    features: [
      { name: "Flagship models", included: true },
      { name: "Other models", included: true },
      { name: "Outdated models", included: true },
      { name: "Unlimited messages", included: true },
      { name: "Unlimited conversations", included: true },
      { name: "Model switching", included: true },
      { name: "Context preservation", included: true },
      { name: "Email support", included: true },
      { name: "Priority support", included: true },
      { name: "API access", included: true },
      { name: "Team collaboration", included: true },
      { name: "Custom integrations", included: true },
      { name: "Dedicated support", included: true },
      { name: "SLA guarantee", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline",
  },
];

const featureComparison = [
  { category: "AI Models", features: [
    { name: "Flagship models", free: true, starter: true, pro: true, enterprise: true },
    { name: "Other models", free: false, starter: true, pro: true, enterprise: true },
    { name: "Outdated models", free: false, starter: false, pro: true, enterprise: true },
  ]},
  { category: "Usage", features: [
    { name: "Messages per month", free: "250", starter: "5,000", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Conversations", free: "Unlimited", starter: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Model switches", free: "Unlimited", starter: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
  ]},
  { category: "Features", features: [
    { name: "Context preservation", free: true, starter: true, pro: true, enterprise: true },
    { name: "Seamless model switching", free: true, starter: true, pro: true, enterprise: true },
    { name: "API access", free: false, starter: false, pro: true, enterprise: true },
  ]},
  { category: "Support", features: [
    { name: "Community support", free: true, starter: false, pro: false, enterprise: false },
    { name: "Email support", free: false, starter: true, pro: true, enterprise: true },
    { name: "Priority support", free: false, starter: false, pro: true, enterprise: true },
    { name: "Dedicated support", free: false, starter: false, pro: false, enterprise: true },
    { name: "SLA guarantee", free: false, starter: false, pro: false, enterprise: true },
  ]},
  { category: "Team", features: [
    { name: "Team collaboration", free: false, starter: false, pro: false, enterprise: true },
    { name: "Custom integrations", free: false, starter: false, pro: false, enterprise: true },
  ]},
];

export const faqs = [
  {
    question: "What AI models are included in Trew?",
    answer: "Trew provides access to flagship models, other models, and outdated models depending on your plan. The free tier includes flagship models, while paid plans unlock additional model categories. All models are available in one unified subscription, allowing you to switch between them seamlessly."
  },
  {
    question: "How are messages counted?",
    answer: "Message counts are estimated based on typical usage patterns. The actual number of messages you can send may vary depending on message length and complexity. We provide generous limits to ensure you can use Trew effectively for your needs."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with no commitments or long-term contracts. There are no cancellation fees or penalties."
  },
  {
    question: "What happens if I switch plans?",
    answer: "You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, we offer a free trial period so you can experience all features before committing to a paid plan."
  },
  {
    question: "Are there any hidden fees?",
    answer: "No, there are no hidden fees. The price you see is the price you pay. No setup fees, no overage charges, and no surprise costs."
  },
  {
    question: "Do you offer annual billing discounts?",
    answer: "Yes, we offer significant savings when you choose annual billing. Annual plans typically save you 2 months compared to monthly billing."
  },
  {
    question: "Can I switch between AI models mid-conversation?",
    answer: "Yes, one of Trew's key features is seamless model switching. You can switch between different AI models during a conversation without losing context, allowing you to use the best model for each task."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners."
  },
];

export function PricingCard({ tier, billingPeriod }: { tier: PricingTier; billingPeriod: BillingPeriod }) {
  const price = billingPeriod === "monthly" ? tier.monthlyPrice : tier.annualPrice;
  const savings = billingPeriod === "annual" 
    ? Math.round(((tier.monthlyPrice * 12) - (tier.annualPrice * 12)) / (tier.monthlyPrice * 12) * 100)
    : 0;

  return (
    <Card
      className={cn(
        "relative flex flex-col h-full transition-all duration-300",
        "border border-border/50 bg-card/80 backdrop-blur-sm",
        "hover:border-primary/30 hover:shadow-xl hover:scale-[1.02]",
        tier.popular && "border-2 border-primary/50 shadow-lg shadow-primary/10"
      )}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge variant="default" className="px-4 py-1">
            {tier.badge}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
        <CardDescription className="mt-2">{tier.description}</CardDescription>
        
        <div className="mt-6">
          {price === 0 ? (
            <div className="text-center">
              <span className="text-4xl font-bold text-foreground">Free</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-foreground">${price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              {billingPeriod === "annual" && savings > 0 && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Save {savings}% annually
                  </Badge>
                </div>
              )}
              {billingPeriod === "annual" && (
                <p className="text-sm text-muted-foreground mt-2">
                  Billed ${tier.annualPrice * 12} annually
                </p>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
              )}
              <span className={cn(
                "text-sm",
                feature.included ? "text-foreground" : "text-muted-foreground line-through"
              )}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          variant={tier.ctaVariant || "default"}
          size="lg"
          className="w-full"
          asChild
        >
          <Link href="/register">
            {tier.cta}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border/50 rounded-lg bg-card/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent/50 transition-colors rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-foreground pr-4">{question}</span>
        <HelpCircle className={cn(
          "h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");

  const calculateSavings = (tier: PricingTier) => {
    if (billingPeriod === "monthly") return 0;
    const monthlyTotal = tier.monthlyPrice * 12;
    const annualTotal = tier.annualPrice * 12;
    return Math.round(((monthlyTotal - annualTotal) / monthlyTotal) * 100);
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
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

      {/* Background Accent */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-12 sm:pt-32 sm:pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Simple, transparent <span className="text-primary">pricing</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Choose the perfect plan for your AI needs. All plans include access to multiple AI models,
                seamless switching, and context preservation. Cancel anytime, no hidden fees.
              </p>
            </div>
          </div>
        </section>

        {/* Billing Toggle */}
        <section className="pb-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-center gap-4">
              <span className={cn(
                "text-sm font-medium transition-colors",
                billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"
              )}>
                Monthly
              </span>
              <Switch
                checked={billingPeriod === "annual"}
                onCheckedChange={(checked) => setBillingPeriod(checked ? "annual" : "monthly")}
                aria-label="Toggle billing period"
              />
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  billingPeriod === "annual" ? "text-foreground" : "text-muted-foreground"
                )}>
                  Annual
                </span>
                {billingPeriod === "annual" && (
                  <Badge variant="secondary" className="text-xs">
                    Save up to 20%
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {pricingTiers.map((tier) => (
                <PricingCard key={tier.id} tier={tier} billingPeriod={billingPeriod} />
              ))}
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-base sm:text-lg">Cancel Anytime</h3>
                  <p className="text-sm text-muted-foreground">No commitments or long-term contracts</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-base sm:text-lg">No Hidden Fees</h3>
                  <p className="text-sm text-muted-foreground">The price you see is what you pay</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Check className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-base sm:text-lg">Money-Back Guarantee</h3>
                  <p className="text-sm text-muted-foreground">30-day satisfaction guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Compare plans
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See exactly what's included in each plan
              </p>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
                  <table className="min-w-full divide-y divide-border/50">
                    <thead className="bg-muted/30">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                          Feature
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                          Free
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                          Starter
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                          Pro
                        </th>
                        <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                          Enterprise
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-background/50">
                      {featureComparison.map((category, categoryIndex) => (
                        <React.Fragment key={categoryIndex}>
                          <tr>
                            <td colSpan={5} className="px-6 py-3 bg-muted/20">
                              <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
                                {category.category}
                              </span>
                            </td>
                          </tr>
                          {category.features.map((feature, featureIndex) => (
                            <tr key={featureIndex} className="hover:bg-accent/30 transition-colors">
                              <td className="px-6 py-4 text-sm text-foreground">
                                {feature.name}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {typeof feature.free === "boolean" ? (
                                  feature.free ? (
                                    <Check className="h-5 w-5 text-primary mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sm text-foreground">{feature.free}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {typeof feature.starter === "boolean" ? (
                                  feature.starter ? (
                                    <Check className="h-5 w-5 text-primary mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sm text-foreground">{feature.starter}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {typeof feature.pro === "boolean" ? (
                                  feature.pro ? (
                                    <Check className="h-5 w-5 text-primary mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sm text-foreground">{feature.pro}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {typeof feature.enterprise === "boolean" ? (
                                  feature.enterprise ? (
                                    <Check className="h-5 w-5 text-primary mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sm text-foreground">{feature.enterprise}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Cards */}
            <div className="lg:hidden space-y-6">
              {pricingTiers.map((tier) => (
                <Card key={tier.id} className="border border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      {tier.popular && (
                        <Badge variant="default">{tier.badge}</Badge>
                      )}
                    </div>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {featureComparison.map((category) => (
                        <div key={category.category} className="space-y-2">
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
                            {category.category}
                          </h4>
                          {category.features.map((feature) => {
                            const tierValue = tier.id === "free" ? feature.free :
                                            tier.id === "starter" ? feature.starter : 
                                            tier.id === "pro" ? feature.pro : feature.enterprise;
                            return (
                              <div key={feature.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                                <span className="text-sm text-foreground">{feature.name}</span>
                                {typeof tierValue === "boolean" ? (
                                  tierValue ? (
                                    <Check className="h-4 w-4 text-primary" />
                                  ) : (
                                    <X className="h-4 w-4 text-muted-foreground/50" />
                                  )
                                ) : (
                                  <span className="text-sm font-medium text-foreground">{tierValue}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-24">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about Trew pricing
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
