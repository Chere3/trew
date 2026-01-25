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
  language = 'text',
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

  // Simple syntax highlighting
  const highlightCode = (code: string, lang: string) => {
    if (!code) return code

    // Safety check: encode HTML entities to prevent injection before processing
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

    const keywords = [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'import', 'export', 'from', 'default', 'class', 'interface', 'type',
      'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'extends', 'implements',
      'public', 'private', 'protected', 'static', 'readonly', 'void'
    ]

    // Regex patterns
    // Strings (single, double, backticks)
    highlighted = highlighted.replace(
      /(['"`])(.*?)\1/g,
      '<span class="text-green-500">$1$2$1</span>'
    )

    // Comments (// and /* */)
    highlighted = highlighted.replace(
      /(\/\/.*)/g,
      '<span class="text-slate-500">$1</span>'
    )

    // Keywords - using word boundary to match exact words
    // We strictly match words that aren't already inside HTML tags from previous replacements
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b(?![^<]*>)`, 'g')
    highlighted = highlighted.replace(
      keywordRegex,
      '<span class="text-purple-400 font-semibold">$1</span>'
    )

    // Function calls
    highlighted = highlighted.replace(
      /\b(\w+)(?=\()/g,
      '<span class="text-blue-400">$1</span>'
    )

    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b(?![^<]*>)/g,
      '<span class="text-orange-400">$1</span>'
    )

    return highlighted
  }

  return (
    <div className={cn('relative group rounded-lg overflow-hidden border border-border/40', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border/20">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {language}
        </span>

        {showCopyButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background/50"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Code Area */}
      <pre
        className={cn(
          'overflow-x-auto bg-[#1e1e1e] p-4 text-sm font-mono leading-relaxed',
          showLineNumbers && 'pl-12'
        )}
      >
        <code
          className="text-gray-300"
          dangerouslySetInnerHTML={{
            __html: highlightCode(code, language)
          }}
        />
      </pre>
    </div>
  )
}
