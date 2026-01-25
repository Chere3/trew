import type { Meta, StoryObj } from '@storybook/react'
import { LaTeXRenderer } from './LaTeXRenderer'

const meta = {
  title: 'Media/LaTeXRenderer',
  component: LaTeXRenderer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'LaTeXRenderer component for rendering LaTeX math expressions in chat messages.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LaTeXRenderer>

export default meta
type Story = StoryObj<typeof meta>

export const InlineMath: Story = {
  args: {
    content: 'E = mc^2',
    displayMode: false,
  },
}

export const BlockMath: Story = {
  args: {
    content: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
    displayMode: true,
  },
}

export const ComplexEquation: Story = {
  args: {
    content: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    displayMode: true,
  },
}

export const Matrix: Story = {
  args: {
    content: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
    displayMode: true,
  },
}

export const Summation: Story = {
  args: {
    content: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
    displayMode: true,
  },
}

export const Integral: Story = {
  args: {
    content: '\\int_{0}^{\\pi} \\sin(x) dx = 2',
    displayMode: true,
  },
}

export const MultipleInline: Story = {
  args: {
    content: '',
  },
  render: () => (
    <div className="space-y-2">
      <p>
        The Pythagorean theorem states that <LaTeXRenderer content="a^2 + b^2 = c^2" displayMode={false} /> for a right triangle.
      </p>
      <p>
        Einstein's mass-energy equivalence: <LaTeXRenderer content="E = mc^2" displayMode={false} />
      </p>
      <p>
        The quadratic formula: <LaTeXRenderer content="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" displayMode={false} />
      </p>
    </div>
  ),
}

export const WithMarkdown: Story = {
  args: {
    content: '',
  },
  render: () => (
    <div className="space-y-4">
      <p>
        Here's an inline formula: <LaTeXRenderer content="\\sum_{i=1}^{n} x_i" displayMode={false} /> in a sentence.
      </p>
      <div>
        <p className="mb-2">And here's a block formula:</p>
        <LaTeXRenderer content="\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}" displayMode={true} />
      </div>
    </div>
  ),
}
