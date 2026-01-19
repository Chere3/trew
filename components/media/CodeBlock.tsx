'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export interface CodeBlockProps {
  code: string
  language?: string
  className?: string
  showLineNumbers?: boolean
  showCopyButton?: boolean
}

export function CodeBlock({
  code,
  language,
  className,
  showLineNumbers = false,
  showCopyButton = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('relative group', className)}>
      {showCopyButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
      <pre
        className={cn(
          'overflow-x-auto rounded-lg bg-muted p-4 text-sm',
          showLineNumbers && 'pl-12'
        )}
      >
        <code className={language ? `language-${language}` : ''}>{code}</code>
      </pre>
    </div>
  )
}
