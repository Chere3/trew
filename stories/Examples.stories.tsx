import type { Meta, StoryObj } from '@storybook/react-vite'
import { MessageList } from '@/components/chat/MessageList'
import { MessageComposer } from '@/components/input/MessageComposer'
import type { Message } from '@/lib/types'

const meta = {
  title: 'Examples/Conversation Flow',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const sampleMessages: Message[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: "Hello! I need help with my project.",
    createdAt: Date.now() - 300000, // 5 minutes ago
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: "I'd be happy to help! What kind of project are you working on?",
    createdAt: Date.now() - 240000, // 4 minutes ago
  },
  {
    id: 'msg-3',
    role: 'user',
    content: "I'm building a conversational AI platform.",
    createdAt: Date.now() - 180000, // 3 minutes ago
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: "That sounds exciting! A conversational AI platform typically involves natural language processing, message handling, and user interaction components. What specific aspects would you like help with?",
    createdAt: Date.now() - 120000, // 2 minutes ago
  },
]

export const FullConversation: Story = {
  render: () => (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={sampleMessages} />
      </div>
      <MessageComposer
        onSend={(message) => console.log('Sent:', message)}
        placeholder="Type your message..."
      />
    </div>
  ),
}
