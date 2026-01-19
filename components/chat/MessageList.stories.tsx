import type { Meta, StoryObj } from '@storybook/react'
import { MessageList } from './MessageList'
import { MessageBubble } from './MessageBubble'

const meta = {
  title: 'Chat/MessageList',
  component: MessageList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'MessageList component for containing and displaying multiple chat messages. Provides scrolling and spacing.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <MessageList>
      <MessageBubble
        role="user"
        content="Hello! How can I help you today?"
        timestamp={new Date()}
      />
      <MessageBubble
        role="assistant"
        content="I can help you with a variety of tasks. What would you like to know?"
        timestamp={new Date()}
      />
    </MessageList>
  ),
}

export const Playground: Story = {
  render: () => (
    <MessageList>
      <MessageBubble
        role="user"
        content="Sample user message"
        timestamp={new Date()}
      />
      <MessageBubble
        role="assistant"
        content="Sample assistant response"
        timestamp={new Date()}
      />
    </MessageList>
  ),
}

export const MultipleMessages: Story = {
  render: () => (
    <MessageList>
      <MessageBubble
        role="user"
        content="What is React?"
        timestamp={new Date(Date.now() - 60000)}
      />
      <MessageBubble
        role="assistant"
        content="React is a JavaScript library for building user interfaces."
        timestamp={new Date(Date.now() - 30000)}
      />
      <MessageBubble
        role="user"
        content="Can you tell me more?"
        timestamp={new Date()}
      />
      <MessageBubble
        role="assistant"
        content="React allows you to build reusable UI components and manage application state efficiently."
        timestamp={new Date()}
      />
    </MessageList>
  ),
}

export const WithSystemMessage: Story = {
  render: () => (
    <MessageList>
      <MessageBubble
        role="system"
        content="System: Connection established"
      />
      <MessageBubble
        role="user"
        content="Hello!"
        timestamp={new Date()}
      />
      <MessageBubble
        role="assistant"
        content="Hi there! How can I help?"
        timestamp={new Date()}
      />
    </MessageList>
  ),
}

export const LongConversation: Story = {
  render: () => (
    <MessageList>
      {Array.from({ length: 10 }).map((_, i) => (
        <MessageBubble
          key={i}
          role={i % 2 === 0 ? 'user' : 'assistant'}
          content={`Message ${i + 1}: This is a longer conversation to demonstrate scrolling behavior in the message list.`}
          timestamp={new Date(Date.now() - (10 - i) * 60000)}
        />
      ))}
    </MessageList>
  ),
}
