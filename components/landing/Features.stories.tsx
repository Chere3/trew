import type { Meta, StoryObj } from '@storybook/react'
import { Features } from './Features'

const meta = {
  title: 'Landing/Features',
  component: Features,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Features section displaying key value propositions with UI component mockups. Each feature card includes a visual mockup, gradient title overlay, and description.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Features>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Features />,
}

export const InContext: Story = {
  render: () => (
    <div className="min-h-screen bg-background">
      <Features />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Features section in full page context with background.',
      },
    },
  },
}
