'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Type, Link, X, Loader2, Save } from 'lucide-react'

interface CaptureModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (idea: { title: string, content: string, tags: string[], type: 'voice' | 'text' }) => Promise<void> | void
}

export default function CaptureModal({ isOpen, onClose, onSave }: CaptureModalProps) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')

    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        if (!title && !content) return

        try {
            setIsSaving(true)
            await onSave({ title: title || 'Untitled Idea', content, tags, type: 'text' })
            reset()
            onClose()
        } catch (error) {
            console.error('Failed to save:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const reset = () => {
        setTitle('')
        setContent('')
        setTags([])
    }

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50">
                    <h3 className="font-bold text-lg">Capture Idea</h3>
                    <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-full text-text-muted hover:text-text-primary">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Idea Title (optional)"
                        className="w-full text-lg font-bold bg-transparent border-none outline-none placeholder:text-text-muted"
                        autoFocus
                    />
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Dump your thoughts here..."
                        className="w-full h-40 bg-surface-2/50 rounded-lg p-3 text-sm resize-none outline-none focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-muted"
                    />

                    {/* Tags Input */}
                    <div className="pt-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <span key={tag} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full flex items-center gap-1">
                                    #{tag}
                                    <button onClick={() => setTags(tags.filter(t => t !== tag))}><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                        <input
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Add tags (press Enter)..."
                            className="bg-transparent text-sm w-full outline-none placeholder:text-text-muted"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-surface-2 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary font-medium">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={(!title && !content) || isSaving}
                        className="btn-primary min-w-[120px]"
                    >
                        {isSaving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <>
                                <Save size={16} /> Save Idea
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
