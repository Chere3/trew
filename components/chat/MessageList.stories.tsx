import type { Meta, StoryObj } from '@storybook/react'
import { useState, useCallback } from 'react'
import { MessageList, type Message } from './MessageList'

const meta = {
  title: 'Chat/MessageList',
  component: MessageList,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'MessageList component with virtualization for efficiently displaying large numbers of chat messages. Only visible messages are rendered in the DOM.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageList>

export default meta
type Story = StoryObj<typeof meta>

// Helper function to generate sample messages
const generateMessages = (count: number, startTime: number = Date.now()): Message[] => {
  const sampleUserMessages = [
    "What is React?",
    "Can you explain TypeScript?",
    "How does virtualization work?",
    "Tell me about Next.js",
    "What are the benefits of server-side rendering?",
    "Explain the difference between useState and useRef",
    "How do I optimize React performance?",
    "What is the virtual DOM?",
    "Can you help me with async/await?",
    "What's the best way to handle forms in React?",
  ]

  const sampleAssistantMessages = [
    "React is a JavaScript library for building user interfaces, particularly web applications. It was developed by Facebook and allows developers to create reusable UI components.",
    "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static type definitions to JavaScript, which helps catch errors during development.",
    "Virtualization is a technique used to render only the visible items in a list, rather than rendering all items at once. This significantly improves performance for large lists.",
    "Next.js is a React framework that provides server-side rendering, static site generation, and other optimizations out of the box. It's built on top of React and Node.js.",
    "Server-side rendering (SSR) improves initial page load time, enables better SEO, and provides a better experience for users with slower connections or devices.",
    "useState is used for managing component state that triggers re-renders, while useRef is used for storing mutable values that don't trigger re-renders when changed.",
    "You can optimize React performance by using React.memo, useMemo, useCallback, code splitting, and virtualization for long lists.",
    "The virtual DOM is a programming concept where a virtual representation of the UI is kept in memory and synced with the real DOM. React uses it to optimize updates.",
    "async/await is a modern way to handle asynchronous operations in JavaScript. It makes asynchronous code look and behave more like synchronous code.",
    "The best way to handle forms in React is using controlled components with useState, or using libraries like react-hook-form for more complex forms with validation.",
  ]

  return Array.from({ length: count }).map((_, i) => {
    const isUser = i % 2 === 0
    const messageIndex = Math.floor(i / 2) % sampleUserMessages.length
    const baseTime = startTime - (count - i) * 60000 // 1 minute apart
    
    return {
      id: `msg-${i}`,
      role: isUser ? ('user' as const) : ('assistant' as const),
      content: isUser 
        ? sampleUserMessages[messageIndex]
        : sampleAssistantMessages[messageIndex],
      createdAt: baseTime,
      model: isUser ? undefined : 'gpt-4',
    }
  })
}

export const Default: Story = {
  args: {
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'Hello! How can I help you today?',
        createdAt: Date.now() - 60000,
      },
      {
        id: '2',
        role: 'assistant',
        content: 'I can help you with a variety of tasks. What would you like to know?',
        createdAt: Date.now(),
        model: 'gpt-4',
      },
    ],
    className: 'h-[600px]',
  },
}

export const MultipleMessages: Story = {
  args: {
    messages: [
      {
        id: '1',
        role: 'user',
        content: 'What is React?',
        createdAt: Date.now() - 120000,
      },
      {
        id: '2',
        role: 'assistant',
        content: 'React is a JavaScript library for building user interfaces.',
        createdAt: Date.now() - 90000,
        model: 'gpt-4',
      },
      {
        id: '3',
        role: 'user',
        content: 'Can you tell me more?',
        createdAt: Date.now() - 60000,
      },
      {
        id: '4',
        role: 'assistant',
        content: 'React allows you to build reusable UI components and manage application state efficiently.',
        createdAt: Date.now() - 30000,
        model: 'gpt-4',
      },
    ],
    className: 'h-[600px]',
  },
}

export const LongConversation: Story = {
  args: {
    messages: generateMessages(20),
    className: 'h-[600px]',
  },
}

export const InfiniteScrollTest: Story = {
  render: (args) => {
    const [messages, setMessages] = useState<Message[]>(() => generateMessages(100))
    const [isLoadingOlder, setIsLoadingOlder] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const handleScrollNearTop = useCallback(() => {
      if (isLoadingOlder || !hasMore) return

      setIsLoadingOlder(true)
      
      // Simulate loading older messages
      setTimeout(() => {
        const olderMessages = generateMessages(20, messages[0].createdAt - 1200000)
        setMessages((prev) => [...olderMessages, ...prev])
        setIsLoadingOlder(false)
        
        // Stop loading after 200 messages
        if (messages.length + 20 >= 200) {
          setHasMore(false)
        }
      }, 1000)
    }, [messages, isLoadingOlder, hasMore])

    return (
      <div className="h-screen w-full bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Infinite Scroll Test - 100 Messages</h2>
          <p className="text-sm text-muted-foreground">
            Scroll up to load older messages. Currently showing {messages.length} messages.
            {hasMore ? ' More available.' : ' All messages loaded.'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Only visible messages are rendered in the DOM. Check DevTools to see the reduced DOM nodes.
          </p>
        </div>
        <MessageList
          {...args}
          messages={messages}
          isLoadingOlder={isLoadingOlder}
          hasMore={hasMore}
          onScrollNearTop={handleScrollNearTop}
          className="h-[calc(100vh-100px)]"
        />
      </div>
    )
  },
  args: {
    messages: [],
    className: '',
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive test of infinite scrolling with 100 initial messages. Scroll up near the top (within 200px) to trigger loading of older messages. Only visible messages are rendered in the DOM thanks to virtualization, significantly reducing DOM nodes even with hundreds of messages.',
      },
    },
  },
}

export const OneHundredMessages: Story = {
  args: {
    messages: generateMessages(100),
    className: 'h-[800px]',
  },
  parameters: {
    docs: {
      description: {
        story: 'Display 100 messages with virtualization. Only visible messages are rendered, significantly reducing DOM nodes.',
      },
    },
  },
}

export const WithStreaming: Story = {
  render: (args) => {
    const [messages, setMessages] = useState<Message[]>([
      {
        id: '1',
        role: 'user',
        content: 'Generate a long response for me',
        createdAt: Date.now() - 60000,
      },
      {
        id: '2',
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        isStreaming: true,
        model: 'gpt-4',
      },
    ])

    // Simulate streaming
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === '2'
            ? { ...msg, content: 'This is a streaming message that appears character by character...', isStreaming: true }
            : msg
        )
      )
    }, 500)

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === '2' ? { ...msg, isStreaming: false } : msg
        )
      )
    }, 2000)

    return <MessageList {...args} messages={messages} className="h-[600px]" />
  },
  args: {
    messages: [],
  },
}
