'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ChartProps {
  title?: string
  children: React.ReactNode
  className?: string
  description?: string
}

export function Chart({ title, children, className, description }: ChartProps) {
  return (
    <Card className={cn('w-full', className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
