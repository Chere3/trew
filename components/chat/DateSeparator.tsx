import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface DateSeparatorProps {
  date: Date
  className?: string
}

export function DateSeparator({ date, className }: DateSeparatorProps) {
  const formatDate = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }

  return (
    <div className={cn('flex items-center gap-4 my-6', className)}>
      <Separator className="flex-1 border-primary/20" />
      <span className="text-xs text-muted-foreground font-medium tracking-tight px-3 py-1.5 rounded-full bg-accent/30 border border-primary/10">
        {formatDate()}
      </span>
      <Separator className="flex-1 border-primary/20" />
    </div>
  )
}
