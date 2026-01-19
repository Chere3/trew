import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './EmptyState'
import { Inbox, MessageSquare } from 'lucide-react'

const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'EmptyState component for displaying empty or no-content states with optional actions.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'No items found',
  },
}

export const Playground: Story = {
  args: {
    title: 'Empty State',
    description: 'This is an empty state description',
    action: {
      label: 'Create Item',
      onClick: () => console.log('Action clicked'),
    },
  },
}

export const WithIcon: Story = {
  args: {
    icon: <Inbox className="h-12 w-12" />,
    title: 'No messages',
    description: "You don't have any messages yet. Start a conversation!",
  },
  render: () => (
    <EmptyState
      icon={<Inbox className="h-12 w-12" />}
      title="No messages"
      description="You don't have any messages yet. Start a conversation!"
    />
  ),
}

export const WithAction: Story = {
  args: {
    icon: <MessageSquare className="h-12 w-12" />,
    title: 'No conversations',
    description: "You don't have any conversations yet. Start a conversation!",
    action: {
      label: 'New Conversation',
      onClick: () => console.log('New conversation'),
    },
  },
  render: () => (
    <EmptyState
      icon={<MessageSquare className="h-12 w-12" />}
      title="No conversations"
      description="Get started by creating your first conversation."
      action={{
        label: 'New Conversation',
        onClick: () => console.log('New conversation'),
      }}
    />
  ),
}

export const Simple: Story = {
  args: {
    title: 'Nothing here',
    description: 'This area is empty.',
  },
  render: () => (
    <EmptyState
      title="Nothing here"
      description="This area is empty."
    />
  ),
}
