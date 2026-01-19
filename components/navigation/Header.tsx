'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export interface HeaderProps {
  children: ReactNode
  className?: string
}

export function Header({ children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 shadow-soft',
        className
      )}
    >
      <div className="flex h-14 items-center px-6">{children}</div>
    </header>
  )
}
