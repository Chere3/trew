import type { Meta, StoryObj } from '@storybook/react-vite'
import { MessageList } from '@/components/chat/MessageList'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { MessageComposer } from '@/components/input/MessageComposer'
import { DateSeparator } from '@/components/chat/DateSeparator'

const meta = {
  title: 'Examples/Conversation Flow',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FullConversation: Story = {
  render: () => (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <MessageList>
          <DateSeparator date={new Date()} />
          <MessageBubble
            role="user"
            content="Hello! I need help with my project."
            timestamp={new Date()}
            avatarFallback="U"
          />
          <MessageBubble
            role="assistant"
            content="I'd be happy to help! What kind of project are you working on?"
            timestamp={new Date()}
            avatarFallback="AI"
          />
          <MessageBubble
            role="user"
            content="I'm building a conversational AI platform."
            timestamp={new Date()}
            avatarFallback="U"
          />
          <MessageBubble
            role="assistant"
            content="That sounds exciting! A conversational AI platform typically involves natural language processing, message handling, and user interaction components. What specific aspects would you like help with?"
            timestamp={new Date()}
            avatarFallback="AI"
            onCopy={() => console.log('Copied')}
            onFeedback={(positive) => console.log('Feedback:', positive)}
          />
        </MessageList>
      </div>
      <MessageComposer
        onSend={(message) => console.log('Sent:', message)}
        placeholder="Type your message..."
      />
    </div>
  ),
}
