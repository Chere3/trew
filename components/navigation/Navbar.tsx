'use client'

import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export interface NavbarProps {
  className?: string
  logo?: ReactNode
  navItems?: Array<{ label: string; href: string }>
  ctaLabel?: string
  onCtaClick?: () => void
  isLoggedIn?: boolean
}

const defaultNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/#about' },
]

export function Navbar({
  className,
  logo,
  navItems = defaultNavItems,
  ctaLabel = 'Get Started free',
  onCtaClick,
  isLoggedIn = false,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 transition-all',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            {logo || (
              <a href="#" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                Trew
              </a>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Button and Theme Toggle - Desktop */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <ThemeToggle variant="button" />
            {!isLoggedIn && (
              onCtaClick ? (
                <Button variant="hero" size="lg" onClick={onCtaClick}>
                  {ctaLabel}
                </Button>
              ) : (
                <Button variant="hero" size="lg" asChild>
                  <Link href="/register">{ctaLabel}</Link>
                </Button>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle variant="button" />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/50 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-foreground">Theme</span>
                  <ThemeToggle variant="dropdown" />
                </div>
                {!isLoggedIn && (
                  onCtaClick ? (
                    <Button variant="hero" size="lg" className="w-full" onClick={onCtaClick}>
                      {ctaLabel}
                    </Button>
                  ) : (
                    <Button variant="hero" size="lg" className="w-full" asChild>
                      <Link href="/register">{ctaLabel}</Link>
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}