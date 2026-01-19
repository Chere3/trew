"use client";

import Link from "next/link";
import { Home, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
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
      
      {/* Background accent blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute left-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto text-center animate-fade-in">
        {/* Large 404 number */}
        <div className="mb-6 relative">
          <h1 className="text-8xl sm:text-9xl md:text-[12rem] font-bold tracking-tight text-foreground/10 dark:text-foreground/5 relative">
            404
            <span className="absolute inset-0 text-primary/20 dark:text-primary/10 blur-sm">
              404
            </span>
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <Compass className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-primary/30 animate-spin-slow" />
          </div>
        </div>

        {/* Card container */}
        <Card className="border-border/50 shadow-soft-lg backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 px-6 sm:px-8">
            {/* Playful handwritten message */}
            <div className="mb-4">
              <p 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2"
                style={{ fontFamily: 'var(--font-caveat), cursive' }}
              >
                Oops! This page wandered off...
              </p>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              The page you're looking for seems to have taken a wrong turn. 
              Don't worry, even the best AI models get lost sometimes!
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full sm:w-auto group"
                asChild
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto group"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Go Back
              </Button>
            </div>

            {/* Additional helpful links */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">
                Or try one of these:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                <Link 
                  href="/" 
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Home
                </Link>
                <span className="text-border">•</span>
                <Link 
                  href="/pricing" 
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Pricing
                </Link>
                <span className="text-border">•</span>
                <Link 
                  href="/register" 
                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
