'use client'

import { cn } from '@/lib/utils'

export interface TypingIndicatorProps {
  className?: string
  variant?: 'dots' | 'pulse'
}

export function TypingIndicator({
  className,
  variant = 'dots',
}: TypingIndicatorProps) {
  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center gap-1.5 px-4 py-2.5', className)}>
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-pulse" />
          <div className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="h-2 w-2 bg-muted-foreground/60 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3 px-4 py-2', className)}>
      <div className="flex gap-1.5">
        <div
          className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        />
        <div
          className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce"
          style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
        />
        <div
          className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce"
          style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium">Typing...</span>
    </div>
  )
}
