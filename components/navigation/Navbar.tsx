'use client'

import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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
  ctaLabel = 'Get started',
  onCtaClick,
  isLoggedIn = false,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center">
            {logo || (
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/brand/trew-mark-black.png"
                  alt="Trew"
                  width={44}
                  height={44}
                  priority
                  className="block dark:hidden"
                />
                <Image
                  src="/brand/trew-mark-white.png"
                  alt="Trew"
                  width={44}
                  height={44}
                  priority
                  className="hidden dark:block"
                />
                <span className="text-base font-semibold tracking-tight text-foreground">Trew</span>
              </Link>
            )}
          </div>

          <div className="hidden md:flex md:items-center md:gap-7">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:gap-3">
            <ThemeToggle variant="button" />
            {!isLoggedIn &&
              (onCtaClick ? (
                <Button size="sm" onClick={onCtaClick}>
                  {ctaLabel}
                </Button>
              ) : (
                <Button size="sm" asChild>
                  <Link href="/register">{ctaLabel}</Link>
                </Button>
              ))}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle variant="button" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {!isLoggedIn && (
                <div className="pt-2">
                  {onCtaClick ? (
                    <Button className="w-full" onClick={onCtaClick}>
                      {ctaLabel}
                    </Button>
                  ) : (
                    <Button className="w-full" asChild>
                      <Link href="/register">{ctaLabel}</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
