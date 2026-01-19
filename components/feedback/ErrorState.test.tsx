import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="An error occurred" />)
    expect(screen.getByText('An error occurred')).toBeInTheDocument()
  })

  it('renders custom title', () => {
    render(
      <ErrorState
        title="Custom Error"
        message="Error message"
      />
    )
    expect(screen.getByText('Custom Error')).toBeInTheDocument()
  })

  it('renders default title when not provided', () => {
    render(<ErrorState message="Error message" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const handleRetry = vi.fn()
    render(
      <ErrorState
        message="Error message"
        onRetry={handleRetry}
      />
    )
    expect(screen.getByText(/Try again/i)).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const handleRetry = vi.fn()
    const user = userEvent.setup()
    render(
      <ErrorState
        message="Error message"
        onRetry={handleRetry}
      />
    )
    const retryButton = screen.getByText(/Try again/i)
    await user.click(retryButton)
    expect(handleRetry).toHaveBeenCalledOnce()
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorState message="Error message" />)
    expect(screen.queryByText(/Try again/i)).not.toBeInTheDocument()
  })
})
