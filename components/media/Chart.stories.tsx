import type { Meta, StoryObj } from '@storybook/react'
import { Chart } from './Chart'

const meta = {
  title: 'Media/Chart',
  component: Chart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Chart component wrapper for displaying charts and data visualizations.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Chart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Sample Chart',
    children: (
      <div className="h-64 flex items-center justify-center bg-muted rounded">
        <p className="text-muted-foreground">Chart content goes here</p>
      </div>
    ),
  },
}

export const Playground: Story = {
  args: {
    title: 'Chart Title',
    description: 'Chart description',
    children: (
      <div className="h-64 flex items-center justify-center bg-muted rounded">
        <p className="text-muted-foreground">Chart visualization</p>
      </div>
    ),
  },
}

export const WithDescription: Story = {
  args: {
    title: 'Monthly Revenue',
    description: 'Revenue data for the past 12 months',
    children: (
      <div className="h-64 flex items-center justify-center bg-muted rounded">
        <p className="text-muted-foreground">Chart visualization</p>
      </div>
    ),
  },
}

export const WithoutTitle: Story = {
  args: {
    children: (
      <Chart>
        <div className="h-64 flex items-center justify-center bg-muted rounded">
          <p className="text-muted-foreground">Chart without title</p>
        </div>
      </Chart>
    ),
  }
}

export const MultipleCharts: Story = {
  args: {
    children: (
      <div className="grid grid-cols-2 gap-4">
        <Chart title="Chart 1">
          <div className="h-48 flex items-center justify-center bg-muted rounded">
            <p className="text-sm text-muted-foreground">Chart 1</p>
          </div>
        </Chart>
        <Chart title="Chart 2">
          <div className="h-48 flex items-center justify-center bg-muted rounded">
            <p className="text-sm text-muted-foreground">Chart 2</p>
          </div>
        </Chart>
      </div>
    ),
  }
}
