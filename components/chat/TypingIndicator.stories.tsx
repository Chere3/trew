import type { Meta, StoryObj } from '@storybook/react'
import { TypingIndicator } from './TypingIndicator'

const meta = {
  title: 'Chat/TypingIndicator',
  component: TypingIndicator,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'TypingIndicator component for showing when someone is typing in a chat conversation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['dots', 'pulse'],
      description: 'Animation variant',
    },
  },
} satisfies Meta<typeof TypingIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <TypingIndicator />,
}

export const Playground: Story = {
  args: {
    variant: 'dots',
  },
}

export const Dots: Story = {
  render: () => <TypingIndicator variant="dots" />,
}

export const Pulse: Story = {
  render: () => <TypingIndicator variant="pulse" />,
}

export const InMessage: Story = {
  render: () => (
    <div className="border rounded-lg p-4 max-w-md">
      <TypingIndicator />
    </div>
  ),
}
