import type { Meta, StoryObj } from '@storybook/react'
import { Footer } from './Footer'

const meta = {
  title: 'Landing/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive footer component with large philosophy statement display, navigation links, newsletter signup, social media links, and legal information. Designed to match the existing landing page design system.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Footer />,
}

export const InContext: Story = {
  render: () => (
    <div className="min-h-screen bg-background">
      <div className="h-96 bg-gradient-to-b from-primary/10 to-transparent flex items-center justify-center">
        <p className="text-muted-foreground">Page content above footer</p>
      </div>
      <Footer />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Footer component in full page context with background and content above.',
      },
    },
  },
}

export const CustomPhilosophy: Story = {
  render: () => (
    <Footer philosophy="Building the future of AI accessibility. One model at a time." />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Footer with custom philosophy statement.',
      },
    },
  },
}
