'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CellValue = ReactNode

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  key: keyof T & string
  header: string
  render?: (value: unknown, row: T) => ReactNode
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: TableColumn<T>[]
  data: T[]
  className?: string
  striped?: boolean
  hoverable?: boolean
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  className,
  striped = true,
  hoverable = true,
}: TableProps<T>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-2 text-left text-sm font-medium text-muted-foreground',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                'border-b',
                striped && rowIndex % 2 === 0 && 'bg-muted/50',
                hoverable && 'hover:bg-muted/50 transition-colors'
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-2 text-sm',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : (row[column.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
