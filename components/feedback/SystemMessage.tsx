import { cn } from '@/lib/utils'
import { Info, AlertCircle, CheckCircle2, AlertTriangle, LucideIcon } from 'lucide-react'
import type { SystemMessageVariant, SystemMessageProps as SystemMessagePropsType } from '@/lib/types'
import { SYSTEM_MESSAGE_VARIANT_INFO, SYSTEM_MESSAGE_VARIANT_SUCCESS, SYSTEM_MESSAGE_VARIANT_WARNING, SYSTEM_MESSAGE_VARIANT_ERROR } from '@/lib/constants'

export type { SystemMessageVariant }
export type SystemMessageProps = SystemMessagePropsType

interface VariantConfig {
  icon: LucideIcon
  containerClass: string
  iconClass: string
  ringClass: string
}

const variantConfig: Record<SystemMessageVariant, VariantConfig> = {
  [SYSTEM_MESSAGE_VARIANT_INFO]: {
    icon: Info,
    containerClass: 'border-violet-500/10 bg-violet-500/5',
    iconClass: 'text-violet-600 dark:text-violet-400',
    ringClass: 'ring-violet-500/10',
  },
  [SYSTEM_MESSAGE_VARIANT_SUCCESS]: {
    icon: CheckCircle2,
    containerClass: 'border-emerald-500/10 bg-emerald-500/5',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    ringClass: 'ring-emerald-500/10',
  },
  [SYSTEM_MESSAGE_VARIANT_WARNING]: {
    icon: AlertTriangle,
    containerClass: 'border-amber-500/10 bg-amber-500/5',
    iconClass: 'text-amber-600 dark:text-amber-400',
    ringClass: 'ring-amber-500/10',
  },
  [SYSTEM_MESSAGE_VARIANT_ERROR]: {
    icon: AlertCircle,
    containerClass: 'border-destructive/10 bg-destructive/5',
    iconClass: 'text-destructive',
    ringClass: 'ring-destructive/10',
  },
}

export function SystemMessage({
  title,
  message,
  variant = SYSTEM_MESSAGE_VARIANT_INFO,
  className,
}: SystemMessageProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border animate-fade-in",
        config.containerClass,
        className
      )}
    >
      <div className={cn(
        "rounded-full bg-background p-4 mb-4 shadow-sm ring-1",
        config.ringClass
      )}>
        <Icon className={cn("h-8 w-8", config.iconClass)} />
      </div>

      {title && (
        <h3 className="text-lg font-bold text-foreground mb-2 tracking-tight">
          {title}
        </h3>
      )}

      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {message}
      </p>
    </div>
  )
}
