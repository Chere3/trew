# Component Guidelines

This document outlines best practices and guidelines for using components in the design system.

## Component Categories

### Chat Components

Components for displaying and managing conversations:

- **MessageBubble**: Individual message display with role variants
- **MessageList**: Container for multiple messages
- **MessageAvatar**: Avatar with presence indicators
- **TypingIndicator**: Loading/thinking animations
- **DateSeparator**: Date dividers in conversations

**Usage Pattern:**
```tsx
<MessageList>
  <MessageBubble
    role="user"
    content="Hello!"
    timestamp={new Date()}
  />
  <MessageBubble
    role="assistant"
    content="Hi there!"
    timestamp={new Date()}
  />
</MessageList>
```

### Input Components

Components for user input and actions:

- **MessageComposer**: Main chat input field
- **QuickReplies**: Suggestion chips
- **AttachmentPicker**: File upload interface
- **VoiceInput**: Voice recording component
- **CommandPalette**: Slash commands interface

**Best Practices:**
- Use Server Actions for form submission
- Handle file uploads via Server Actions or Route Handlers
- Voice input requires browser APIs (Client Component only)

### Media Components

Components for rich content display:

- **CodeBlock**: Syntax-highlighted code
- **ImageGallery**: Image carousel with lightbox
- **FilePreview**: File preview cards
- **MarkdownRenderer**: Rich markdown display
- **Table**: Data tables
- **Chart**: Chart wrapper component

### Feedback Components

Components for system feedback:

- **SystemMessage**: System notifications with variants
- **LoadingState**: Various loading indicators
- **ErrorState**: Error displays with retry
- **EmptyState**: Empty/fallback states
- **ProgressBar**: Progress indicators

### Navigation Components

Components for layout and navigation:

- **Sidebar**: Collapsible sidebar container
- **Header**: Top navigation bar
- **ConversationList**: List of conversations
- **SearchBar**: Global search with debouncing
- **Tabs**: Tab navigation

### User Components

Components for user management:

- **UserProfile**: Profile display card
- **PresenceIndicator**: Online/offline status
- **UserMenu**: User dropdown menu
- **SettingsPanel**: Settings UI

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- Keyboard navigation support
- Screen reader labels
- Color contrast compliance
- Focus management
- ARIA attributes where needed

## Responsive Design

Components are mobile-first and responsive:

- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Test on multiple screen sizes
- Consider touch targets (minimum 44x44px)

## Performance

- Use Server Components for static content
- Lazy load heavy components
- Optimize images with Next.js Image component
- Minimize client-side JavaScript

## TypeScript

All components are fully typed:

```tsx
import type { MessageBubbleProps } from '@/components/chat/MessageBubble'

const props: MessageBubbleProps = {
  role: 'user',
  content: 'Hello',
  // TypeScript will catch missing or incorrect props
}
```

## Customization

Components can be customized via:

1. **Props**: Component-specific props
2. **className**: Additional Tailwind classes
3. **CSS Variables**: Theme customization
4. **Composition**: Combine components for new patterns

## Common Patterns

### Message with Actions

```tsx
<MessageBubble
  role="assistant"
  content="Response text"
  onCopy={() => handleCopy()}
  onFeedback={(positive) => handleFeedback(positive)}
/>
```

### Form with Server Action

```tsx
'use server'
async function sendMessage(formData: FormData) {
  // Server action logic
}

'use client'
export function MessageForm() {
  return (
    <form action={sendMessage}>
      <MessageComposer />
    </form>
  )
}
```

### Loading States

```tsx
{isLoading ? (
  <LoadingState variant="spinner" message="Loading..." />
) : (
  <Content />
)}
```

## Questions?

- Check Storybook for interactive examples
- Review component source code
- See usage examples in the Examples section
