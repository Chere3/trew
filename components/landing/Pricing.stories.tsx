import type { Meta, StoryObj } from '@storybook/react'
import { Pricing } from './Pricing'

const meta = {
  title: 'Landing/Pricing',
  component: Pricing,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive pricing page component with hero section, monthly/annual billing toggle, pricing tiers (Starter, Pro, Enterprise), feature comparison table, FAQ accordion, and trust signals. Fully SEO-optimized with structured data support.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Pricing>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Pricing />,
}

export const InContext: Story = {
  render: () => (
    <div className="min-h-screen bg-background">
      <Pricing />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pricing page in full page context with background.',
      },
    },
  },
}
