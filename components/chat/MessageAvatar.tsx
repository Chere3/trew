'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle } from 'lucide-react'

export interface MessageAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  isOnline?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function MessageAvatar({
  src,
  alt,
  fallback,
  isOnline,
  size = 'md',
  className,
}: MessageAvatarProps) {
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <Avatar className={cn(sizeMap[size], 'ring-2 ring-background shadow-sm')}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback className="text-xs font-medium bg-muted">
          {fallback || 'U'}
        </AvatarFallback>
      </Avatar>
      {isOnline !== undefined && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5 ring-2 ring-background">
          {isOnline ? (
            <CheckCircle2 className="h-3 w-3 text-green-600 fill-green-600 dark:text-green-400 dark:fill-green-400" />
          ) : (
            <Circle className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  )
}
