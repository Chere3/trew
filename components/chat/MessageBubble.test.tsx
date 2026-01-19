import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageBubble } from './MessageBubble'

describe('MessageBubble', () => {
  it('renders user message', () => {
    render(
      <MessageBubble
        role="user"
        content="Hello"
        timestamp={new Date()}
      />
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders assistant message', () => {
    render(
      <MessageBubble
        role="assistant"
        content="Hi there"
        timestamp={new Date()}
      />
    )
    expect(screen.getByText('Hi there')).toBeInTheDocument()
  })

  it('renders system message', () => {
    render(
      <MessageBubble
        role="system"
        content="System message"
      />
    )
    expect(screen.getByText('System message')).toBeInTheDocument()
  })

  it('handles copy action', async () => {
    const handleCopy = vi.fn()
    const user = userEvent.setup()
    render(
      <MessageBubble
        role="assistant"
        content="Test message"
        timestamp={new Date()}
        onCopy={handleCopy}
      />
    )
    // Copy button appears on hover, so we need to trigger hover first
    const messageContainer = screen.getByText('Test message').closest('div')
    if (messageContainer) {
      await user.hover(messageContainer)
      const copyButton = screen.getByTitle('Copy message')
      await user.click(copyButton)
      expect(handleCopy).toHaveBeenCalled()
    }
  })

  it('displays streaming indicator', () => {
    render(
      <MessageBubble
        role="assistant"
        content="Streaming"
        isStreaming={true}
        timestamp={new Date()}
      />
    )
    expect(screen.getByText('Streaming')).toBeInTheDocument()
  })

  it('displays error state', () => {
    render(
      <MessageBubble
        role="assistant"
        content="Error message"
        hasError={true}
        timestamp={new Date()}
      />
    )
    expect(screen.getByText(/Failed to send message/i)).toBeInTheDocument()
  })
})
