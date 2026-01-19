import { cn } from '@/lib/utils'

export interface MessageTimestampProps {
  timestamp: Date
  format?: 'short' | 'long' | 'relative'
  className?: string
}

export function MessageTimestamp({
  timestamp,
  format = 'short',
  className,
}: MessageTimestampProps) {
  const formatTimestamp = () => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (format === 'relative') {
      if (minutes < 1) return 'Just now'
      if (minutes < 60) return `${minutes}m ago`
      if (hours < 24) return `${hours}h ago`
      if (days < 7) return `${days}d ago`
    }

    if (format === 'long') {
      return timestamp.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    }

    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <span className={cn('text-xs text-muted-foreground', className)}>
      {formatTimestamp()}
    </span>
  )
}
