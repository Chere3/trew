import type { Meta, StoryObj } from '@storybook/react'
import { CommandPalette } from './CommandPalette'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Settings, User, Search } from 'lucide-react'

const meta = {
  title: 'Input/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'CommandPalette component for quick command access and search functionality.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CommandPalette>

export default meta
type Story = StoryObj<typeof meta>

const sampleCommands = [
  {
    id: '1',
    label: 'New Document',
    description: 'Create a new document',
    icon: <FileText className="h-4 w-4" />,
    keywords: ['new', 'doc', 'create'],
  },
  {
    id: '2',
    label: 'Settings',
    description: 'Open settings',
    icon: <Settings className="h-4 w-4" />,
    keywords: ['preferences', 'config'],
  },
  {
    id: '3',
    label: 'Profile',
    description: 'View your profile',
    icon: <User className="h-4 w-4" />,
    keywords: ['account', 'user'],
  },
  {
    id: '4',
    label: 'Search',
    description: 'Search conversations',
    icon: <Search className="h-4 w-4" />,
    keywords: ['find', 'lookup'],
  },
]

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
        <CommandPalette
          commands={sampleCommands}
          open={open}
          onOpenChange={setOpen}
          onSelect={(cmd) => console.log('Selected:', cmd)}
        />
      </>
    )
  },
}

export const Playground: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <CommandPalette
          commands={sampleCommands}
          open={open}
          onOpenChange={setOpen}
          onSelect={(cmd) => console.log('Selected:', cmd)}
          placeholder="Type a command..."
        />
      </>
    )
  },
}

export const ManyCommands: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const manyCommands = Array.from({ length: 20 }).map((_, i) => ({
      id: String(i + 1),
      label: `Command ${i + 1}`,
      description: `Description for command ${i + 1}`,
      keywords: [`cmd${i + 1}`, `option${i + 1}`],
    }))
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <CommandPalette
          commands={manyCommands}
          open={open}
          onOpenChange={setOpen}
          onSelect={(cmd) => console.log('Selected:', cmd)}
        />
      </>
    )
  },
}
