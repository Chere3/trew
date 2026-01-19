'use client'

import { cn } from '@/lib/utils'

export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy'

export interface PresenceIndicatorProps {
  status: PresenceStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
}

export function PresenceIndicator({
  status,
  size = 'md',
  className,
}: PresenceIndicatorProps) {
  return (
    <div
      className={cn(
        'rounded-full border-2 border-background',
        sizeMap[size],
        statusColors[status],
        status === 'online' && 'animate-pulse',
        className
      )}
    />
  )
}
