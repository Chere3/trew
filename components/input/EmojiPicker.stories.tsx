import type { Meta, StoryObj } from '@storybook/react'
import { EmojiPicker } from './EmojiPicker'
import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'
import { useState } from 'react'

const meta = {
  title: 'Input/EmojiPicker',
  component: EmojiPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EmojiPicker>

export default meta
type Story = StoryObj<typeof meta>

function EmojiPickerDemo() {
  const [selectedEmoji, setSelectedEmoji] = useState<string>('')

  return (
    <div className="flex flex-col items-center gap-4">
      <EmojiPicker
        onEmojiSelect={(emoji) => {
          setSelectedEmoji(emoji)
          console.log('Selected emoji:', emoji)
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          aria-label="Open emoji picker"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </EmojiPicker>
      {selectedEmoji && (
        <div className="text-sm text-muted-foreground">
          Last selected: <span className="text-lg">{selectedEmoji}</span>
        </div>
      )}
    </div>
  )
}

export const Default: Story = {
  render: () => <EmojiPickerDemo />,
}

export const WithCustomTrigger: Story = {
  render: () => (
    <EmojiPicker
      onEmojiSelect={(emoji) => console.log('Selected:', emoji)}
    >
      <Button variant="outline" size="sm">
        😊 Pick an Emoji
      </Button>
    </EmojiPicker>
  ),
}

export const Standalone: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Click the button below to open the emoji picker:
      </p>
      <EmojiPicker
        onEmojiSelect={(emoji) => {
          alert(`You selected: ${emoji}`)
        }}
      />
    </div>
  ),
}
