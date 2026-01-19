import type { Meta, StoryObj } from '@storybook/react'
import { ConversationList } from './ConversationList'

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
  render: () => (
    <div className="h-[400px] w-[300px] border rounded-lg">
      <ConversationList
        conversations={sampleConversations}
        onNew={() => console.log('New conversation')}
        onSelect={(conv) => console.log('Selected:', conv)}
      />
    </div>
  ),
}

export const Selected: Story = {
  render: () => (
    <div className="h-[400px] w-[300px] border rounded-lg">
      <ConversationList
        conversations={sampleConversations}
        selectedId="2"
        onSelect={(conv) => console.log('Selected:', conv)}
      />
    </div>
  ),
}

export const Empty: Story = {
  render: () => (
    <div className="h-[400px] w-[300px] border rounded-lg">
      <ConversationList
        conversations={[]}
        onNew={() => console.log('New conversation')}
      />
    </div>
  ),
}

export const ManyConversations: Story = {
  render: () => {
    const manyConversations = Array.from({ length: 20 }).map((_, i) => ({
      id: String(i + 1),
      title: `Conversation ${i + 1}`,
      preview: `Preview text for conversation ${i + 1}`,
      timestamp: new Date(Date.now() - i * 3600000),
      unread: i % 3 === 0 ? i : undefined,
    }))
    return (
      <div className="h-[500px] w-[300px] border rounded-lg">
        <ConversationList
          conversations={manyConversations}
          onSelect={(conv) => console.log('Selected:', conv)}
        />
      </div>
    )
  },
}
