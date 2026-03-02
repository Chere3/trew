import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingState } from './LoadingState'

describe('LoadingState', () => {
  it('renders spinner variant', () => {
    const { container } = render(<LoadingState variant="spinner" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders skeleton variant', () => {
    const { container } = render(<LoadingState variant="skeleton" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders dots variant', () => {
    const { container } = render(<LoadingState variant="dots" />)
    expect(container.firstChild).toBeInTheDocument()
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
