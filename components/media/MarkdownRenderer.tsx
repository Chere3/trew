import { cn } from '@/lib/utils'
import { CodeBlock } from './CodeBlock'

export interface MarkdownRendererProps {
  content: string
  className?: string
}

// Simple markdown renderer - in production, use a library like react-markdown
export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  // Basic markdown parsing (simplified version)
  // For production, use react-markdown or similar
  const parseMarkdown = (text: string) => {
    let html = text

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="code-block"><code class="language-${lang || 'text'}">${code}</code></pre>`
    })

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    // Line breaks
    html = html.replace(/\n/g, '<br />')

    return html
  }

  return (
    <div
      className={cn('prose prose-sm dark:prose-invert max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  )
}
