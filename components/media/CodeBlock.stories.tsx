import type { Meta, StoryObj } from '@storybook/react'
import { CodeBlock } from './CodeBlock'

const meta = {
  title: 'Media/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'CodeBlock component for displaying code with syntax highlighting and copy functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'text',
      description: 'Programming language',
    },
    showLineNumbers: {
      control: 'boolean',
      description: 'Show line numbers',
    },
    showCopyButton: {
      control: 'boolean',
      description: 'Show copy button',
    },
  },
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

const sampleCode = `function greet(name: string) {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);`

export const Default: Story = {
  args: {
    code: sampleCode,
  },
}

export const Playground: Story = {
  args: {
    code: sampleCode,
    language: 'typescript',
    showLineNumbers: false,
    showCopyButton: true,
  },
}

export const Languages: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">TypeScript</p>
        <CodeBlock code={sampleCode} language="typescript" />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">JavaScript</p>
        <CodeBlock code="const x = 42;" language="javascript" />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Python</p>
        <CodeBlock code="def hello():\n    print('Hello')" language="python" />
      </div>
    </div>
  ),
}

export const WithLineNumbers: Story = {
  render: () => (
    <CodeBlock
      code={sampleCode}
      language="typescript"
      showLineNumbers={true}
    />
  ),
}

export const WithoutCopyButton: Story = {
  render: () => (
    <CodeBlock
      code={sampleCode}
      language="typescript"
      showCopyButton={false}
    />
  ),
}

export const LongCode: Story = {
  render: () => (
    <CodeBlock
      code={`// This is a longer code example
function processData(data: any[]) {
  return data
    .filter(item => item.active)
    .map(item => ({
      id: item.id,
      name: item.name.toUpperCase(),
      timestamp: new Date(item.createdAt)
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);
}`}
      language="typescript"
    />
  ),
}
