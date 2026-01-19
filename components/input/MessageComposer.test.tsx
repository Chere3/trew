import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageComposer } from './MessageComposer'

describe('MessageComposer', () => {
  it('renders textarea', () => {
    render(<MessageComposer />)
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(<MessageComposer />)
    const textarea = screen.getByPlaceholderText('Type your message...')
    await user.type(textarea, 'Test message')
    expect(textarea).toHaveValue('Test message')
  })

  it('calls onSend when Enter is pressed', async () => {
    const handleSend = vi.fn()
    const user = userEvent.setup()
    render(<MessageComposer onSend={handleSend} />)
    const textarea = screen.getByPlaceholderText('Type your message...')
    await user.type(textarea, 'Test message')
    await user.keyboard('{Enter}')
    expect(handleSend).toHaveBeenCalledWith('Test message')
  })

  it('does not send empty message', async () => {
    const handleSend = vi.fn()
    const user = userEvent.setup()
    render(<MessageComposer onSend={handleSend} />)
    const textarea = screen.getByPlaceholderText('Type your message...')
    await user.type(textarea, '   ')
    await user.keyboard('{Enter}')
    expect(handleSend).not.toHaveBeenCalled()
  })

  it('respects maxLength', async () => {
    const user = userEvent.setup()
    render(<MessageComposer maxLength={10} />)
    const textarea = screen.getByPlaceholderText('Type your message...')
    await user.type(textarea, 'This is too long')
    expect(textarea.value.length).toBeLessThanOrEqual(10)
  })

  it('disables when disabled prop is true', () => {
    render(<MessageComposer disabled />)
    expect(screen.getByPlaceholderText('Type your message...')).toBeDisabled()
  })
})
