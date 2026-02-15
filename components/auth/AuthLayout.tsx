"use client";

import Image from "next/image";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-16">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-7">{children}</div>
        </div>
      </div>

      <div className="relative hidden border-l border-border lg:block">
        <Image
          src="/wallpaper_login.jpg"
          alt="Authentication illustration"
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/40" />
      </div>
    </div>
  );
}
