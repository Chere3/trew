import type { Meta, StoryObj } from '@storybook/react'
import { SearchBar } from './SearchBar'

const meta = {
  title: 'Navigation/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'SearchBar component with debounced search functionality and clear button.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    debounceMs: {
      control: 'number',
      description: 'Debounce delay in milliseconds',
    },
  },
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onSearch: (query) => console.log('Search:', query),
  },
}

export const Playground: Story = {
  args: {
    placeholder: 'Search...',
    onSearch: (query) => console.log('Search:', query),
    debounceMs: 300,
  },
}

export const CustomPlaceholder: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <SearchBar
        placeholder="Search conversations..."
        onSearch={(query) => console.log('Search:', query)}
      />
      <SearchBar
        placeholder="Search messages..."
        onSearch={(query) => console.log('Search:', query)}
      />
    </div>
  ),
}

export const WithDebounce: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <SearchBar
        placeholder="Search with 500ms debounce..."
        onSearch={(query) => console.log('Search:', query)}
        debounceMs={500}
      />
    </div>
  ),
}
