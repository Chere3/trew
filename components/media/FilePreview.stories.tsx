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
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <FilePreview
        file={{
          id: '1',
          name: 'document.pdf',
          type: 'application/pdf',
          size: 2048000,
        }}
        onDownload={() => console.log('Download PDF')}
      />
      <FilePreview
        file={{
          id: '2',
          name: 'image.jpg',
          type: 'image/jpeg',
          size: 512000,
        }}
        onDownload={() => console.log('Download JPG')}
      />
      <FilePreview
        file={{
          id: '3',
          name: 'spreadsheet.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 1536000,
        }}
        onDownload={() => console.log('Download XLSX')}
      />
    </div>
  ),
}

export const WithActions: Story = {
  render: () => (
    <FilePreview
      file={{
        id: '1',
        name: 'important-document.pdf',
        type: 'application/pdf',
        size: 1024000,
      }}
      onDownload={() => console.log('Download')}
      onRemove={() => console.log('Remove')}
    />
  ),
}

export const WithoutSize: Story = {
  render: () => (
    <FilePreview
      file={{
        id: '1',
        name: 'document.pdf',
        type: 'application/pdf',
      }}
    />
  ),
}
