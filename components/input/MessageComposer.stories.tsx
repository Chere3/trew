import type { Meta, StoryObj } from '@storybook/react'
import { MessageComposer } from './MessageComposer'
import { MessageComposerSkeleton } from './MessageComposerSkeleton'
import { within, expect, userEvent } from '@storybook/test'

const meta = {
  title: 'Input/MessageComposer',
  component: MessageComposer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageComposer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type your message...',
    onSend: (message) => console.log('Sent:', message),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByPlaceholderText('Type your message...')
    await expect(textarea).toBeInTheDocument()
    await userEvent.type(textarea, 'Test message')
    await expect(textarea).toHaveValue('Test message')
  },
}

export const WithAttachments: Story = {
  args: {
    placeholder: 'Type your message...',
    onSend: (message) => console.log('Sent:', message),
    onAttachment: () => console.log('Attachment clicked'),
    onVoiceInput: () => console.log('Voice input clicked'),
  },
}

export const WithMaxLength: Story = {
  args: {
    placeholder: 'Type your message...',
    maxLength: 100,
    onSend: (message) => console.log('Sent:', message),
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Type your message...',
    disabled: true,
  },
}

export const Skeleton: Story = {
  args: {},
  render: (args) => <MessageComposerSkeleton {...args} />,
}
