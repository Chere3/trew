# Design System - Getting Started

Welcome to the Conversational LLM Platform Design System. This guide will help you get started using our components.

## Installation

The design system is built on top of Next.js, React, and shadcn/ui. All components are available in the `components/` directory.

## Project Structure

```
components/
├── foundations/     # Design tokens (colors, typography, spacing)
├── ui/              # Core shadcn/ui components
├── chat/            # Conversational interface components
├── input/           # Input & action components
├── media/           # Rich content & media components
├── feedback/         # System feedback & states
├── navigation/       # Layout & navigation components
└── user/             # User management components
```

## Basic Usage

### Importing Components

```tsx
import { MessageBubble } from '@/components/chat/MessageBubble'
import { MessageComposer } from '@/components/input/MessageComposer'
```

### Server vs Client Components

Following Next.js best practices:

- **Server Components** (default): Use for data fetching and static content
- **Client Components** (`'use client'`): Use for interactivity, state, and browser APIs

Example:

```tsx
// Server Component
export default function MessageList({ messages }) {
  return (
    <div>
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  )
}

// Client Component
'use client'
export function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false)
  // ... interactive logic
}
```

## Design Tokens

Access design tokens from the foundations:

```tsx
import { tokens, colors, typography, spacing } from '@/components/foundations'
```

## Theming

The design system supports light and dark modes through CSS variables. Toggle themes using the `dark` class on the root element.

## Storybook

View all components and their variants in Storybook:

```bash
bun run storybook
```

Then open [http://localhost:6006](http://localhost:6006)

## Best Practices

1. **Use Server Components by default** - Only add `'use client'` when needed
2. **Compose components** - Pass Server Components as children to Client Components
3. **Use Server Actions** - For mutations, use Server Actions instead of callbacks
4. **Serialize props** - Only pass serializable data from Server to Client Components
5. **Accessibility** - All components follow WCAG guidelines

## Next Steps

- Explore components in Storybook
- Read component-specific documentation
- Check out usage examples in the Examples section
