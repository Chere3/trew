import { render } from '@testing-library/react'
import { ReactElement } from 'react'
import '../app/globals.css'

/**
 * Test utilities for component testing
 */

export function renderWithProviders(ui: ReactElement) {
  return render(ui)
}

export function createMockFile(name: string, type: string, size: number = 1024): File {
  const file = new File([''], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

export const mockDate = (date: Date) => {
  const originalDate = global.Date
  global.Date = class extends originalDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(date)
      } else {
        super(...args)
      }
    }
  } as any
  return () => {
    global.Date = originalDate
  }
}
