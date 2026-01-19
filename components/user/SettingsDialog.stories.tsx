import type { Meta, StoryObj } from '@storybook/react'
import { SettingsDialog } from './SettingsDialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof SettingsDialog> = {
    title: 'User/SettingsDialog',
    component: SettingsDialog,
    parameters: {
        layout: 'centered',
    },
}

export default meta
type Story = StoryObj<typeof SettingsDialog>

export const Default: Story = {
    render: () => {
        const [open, setOpen] = useState(false)
        return (
            <>
                <Button onClick={() => setOpen(true)}>Open Settings</Button>
                <SettingsDialog open={open} onOpenChange={setOpen} />
            </>
        )
    },
}
