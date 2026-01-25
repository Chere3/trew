import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export interface LaTeXRendererProps {
  content: string
  className?: string
  displayMode?: boolean
}

export function LaTeXRenderer({
  content,
  className,
  displayMode = false,
}: LaTeXRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    try {
      setError(null)
      katex.render(content, containerRef.current, {
        throwOnError: false,
        displayMode,
        errorColor: '#cc0000',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render LaTeX')
    }
  }, [content, displayMode])

  if (error) {
    return (
      <div className={cn('text-destructive text-sm', className)}>
        LaTeX Error: {error}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        displayMode ? 'my-4' : 'inline-block',
        className
      )}
    />
  )
}
