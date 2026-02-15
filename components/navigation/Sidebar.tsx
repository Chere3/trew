'use client'

import { cn } from '@/lib/utils'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

export interface SidebarProps {
  children: ReactNode
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  defaultCollapsed?: boolean
  minWidth?: number
  maxWidth?: number
}

export function Sidebar({
  children,
  className,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  defaultCollapsed = false,
  minWidth = 240,
  maxWidth = 480
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const [width, setWidth] = useState(280) // Default width
  const [isResizing, setIsResizing] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // initialize without effect to avoid setState-in-effect lint
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const sidebarRef = useRef<HTMLElement>(null)

  // Use controlled or uncontrolled state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed

  const handleCollapsedChange = (newCollapsed: boolean) => {
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(newCollapsed)
    }
    onCollapsedChange?.(newCollapsed)
  }

  // Detect reduced motion preference (subscribe only)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Handle resizing
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth)
        }
      }
    },
    [isResizing, minWidth, maxWidth]
  )

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    window.addEventListener('mouseup', stopResizing)
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [resize, stopResizing])

  // Handle Escape key to collapse sidebar (only when sidebar is expanded)
  useEffect(() => {
    if (isCollapsed) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (controlledCollapsed === undefined) {
          setInternalCollapsed(true)
        }
        onCollapsedChange?.(true)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isCollapsed, controlledCollapsed, onCollapsedChange])

  return (
    <aside
      ref={sidebarRef}
      id="sidebar"
      aria-label="Navigation sidebar"
      className={cn(
        // Distinct background color (secondary/muted)
        'bg-card',
        'flex flex-col h-full relative group',
        'border-r border-border',
        // Smooth transitions with reduced motion support
        prefersReducedMotion || isResizing
          ? 'transition-none'
          : 'transition-all duration-200 ease-out',
        // Hide completely when collapsed
        isCollapsed ? 'w-0 overflow-hidden border-r-0' : '',
        className
      )}
      style={{
        width: isCollapsed ? 0 : width,
        // Use transform for GPU acceleration when not reduced motion
        ...(prefersReducedMotion ? {} : {
          willChange: isResizing ? 'width' : undefined
        })
      }}
    >
      <div id="sidebar-content" className="flex flex-col h-full overflow-hidden">
        {children}
      </div>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-50",
            isResizing && "bg-primary/50 w-1.5"
          )}
          onMouseDown={startResizing}
        />
      )}
    </aside>
  )
}

// Sub-components for better structure
export function SidebarHeader({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center px-4 py-3 border-b border-border', className)}>
      {children}
    </div>
  )
}

export function SidebarContent({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex-1 min-h-0 overflow-hidden flex flex-col', className)}>
      {children}
    </div>
  )
}

export function SidebarFooter({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('p-4 border-t border-border', className)}>
      {children}
    </div>
  )
}
