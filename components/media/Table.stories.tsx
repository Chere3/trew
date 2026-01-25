import type { Meta, StoryObj } from '@storybook/react'
import { Table } from './Table'
import { Badge } from '@/components/ui/badge'

const meta = {
  title: 'Media/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Table component for displaying structured data in rows and columns.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
]

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
]

export const Default: Story = {
  args: {
    columns,
    data: sampleData,
  },
}

export const Playground: Story = {
  args: {
    columns,
    data: sampleData,
    striped: true,
    hoverable: true,
  },
}

export const WithCustomRender: Story = {
  args: {
    columns,
    data: sampleData,
  },
  render: () => (
    <Table
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        {
          key: 'role',
          header: 'Role',
          render: (value) => (
            <Badge variant={value === 'Admin' ? 'default' : 'secondary'}>
              {value}
            </Badge>
          ),
        },
      ]}
      data={sampleData}
    />
  ),
}

export const AlignedColumns: Story = {
  args: {
    columns,
    data: sampleData,
  },
}

export const ManyRows: Story = {
  args: {
    columns,
    data: Array.from({ length: 20 }).map((_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? 'Admin' : 'User',
    }))
  },
}

export const WithoutStripes: Story = {
  args: {
    columns,
    data: sampleData,
    striped: false,
  },
}
