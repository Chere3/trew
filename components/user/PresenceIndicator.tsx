'use client'

import { cn } from '@/lib/utils'
import type { PresenceStatus, PresenceIndicatorProps as PresenceIndicatorPropsType } from '@/lib/types'
import { PRESENCE_STATUS_ONLINE, PRESENCE_STATUS_OFFLINE, PRESENCE_STATUS_AWAY, PRESENCE_STATUS_BUSY } from '@/lib/constants'

export type { PresenceStatus }
export type PresenceIndicatorProps = PresenceIndicatorPropsType

const sizeMap = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
}

const statusColors: Record<PresenceStatus, string> = {
  [PRESENCE_STATUS_ONLINE]: 'bg-green-500',
  [PRESENCE_STATUS_OFFLINE]: 'bg-gray-400',
  [PRESENCE_STATUS_AWAY]: 'bg-yellow-500',
  [PRESENCE_STATUS_BUSY]: 'bg-red-500',
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
        status === PRESENCE_STATUS_ONLINE && 'animate-pulse',
        className
      )}
    />
  )
}
