'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Calendar,
    FileText,
    Zap,
    Sparkles,
    ChevronRight,
    Loader2,
    Brain,
    Trash2,
    Save
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ExpandedIdeaProps {
    idea: any
    onClose: () => void
    onUpdate: () => void
}

export default function ExpandedIdea({ idea, onClose, onUpdate }: ExpandedIdeaProps) {
    const [isProcessing, setIsProcessing] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'details' | 'hooks' | 'next_steps'>('details')
    const [editedContent, setEditedContent] = useState(idea.content)

    const handlePromoteToScript = async () => {
        setIsProcessing('script')
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: script, error } = await supabase.from('scripts').insert({
                user_id: user.id,
                title: idea.title,
                content: `Idea Context: ${idea.content}\n\n[GENERATE SCRIPT HERE]`,
                platform: 'any',
                status: 'draft',
                origin_idea_id: idea.id
            }).select().single()

            if (error) throw error
            if (!script) throw new Error('No script returned from database')

            window.location.href = `/scripts?id=${script.id}`
        } catch (e) {
            console.error(e)
            alert('Failed to promote to script')
        } finally {
            setIsProcessing(null)
        }
    }

    const handleSchedule = async () => {
        setIsProcessing('calendar')
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const today = new Date().toISOString().split('T')[0]
            const { error } = await supabase.from('calendar').insert({
                user_id: user.id,
                title: idea.title,
                date: today,
                platform: 'any',
                content_type: 'post',
                status: 'scheduled',
                origin_table: 'ideas',
                origin_id: idea.id
            })

            if (error) throw error
            alert('Added to today\'s calendar!')
        } catch (e) {
            console.error(e)
            alert('Failed to schedule')
        } finally {
            setIsProcessing(null)
        }
    }

    const handleRefine = async () => {
        setIsProcessing('refining')
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'script',
                    hook: idea.title,
                    platform: 'LinkedIn',
                    tone: 'casual',
                    framework: 'PAS',
                    length: 'short'
                })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setEditedContent((prev: string) => prev + "\n\n--- AI REFINEMENT ---\n" + (data.script?.full_script || ''))
        } catch (e) {
            console.error(e)
            alert('AI Refinement failed')
        } finally {
            setIsProcessing(null)
        }
    }

    const handleSave = async () => {
        setIsProcessing('saving')
        try {
            const supabase = createClient()
            await supabase.from('ideas').update({
                content: editedContent
            }).eq('id', idea.id)
            onUpdate()
            onClose()
        } catch (e) {
            console.error(e)
        } finally {
            setIsProcessing(null)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl h-[80vh] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-surface-2/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Brain size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">{idea.title}</h2>
                            <p className="text-xs text-text-muted">Captured on {new Date(idea.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-muted hover:text-text-primary">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-48 border-r border-border bg-surface-2/30 p-4 space-y-2 hidden md:block">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'details' ? 'bg-accent text-white' : 'text-text-muted hover:bg-surface-hover'}`}
                        >
                            <FileText size={16} /> Details
                        </button>
                        <button
                            onClick={() => setActiveTab('hooks')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'hooks' ? 'bg-accent text-white' : 'text-text-muted hover:bg-surface-hover'}`}
                        >
                            <Zap size={16} /> Hook Ideas
                        </button>
                        <div className="h-px bg-border my-4" />
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2">Actions</p>
                        <button
                            onClick={handlePromoteToScript}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                        >
                            {isProcessing === 'script' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            Draft Script
                        </button>
                        <button
                            onClick={handleSchedule}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                        >
                            {isProcessing === 'calendar' ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                            Add to Planner
                        </button>
                    </div>

                    {/* Editor / Content */}
                    <div className="flex-1 overflow-y-auto p-8 relative">
                        <div className="max-w-2xl mx-auto space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-muted">Concept Sandbox</h3>
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleRefine} className="btn-icon text-accent hover:bg-accent/10" title="AI Refine">
                                            {isProcessing === 'refining' ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                        </button>
                                        <button onClick={handleSave} className="btn-icon text-green-500 hover:bg-green-500/10" title="Save Changes">
                                            {isProcessing === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="w-full h-96 p-6 rounded-xl bg-surface-2/50 border border-border text-lg leading-relaxed focus:border-accent outline-none transition-colors border-dashed"
                                    placeholder="Flesh out your idea here..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Target Audience</p>
                                    <p className="text-sm">Founders, Creators, Solo-preneurs</p>
                                </div>
                                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Emotional Hook</p>
                                    <p className="text-sm">Authority & Trust Building</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions (Mobile) */}
                <div className="p-4 border-t border-border flex items-center justify-end gap-3 md:hidden">
                    <button onClick={handlePromoteToScript} className="btn-secondary text-xs">Script</button>
                    <button onClick={handleSchedule} className="btn-primary text-xs">Schedule</button>
                </div>
            </motion.div>
        </motion.div>
    )
}
