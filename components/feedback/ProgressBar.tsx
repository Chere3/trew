'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  className,
  variant = 'default',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const variantClasses = {
    default: '',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  }

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="text-muted-foreground">
              {value} / {max} ({Math.round(percentage)}%)
            </span>
          )}
        </div>
      )}
      <Progress value={percentage} className={variantClasses[variant]} />
    </div>
  )
}
