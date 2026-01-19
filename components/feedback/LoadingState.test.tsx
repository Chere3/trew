import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingState } from './LoadingState'

describe('LoadingState', () => {
  it('renders spinner variant', () => {
    render(<LoadingState variant="spinner" />)
    // Check for loading indicator
    const container = screen.getByRole('generic')
    expect(container).toBeInTheDocument()
  })

  it('renders skeleton variant', () => {
    render(<LoadingState variant="skeleton" />)
    const container = screen.getByRole('generic')
    expect(container).toBeInTheDocument()
  })

  it('renders dots variant', () => {
    render(<LoadingState variant="dots" />)
    const container = screen.getByRole('generic')
    expect(container).toBeInTheDocument()
  })

  it('displays message when provided', () => {
    render(<LoadingState variant="spinner" message="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('renders full screen when fullScreen is true', () => {
    const { container } = render(<LoadingState variant="spinner" fullScreen />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
