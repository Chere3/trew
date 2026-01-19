import type { Meta, StoryObj } from '@storybook/react'
import { Header } from './Header'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Navigation/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Header component for top navigation bar with backdrop blur and shadow effects.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Header>
      <div className="flex items-center justify-between w-full">
        <h1 className="text-lg font-semibold">Application</h1>
        <Button size="sm">Action</Button>
      </div>
    </Header>
  ),
}

export const Playground: Story = {
  render: () => (
    <Header>
      <div className="flex items-center justify-between w-full">
        <h1 className="text-lg font-semibold">Header Title</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Button 1</Button>
          <Button size="sm">Button 2</Button>
        </div>
      </div>
    </Header>
  ),
}

export const WithNavigation: Story = {
  render: () => (
    <Header>
      <div className="flex items-center justify-between w-full">
        <nav className="flex gap-4">
          <a href="#" className="text-sm font-medium">Home</a>
          <a href="#" className="text-sm font-medium">About</a>
          <a href="#" className="text-sm font-medium">Contact</a>
        </nav>
        <Button size="sm">Sign In</Button>
      </div>
    </Header>
  ),
}

export const WithSearch: Story = {
  render: () => (
    <Header>
      <div className="flex items-center gap-4 w-full">
        <h1 className="text-lg font-semibold">App</h1>
        <div className="flex-1 max-w-md">
          <input
            type="search"
            placeholder="Search..."
            className="w-full px-3 py-1.5 text-sm border rounded-md"
          />
        </div>
        <Button size="sm">Profile</Button>
      </div>
    </Header>
  ),
}
