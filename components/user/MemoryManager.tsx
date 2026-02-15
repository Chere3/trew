'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Trash2, Edit2, Brain, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-client'

interface MemoryManagerProps {
    className?: string
}

export function MemoryManager({ className }: MemoryManagerProps) {
    const { data: session } = useSession()
    const [facts, setFacts] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [editingKey, setEditingKey] = useState<string | null>(null)
    const [editingValue, setEditingValue] = useState<string>('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteKey, setDeleteKey] = useState<string | null>(null)
    const [updatedAt, setUpdatedAt] = useState<number | null>(null)

    const userId = session?.user?.id

    useEffect(() => {
        if (userId) {
            loadMemory()
        }
    }, [userId])

    const loadMemory = async () => {
        if (!userId) return

        try {
            setLoading(true)
            const response = await fetch(`/api/users/${userId}/memory`)
            if (response.ok) {
                const data = await response.json()
                setFacts(data.facts || {})
                setUpdatedAt(data.updatedAt)
            }
        } catch (error) {
            console.error('Failed to load memory:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (key: string) => {
        const value = facts[key]
        setEditingKey(key)
        setEditingValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value))
    }

    const handleSaveEdit = async () => {
        if (!userId || !editingKey) return

        try {
            let parsedValue: any = editingValue.trim()
            // Try to parse as JSON, fallback to string
            try {
                parsedValue = JSON.parse(parsedValue)
            } catch {
                // Keep as string if not valid JSON
            }

            const updatedFacts = { ...facts, [editingKey]: parsedValue }
            const response = await fetch(`/api/users/${userId}/memory`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ facts: updatedFacts }),
            })

            if (response.ok) {
                setFacts(updatedFacts)
                setEditingKey(null)
                setEditingValue('')
                await loadMemory() // Reload to get updated timestamp
            }
        } catch (error) {
            console.error('Failed to update fact:', error)
        }
    }

    const handleDelete = async (key: string) => {
        if (!userId) return

        try {
            const response = await fetch(`/api/users/${userId}/memory?key=${encodeURIComponent(key)}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                const updatedFacts = { ...facts }
                delete updatedFacts[key]
                setFacts(updatedFacts)
                setDeleteDialogOpen(false)
                setDeleteKey(null)
                await loadMemory()
            }
        } catch (error) {
            console.error('Failed to delete fact:', error)
        }
    }

    const handleClearAll = async () => {
        if (!userId) return

        if (!confirm('Are you sure you want to clear all memory? This cannot be undone.')) {
            return
        }

        try {
            const response = await fetch(`/api/users/${userId}/memory`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setFacts({})
                setUpdatedAt(null)
            }
        } catch (error) {
            console.error('Failed to clear memory:', error)
        }
    }

    const formatValue = (value: any): string => {
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, 2)
        }
        return String(value)
    }

    const getScoreColor = (score?: number) => {
        if (!score) return 'text-muted-foreground'
        if (score >= 0.8) return 'text-emerald-600 dark:text-emerald-400'
        if (score >= 0.7) return 'text-violet-600 dark:text-violet-400'
        return 'text-amber-600 dark:text-amber-400'
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">Loading memory...</div>
                </CardContent>
            </Card>
        )
    }

    const factCount = Object.keys(facts).length
    const hasFacts = factCount > 0

    return (
        <div className={cn('space-y-4', className)}>
            <div className="space-y-1 mb-6">
                <h3 className="text-lg font-medium">Semantic Memory</h3>
                <p className="text-sm text-muted-foreground">
                    Manage facts about you that are remembered across conversations
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">Stored Facts</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasFacts && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearAll}
                                className="text-destructive hover:text-destructive"
                            >
                                Clear All
                            </Button>
                        )}
                        {updatedAt && (
                            <span className="text-xs text-muted-foreground">
                                Updated {new Date(updatedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {!hasFacts ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No facts stored yet.</p>
                            <p className="text-sm mt-2">
                                Facts will be automatically extracted from your conversations.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(facts).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Label className="font-semibold text-sm">{key}</Label>
                                            </div>
                                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words font-sans">
                                                {formatValue(value)}
                                            </pre>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(key)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    setDeleteKey(key)
                                                    setDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="text-xs text-muted-foreground pt-2">
                                {factCount} fact{factCount !== 1 ? 's' : ''} stored
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editingKey !== null} onOpenChange={(open) => !open && setEditingKey(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Fact</DialogTitle>
                        <DialogDescription>
                            Edit the value for &quot;{editingKey}&quot;
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Value</Label>
                            <Textarea
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                placeholder="Enter value (JSON or text)"
                                className="font-mono text-sm min-h-[120px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingKey(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Fact</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{deleteKey}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteKey && handleDelete(deleteKey)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
