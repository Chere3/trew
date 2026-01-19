'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { SettingsPanel } from './SettingsPanel'

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[600px] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl bg-background/95 backdrop-blur-xl sm:rounded-2xl ring-1 ring-border/10">
                <DialogHeader className="px-6 py-4 border-b border-border/10 shrink-0">
                    <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
                    <DialogDescription className="text-sm">
                        Manage your account settings and preferences.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden">
                    <SettingsPanel className="h-full p-0 max-w-none" hideHeader />
                </div>
            </DialogContent>
        </Dialog>
    )
}
