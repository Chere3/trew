'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'dots'
  message?: string
  className?: string
  fullScreen?: boolean
}

export function LoadingState({
  variant = 'spinner',
  message,
  className,
  fullScreen = false,
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4 p-4', className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        fullScreen && 'min-h-screen',
        className
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
