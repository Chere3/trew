import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageActions } from './MessageActions'

describe('MessageActions', () => {
  it('renders inline variant by default', () => {
    render(
      <MessageActions
        onCopy={() => {}}
      />
    )
    const button = screen.getByTitle('Copy')
    expect(button).toBeInTheDocument()
  })

  it('handles copy action', async () => {
    const handleCopy = vi.fn()
    const user = userEvent.setup()
    render(
      <MessageActions
        onCopy={handleCopy}
      />
    )
    const copyButton = screen.getByTitle('Copy')
    await user.click(copyButton)
    expect(handleCopy).toHaveBeenCalled()
  })

  it('handles retry action', async () => {
    const handleRetry = vi.fn()
    const user = userEvent.setup()
    render(
      <MessageActions
        onRetry={handleRetry}
      />
    )
    const retryButton = screen.getByTitle('Retry')
    await user.click(retryButton)
    expect(handleRetry).toHaveBeenCalled()
  })

  it('handles feedback actions', async () => {
    const handleFeedback = vi.fn()
    const user = userEvent.setup()
    render(
      <MessageActions
        onFeedback={handleFeedback}
      />
    )
    const thumbsUp = screen.getByTitle('Good response')
    await user.click(thumbsUp)
    expect(handleFeedback).toHaveBeenCalledWith(true)

    const thumbsDown = screen.getByTitle('Poor response')
    await user.click(thumbsDown)
    expect(handleFeedback).toHaveBeenCalledWith(false)
  })

  it('renders dropdown variant', () => {
    render(
      <MessageActions
        variant="dropdown"
        onCopy={() => {}}
      />
    )
    const trigger = screen.getByRole('button')
    expect(trigger).toBeInTheDocument()
  })
})
