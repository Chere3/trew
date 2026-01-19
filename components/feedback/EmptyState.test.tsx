import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No items" />)
    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <EmptyState
        title="No items"
        description="Get started by creating an item"
      />
    )
    expect(screen.getByText('Get started by creating an item')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    render(
      <EmptyState
        title="No items"
        action={{
          label: 'Create Item',
          onClick: () => {},
        }}
      />
    )
    expect(screen.getByText('Create Item')).toBeInTheDocument()
  })

  it('calls action onClick when button is clicked', async () => {
    const handleAction = vi.fn()
    const user = userEvent.setup()
    render(
      <EmptyState
        title="No items"
        action={{
          label: 'Create',
          onClick: handleAction,
        }}
      />
    )
    const button = screen.getByText('Create')
    await user.click(button)
    expect(handleAction).toHaveBeenCalledOnce()
  })

  it('renders icon when provided', () => {
    render(
      <EmptyState
        title="No items"
        icon={<span data-testid="icon">Icon</span>}
      />
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
