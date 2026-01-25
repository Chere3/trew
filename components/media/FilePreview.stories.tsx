import type { Meta, StoryObj } from '@storybook/react'
import { FilePreview } from './FilePreview'


const meta = {
  title: 'Media/FilePreview',
  component: FilePreview,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'FilePreview component for displaying file information with download and remove actions.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FilePreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    file: {
      id: '1',
      name: 'document.pdf',
      type: 'application/pdf',
      size: 1024000,
    },
  },
}

export const Playground: Story = {
  args: {
    file: {
      id: '1',
      name: 'document.pdf',
      type: 'application/pdf',
      size: 1024000,
    },
    onDownload: () => console.log('Download'),
    onRemove: () => console.log('Remove'),
  },
}

export const FileTypes: Story = {
  args: {
    file: {
      id: '1',
      name: 'document.pdf',
      type: 'application/pdf',
      size: 2048000,
    }
  }
}

export const WithActions: Story = {
  args: {
    file: {
      id: '1',
      name: 'document.pdf',
      type: 'application/pdf',
      size: 1024000,
    },
    onDownload: () => console.log('Download'),
    onRemove: () => console.log('Remove'),
  },
}

export const WithoutActions: Story = {
  args: {
    file: {
      id: '1',
      name: 'document.pdf',
      type: 'application/pdf',
      size: 1024000,
    },
  },
}

export const WithoutSize: Story = {
  args: {
    file: {
      id: '1',
      name: 'document.pdf',
      type: 'application/pdf',
    }
  },
}
