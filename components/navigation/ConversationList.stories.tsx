import type { Meta, StoryObj } from '@storybook/react'
import { ConversationList } from './ConversationList'
import { ConversationListSkeleton } from '@/components/chat/ConversationListSkeleton'

const meta = {
  title: 'Navigation/ConversationList',
  component: ConversationList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ConversationList component for displaying a list of conversations with selection and new conversation support.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConversationList>

export default meta
type Story = StoryObj<typeof meta>

const sampleConversations = [
  {
    id: '1',
    title: 'Project Discussion',
    preview: 'Let me know your thoughts on the design...',
    timestamp: new Date(),
    unread: 2,
  },
  {
    id: '2',
    title: 'Team Meeting',
    preview: 'The meeting is scheduled for tomorrow',
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    title: 'Code Review',
    preview: 'I\'ve reviewed the changes and they look good',
    timestamp: new Date(Date.now() - 172800000),
    unread: 1,
  },
]

export const Default: Story = {
  args: {
    conversations: sampleConversations,
    onSelect: (conv) => console.log('Selected:', conv),
  },
}

export const Playground: Story = {
  args: {
    conversations: sampleConversations,
    selectedId: '1',
    onSelect: (conv) => console.log('Selected:', conv),
    onNew: () => console.log('New conversation'),
  },
}

export const WithNewButton: Story = {
  args: {
    conversations: sampleConversations,
    onNew: () => console.log('New conversation'),
    onSelect: (conv) => console.log('Selected:', conv),
  },
}

export const Selected: Story = {
  args: {
    conversations: sampleConversations,
    selectedId: '2',
    onSelect: (conv) => console.log('Selected:', conv),
  },
}

export const Empty: Story = {
  args: {
    conversations: [],
    onNew: () => console.log('New conversation'),
  },
}

export const ManyConversations: Story = {
  args: {
    conversations: Array.from({ length: 20 }).map((_, i) => ({
      id: String(i + 1),
      title: `Conversation ${i + 1}`,
      preview: `Preview text for conversation ${i + 1}`,
      timestamp: new Date(Date.now() - i * 3600000),
      unread: i % 3 === 0 ? i : undefined,
    })),
    onSelect: (conv) => console.log('Selected:', conv),
  },
}

export const Skeleton: Story = {
  args: {
    conversations: Array.from({ length: 4 }).map((_, i) => ({
      id: String(i + 1),
      title: `Conversation ${i + 1}`,
      preview: `Preview text for conversation ${i + 1}`,
      timestamp: new Date(Date.now() - i * 3600000),
      unread: i % 3 === 0 ? i : undefined,
    })),
    onSelect: (conv) => console.log('Selected:', conv),
  },
  render: (args) => <ConversationListSkeleton {...args} />,
}
