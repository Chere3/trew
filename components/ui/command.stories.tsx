import type { Meta, StoryObj } from '@storybook/react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
import { Button } from './button'
import { useState } from 'react'

const meta = {
  title: 'UI/Command',
  component: Command,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Command component for command palette and search interfaces. Uses cmdk library.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Command</Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    )
  },
}

export const Playground: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Files">
              <CommandItem>Document.pdf</CommandItem>
              <CommandItem>Spreadsheet.xlsx</CommandItem>
            </CommandGroup>
            <CommandGroup heading="Settings">
              <CommandItem>Preferences</CommandItem>
              <CommandItem>Account</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    )
  },
}

export const Inline: Story = {
  render: () => (
    <div className="border rounded-lg w-[400px]">
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Files">
            <CommandItem>Document.pdf</CommandItem>
            <CommandItem>Spreadsheet.xlsx</CommandItem>
            <CommandItem>Presentation.pptx</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Recent">
            <CommandItem>Recent File 1</CommandItem>
            <CommandItem>Recent File 2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
}
