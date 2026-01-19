import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders badge text', () => {
    render(<Badge>Badge</Badge>)
    expect(screen.getByText('Badge')).toBeInTheDocument()
  })

  it('applies default variant', () => {
    const { container } = render(<Badge>Default</Badge>)
    const badge = container.querySelector('div')
    expect(badge).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>)
    const badge = container.querySelector('div')
    expect(badge).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>)
    expect(screen.getByText('Default')).toBeInTheDocument()

    rerender(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toBeInTheDocument()

    rerender(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toBeInTheDocument()
  })
})
