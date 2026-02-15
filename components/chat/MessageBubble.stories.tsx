import type { Meta, StoryObj } from '@storybook/react'
import { MessageBubble } from './MessageBubble'
import { MessageBubbleSkeleton } from './MessageBubbleSkeleton'
import { expect, userEvent, within } from '@storybook/test'

const meta = {
  title: 'Chat/MessageBubble',
  component: MessageBubble,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageBubble>

export default meta
type Story = StoryObj<typeof meta>

export const User: Story = {
  args: {
    role: 'user',
    content: 'Hello! How can I help you today?',
    timestamp: new Date(),
    avatarFallback: 'U',
  },
}

export const Assistant: Story = {
  args: {
    role: 'assistant',
    content: 'I can help you with a variety of tasks. What would you like to know?',
    timestamp: new Date(),
    avatarFallback: 'AI',
  },
}

export const System: Story = {
  args: {
    role: 'system',
    content: 'System message: Connection established',
  },
}

export const Streaming: Story = {
  args: {
    role: 'assistant',
    content: 'This is a streaming message',
    isStreaming: true,
    timestamp: new Date(),
  },
}

export const WithError: Story = {
  args: {
    role: 'assistant',
    content: 'Failed to process your request',
    hasError: true,
    onRetry: () => console.log('Retry clicked'),
    timestamp: new Date(),
  },
}

export const WithActions: Story = {
  args: {
    role: 'assistant',
    content: 'This message has action buttons',
    timestamp: new Date(),
    onCopy: () => console.log('Copy clicked'),
    onFeedback: (positive) => console.log('Feedback:', positive),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const message = canvas.getByText('This message has action buttons')
    await expect(message).toBeInTheDocument()
    // Hover to show actions
    await userEvent.hover(message.closest('div') as HTMLElement)
  },
}

export const SkeletonUser: Story = {
  args: {
    role: 'user',
    content: 'Hello! How can I help you today?',
  },
  render: (args) => <MessageBubbleSkeleton {...args} />,
}

export const SkeletonAssistant: Story = {
  args: {
    role: 'assistant',
    content: 'I can help you with a variety of tasks. What would you like to know?',
  },
  render: (args) => <MessageBubbleSkeleton {...args} />,
}
