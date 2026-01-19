import type { Meta, StoryObj } from '@storybook/react'
import { MessageTimestamp } from './MessageTimestamp'

const meta = {
  title: 'Chat/MessageTimestamp',
  component: MessageTimestamp,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'MessageTimestamp component for displaying message timestamps in various formats.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'select',
      options: ['short', 'long', 'relative'],
      description: 'Timestamp format',
    },
  },
} satisfies Meta<typeof MessageTimestamp>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    timestamp: new Date(),
  },
}

export const Playground: Story = {
  args: {
    timestamp: new Date(),
    format: 'short',
  },
}

export const Formats: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Short</p>
        <MessageTimestamp timestamp={new Date()} format="short" />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Long</p>
        <MessageTimestamp timestamp={new Date()} format="long" />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Relative</p>
        <MessageTimestamp timestamp={new Date(Date.now() - 30000)} format="relative" />
      </div>
    </div>
  ),
}

export const RelativeTimes: Story = {
  render: () => (
    <div className="space-y-2">
      <MessageTimestamp timestamp={new Date(Date.now() - 30000)} format="relative" />
      <MessageTimestamp timestamp={new Date(Date.now() - 3600000)} format="relative" />
      <MessageTimestamp timestamp={new Date(Date.now() - 86400000)} format="relative" />
      <MessageTimestamp timestamp={new Date(Date.now() - 604800000)} format="relative" />
    </div>
  ),
}
