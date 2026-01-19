"use client";

import { Mail, Twitter, Linkedin, Github, Youtube, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface FooterProps {
  philosophy?: string;
  className?: string;
}

const defaultPhilosophy = "Unifying intelligence. Empowering creators.";

const navigationSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "About", href: "#about" },
      { label: "Blog", href: "#blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#about-us" },
      { label: "Careers", href: "#careers" },
      { label: "Contact", href: "#contact" },
      { label: "Press", href: "#press" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "Support", href: "#support" },
      { label: "API", href: "#api" },
      { label: "Community", href: "#community" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
      { label: "Cookie Policy", href: "#cookies" },
      { label: "Security", href: "#security" },
    ],
  },
];

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "#twitter" },
  { icon: Linkedin, label: "LinkedIn", href: "#linkedin" },
  { icon: Github, label: "GitHub", href: "#github" },
  { icon: Youtube, label: "YouTube", href: "#youtube" },
];

export function Footer({ philosophy = defaultPhilosophy, className }: FooterProps) {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  // Create duplicate content for seamless infinite scroll
  const PhilosophyText = () => (
    <h2 
      className="uppercase font-bold tracking-tighter text-primary whitespace-nowrap"
      style={{ 
        fontSize: 'calc(100% + 2rem)',
        lineHeight: '1',
        height: '100%',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {philosophy}
    </h2>
  );

  return (
    <footer
      className={cn(
        "relative border-t border-border/50 bg-background overflow-hidden",
        className
      )}
    >
      {/* Subtle grid pattern */}
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

      {/* Background accent */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 bottom-0 h-[600px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Philosophy Statement - Giant Letters with Horizontal Scroll - Full Width */}
      <section className="overflow-hidden w-full" style={{ height: 'clamp(10rem, vh, 18rem)' }}>
        <div className="relative w-full h-full">
          <div className="flex animate-scroll-horizontal whitespace-nowrap will-change-transform h-full items-center">
            {/* Duplicate content for seamless infinite scroll - animation moves -50% */}
            {[...Array(2)].map((_, groupIndex) => (
              <div key={groupIndex} className="flex flex-shrink-0 items-center h-full">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`${groupIndex}-${i}`}
                    className="inline-block text-left px-8 lg:px-12 flex-shrink-0 h-full flex items-center"
                  >
                    <PhilosophyText />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Main Footer Content */}
        <div className="border-t border-border/30 pt-16 pb-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            {/* Newsletter Section - Takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Stay updated
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Get the latest updates on new features, AI models, and product
                announcements.
              </p>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" variant="hero" className="group">
                  Subscribe
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </div>

            {/* Navigation Columns */}
            {navigationSections.map((section) => (
              <nav key={section.title} className="flex flex-col">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/30 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Trew. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
