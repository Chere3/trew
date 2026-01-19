import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { Info, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

export type SystemMessageVariant = 'info' | 'success' | 'warning' | 'error'

export interface SystemMessageProps {
  title?: string
  message: string
  variant?: SystemMessageVariant
  className?: string
}

const variantConfig = {
  info: {
    icon: Info,
    className: 'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:border-blue-400/50 dark:bg-blue-400/10',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 dark:border-green-400/50 dark:bg-green-400/10',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400/50 dark:bg-yellow-400/10',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 dark:border-red-400/50 dark:bg-red-400/10',
  },
}

export function SystemMessage({
  title,
  message,
  variant = 'info',
  className,
}: SystemMessageProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Alert className={cn(config.className, className)}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
