import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-destructive/10 bg-destructive/5 dark:bg-destructive/10 animate-fade-in",
        className
      )}
    >
      <div className="rounded-full bg-background p-4 mb-5 shadow-sm ring-1 ring-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <h3 className="text-lg font-bold text-foreground mb-2 tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="group bg-background border-destructive/20 hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive transition-all duration-300 shadow-sm"
        >
          <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          Try again
        </Button>
      )}
    </div>
  )
}
