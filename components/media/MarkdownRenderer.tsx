import { cn } from '@/lib/utils'
import { CodeBlock } from './CodeBlock'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import type { Components } from 'react-markdown'
import { useMemo } from 'react'

export interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  // Preprocess content to convert \(...\) to $...$ and \[...\] to $$...$$
  // remark-math doesn't support \(...\) syntax, only $...$ and $$...$$
  const processedContent = useMemo(() => {
    let processed = content;
    // Convert \[...\] to $$...$$ (block math) - do this first to avoid conflicts
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, mathContent) => {
      const trimmed = mathContent.trim();
      return `$$${trimmed}$$`;
    });
    // Convert \(...\) to $...$ (inline math)
    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (match, mathContent) => {
      const trimmed = mathContent.trim();
      if (trimmed.length > 0) {
        // Trim the content and wrap in $...$ - remark-math requires no spaces around delimiters
        return `$${trimmed}$`;
      }
      return match; // Don't convert if empty
    });
    
    // Convert regular parentheses containing LaTeX expressions to $...$
    // Look for patterns like ( \mathbf{F} = m\mathbf{a} ) on their own lines
    // Handle nested parentheses by matching from the end of line backwards
    // Split by lines and process each line separately to handle multi-line expressions
    const lines = processed.split('\n');
    const processedLines = lines.map(line => {
      // Match ( ... ) patterns that contain LaTeX (backslashes)
      // Use a greedy approach: find opening ( and match until closing ) that's not part of LaTeX command
      // For expressions on their own line, match the whole line pattern
      if (/^\s*\(\s*.*\\.*\)\s*$/.test(line)) {
        // Line starts with ( and ends with ), contains backslash - likely a math expression
        const match = line.match(/^\s*\(\s*(.+?)\s*\)\s*$/);
        if (match) {
          const mathContent = match[1].trim();
          if (mathContent.includes('\\')) {
            return line.replace(/^\s*\(\s*(.+?)\s*\)\s*$/, `$$${mathContent}$`);
          }
        }
      }
      // Also handle inline patterns: text ( ... ) text
      // Use a balanced parentheses approach
      let result = line;
      let pos = 0;
      while (pos < result.length) {
        const openParen = result.indexOf('(', pos);
        if (openParen === -1) break;
        
        // Find the matching closing paren by counting
        let depth = 1;
        let closeParen = openParen + 1;
        while (closeParen < result.length && depth > 0) {
          if (result[closeParen] === '(') depth++;
          else if (result[closeParen] === ')') depth--;
          closeParen++;
        }
        
        if (depth === 0) {
          // Found balanced parentheses
          const match = result.substring(openParen, closeParen);
          const mathContent = result.substring(openParen + 1, closeParen - 1).trim();
          
          // Check if it contains LaTeX (backslashes)
          if (mathContent.includes('\\')) {
            result = result.substring(0, openParen) + `$${mathContent}$` + result.substring(closeParen);
            pos = openParen + mathContent.length + 3; // Skip past the replacement
          } else {
            pos = closeParen;
          }
        } else {
          pos = openParen + 1;
        }
      }
      return result;
    });
    processed = processedLines.join('\n');
    
    return processed;
  }, [content]);

  const components: Components = {
    // Custom code block renderer
    code({ node, className, children, ...props }) {
      // Check if this is an inline code element or a block
      const isInline = !className || !className.startsWith('language-')
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : 'text'
      const code = String(children).replace(/\n$/, '')

      if (!isInline && match) {
        return (
          <div className="not-prose my-4">
            <CodeBlock
              code={code}
              language={language}
              showLineNumbers={true}
            />
          </div>
        )
      }

      return (
        <code className={cn('inline-code', className)} {...props}>
          {children}
        </code>
      )
    },
    // Style headers
    h1: ({ node, ...props }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-3xl font-semibold mt-6 mb-4 pb-2 border-b border-border/40" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-2xl font-semibold mt-5 mb-3" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-xl font-bold mt-4 mb-2" {...props} />
    ),
    h5: ({ node, ...props }) => (
      <h5 className="text-lg font-bold mt-4 mb-2" {...props} />
    ),
    h6: ({ node, ...props }) => (
      <h6 className="text-base font-bold mt-4 mb-2" {...props} />
    ),
    // Style horizontal rules
    hr: ({ node, ...props }) => (
      <hr className="my-6 border-border/40" {...props} />
    ),
    // Style links
    a: ({ node, ...props }) => (
      <a target="_blank" rel="noopener noreferrer" {...props} />
    ),
    // Style tables
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-4 rounded-lg border">
        <table className="w-full text-sm" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-muted/50" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="border px-4 py-2 text-left font-bold" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="border px-4 py-2" {...props} />
    ),
  }

  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath]} 
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
