import type { Meta, StoryObj } from '@storybook/react'
import { MarkdownRenderer } from './MarkdownRenderer'

const meta = {
  title: 'Media/MarkdownRenderer',
  component: MarkdownRenderer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'MarkdownRenderer component for rendering markdown content in chat messages.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MarkdownRenderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'This is **bold** and this is *italic* text.',
  },
}

export const Playground: Story = {
  args: {
    content: '# Heading\n\nThis is a paragraph with **bold** and *italic* text.',
  },
}

export const WithCode: Story = {
  args: {
    content: `Here is some \`inline code\` and a code block:

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\``}
}

export const WithLinks: Story = {
  args: {
    content: "Visit [our website](https://example.com) for more information."
  }

}

export const LongContent: Story = {
  args: {
    content: `# Introduction

This is a **longer** markdown document with multiple paragraphs.

## Section 1

Here is some content with *emphasis* and \`code\`.

## Section 2

- Item 1
- Item 2
- Item 3

[Learn more](https://example.com)`}
}
