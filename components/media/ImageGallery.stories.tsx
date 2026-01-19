import type { Meta, StoryObj } from '@storybook/react'
import { ImageGallery } from './ImageGallery'

const meta = {
  title: 'Media/ImageGallery',
  component: ImageGallery,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ImageGallery component for displaying images in a grid with lightbox view.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4],
      description: 'Number of columns',
    },
  },
} satisfies Meta<typeof ImageGallery>

export default meta
type Story = StoryObj<typeof meta>

const sampleImages = [
  { id: '1', src: 'https://via.placeholder.com/300', alt: 'Image 1' },
  { id: '2', src: 'https://via.placeholder.com/300', alt: 'Image 2' },
  { id: '3', src: 'https://via.placeholder.com/300', alt: 'Image 3' },
  { id: '4', src: 'https://via.placeholder.com/300', alt: 'Image 4' },
]

export const Default: Story = {
  args: {
    images: sampleImages,
  },
}

export const Playground: Story = {
  args: {
    images: sampleImages,
    columns: 3,
  },
}

export const Columns: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium mb-2">1 Column</p>
        <ImageGallery images={sampleImages.slice(0, 3)} columns={1} />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">2 Columns</p>
        <ImageGallery images={sampleImages} columns={2} />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">3 Columns</p>
        <ImageGallery images={sampleImages} columns={3} />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">4 Columns</p>
        <ImageGallery images={sampleImages} columns={4} />
      </div>
    </div>
  ),
}

export const ManyImages: Story = {
  render: () => {
    const manyImages = Array.from({ length: 12 }).map((_, i) => ({
      id: String(i + 1),
      src: `https://via.placeholder.com/300?text=Image+${i + 1}`,
      alt: `Image ${i + 1}`,
    }))
    return <ImageGallery images={manyImages} columns={3} />
  },
}
