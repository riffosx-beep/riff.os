'use client'

import React, { useState, useEffect } from 'react'
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
    Save,
    MapPin,
    Tag,
    Share2,
    History,
    Check,
    PenTool,
    ArrowRight,
    Plus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface VaultItemModalProps {
    item: any
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
}

export default function VaultItemModal({ item, isOpen, onClose, onUpdate }: VaultItemModalProps) {
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'content' | 'ai' | 'distribution'>('content')
    const [editedTitle, setEditedTitle] = useState(item?.title || '')
    const [editedContent, setEditedContent] = useState(item?.content || '')
    const [editMode, setEditMode] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0])
    const [schedulePlatform, setSchedulePlatform] = useState(item?.platform || 'LinkedIn')
    const [tags, setTags] = useState<string[]>(item?.tags || [])
    const [showTagInput, setShowTagInput] = useState(false)
    const [newTag, setNewTag] = useState('')

    useEffect(() => {
        if (item) {
            setEditedTitle(item.title || '')
            setEditedContent(item.content || '')
            setTags(item.tags || [])
            setSchedulePlatform(item.platform || 'LinkedIn')
        }
    }, [item])

    if (!isOpen || !item) return null

    const handleSave = async () => {
        setIsProcessing('saving')
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            const table = item.originTable === 'calendar' ? 'calendar' : 'vault'
            const isNew = item.id === 'new'

            // Prepare payload
            const payload: any = {
                title: editedTitle,
                user_id: user?.id
            }

            if (table === 'vault') {
                payload.content = editedContent
                payload.tags = tags
                payload.updated_at = new Date().toISOString()
                if (isNew) {
                    payload.type = item.type || 'idea'
                    payload.status = 'active'
                }
            } else {
                // Calendar
                payload.notes = editedContent
                if (isNew) {
                    payload.date = new Date().toISOString().split('T')[0]
                    payload.platform = 'LinkedIn'
                    payload.status = 'scheduled'
                    payload.content_type = 'post'
                }
            }

            let error
            if (isNew) {
                const { error: e } = await supabase.from(table).insert(payload).select()
                error = e
            } else {
                const { error: e } = await supabase.from(table).update(payload).eq('id', item.id)
                error = e
            }

            if (error) throw error

            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 2000)
            setEditMode(false)
            if (isNew) onClose()
            onUpdate()
        } catch (e) {
            console.error(e)
            alert('Failed to save changes')
        } finally {
            setIsProcessing(null)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to permanently delete this item?')) return
        setIsProcessing('deleting')
        try {
            const supabase = createClient()
            const table = item.originTable === 'calendar' ? 'calendar' : 'vault'
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', item.id)

            if (error) throw error

            onClose()
            onUpdate()
        } catch (e) {
            console.error(e)
            alert('Failed to delete item')
        } finally {
            setIsProcessing(null)
        }
    }

    const handleAddTag = async () => {
        if (!newTag.trim()) return
        const updatedTags = [...tags, newTag.trim()]
        setTags(updatedTags)
        setNewTag('')

        // Auto-save tags
        const supabase = createClient()
        await supabase.from('vault').update({ tags: updatedTags }).eq('id', item.id)
        onUpdate()
    }

    const handleRemoveTag = async (tagToRemove: string) => {
        const updatedTags = tags.filter(t => t !== tagToRemove)
        setTags(updatedTags)

        // Auto-save tags
        const supabase = createClient()
        await supabase.from('vault').update({ tags: updatedTags }).eq('id', item.id)
        onUpdate()
    }

    const handlePromoteToStudio = () => {
        const params = new URLSearchParams()
        params.set('topic', editedTitle)
        if (editedContent) params.set('content', editedContent)
        params.set('ideaId', item.id)

        router.push(`/ideation?${params.toString()}`)
    }

    const handleSchedule = async () => {
        setIsProcessing('scheduling')
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase.from('calendar').insert({
                user_id: user.id,
                title: editedTitle,
                date: scheduleDate,
                platform: schedulePlatform,
                content_type: item.type || 'post',
                status: 'scheduled',
                notes: editedContent,
                script_id: item.id
            })

            if (error) throw error
            alert('Added to content calendar!')
            // Optional: Close or switch tab?
        } catch (e) {
            console.error(e)
            alert('Failed to schedule')
        } finally {
            setIsProcessing(null)
        }
    }

    const runAIRefinement = async () => {
        setIsProcessing('ai')
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'refine-script',
                    script: editedContent,
                    feedback: 'Make this more punchy and viral-ready',
                    platform: item.platform || 'LinkedIn',
                    contentType: item.type || 'post'
                })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setEditedContent(data.refined.refined_script)
            setEditMode(true)
        } catch (e) {
            console.error(e)
            alert('AI refinement failed')
        } finally {
            setIsProcessing(null)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

                <motion.div
                    initial={{ scale: 0.9, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 30, opacity: 0 }}
                    className="relative w-full max-w-5xl h-[85vh] bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border bg-surface-2/30">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent ring-1 ring-accent/20">
                                <Brain size={24} />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    value={editedTitle}
                                    onChange={(e) => { setEditedTitle(e.target.value); setEditMode(true); }}
                                    className="text-2xl font-bold bg-transparent border-none outline-none text-text-primary focus:ring-0 w-full"
                                    placeholder="Idea Title..."
                                />
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                                        {item.originTable === 'calendar' ? 'CALENDAR EVENT' : 'VAULT ASSET'}
                                    </span>
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-[10px] text-text-muted font-bold uppercase">Stored {new Date(item.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {editMode && (
                                <button
                                    onClick={handleSave}
                                    disabled={isProcessing === 'saving'}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20"
                                >
                                    {isProcessing === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                    SAVE CHANGES
                                </button>
                            )}
                            {saveSuccess && (
                                <div className="flex items-center gap-2 text-green-500 text-xs font-bold px-3 py-1 bg-green-500/10 rounded-lg">
                                    <Check size={14} /> SAVED
                                </div>
                            )}
                            <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-xl transition-colors text-text-muted hover:text-text-primary border border-border ml-2">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Main Section */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Vertical Tabs */}
                        <div className="w-64 border-r border-border bg-surface-2/10 p-6 flex flex-col hidden md:flex">
                            <div className="space-y-2 flex-1">
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-muted hover:bg-surface-hover'}`}
                                >
                                    <FileText size={18} /> CONTENT
                                </button>
                                <button
                                    onClick={() => setActiveTab('ai')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'ai' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-muted hover:bg-surface-hover'}`}
                                >
                                    <Sparkles size={18} /> AI STUDIO
                                </button>
                                <button
                                    onClick={() => setActiveTab('distribution')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'distribution' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-text-muted hover:bg-surface-hover'}`}
                                >
                                    <Share2 size={18} /> DISTRIBUTION
                                </button>

                                {/* Tags Display in Sidebar */}
                                <div className="pt-6 mt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between mb-2 px-2">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tags</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 px-2 mb-3">
                                        {tags.map(tag => (
                                            <span key={tag} className="text-[9px] px-2 py-0.5 rounded bg-surface border border-border text-text-secondary flex items-center gap-1">
                                                {tag}
                                                <X size={8} className="cursor-pointer hover:text-red-500" onClick={() => handleRemoveTag(tag)} />
                                            </span>
                                        ))}
                                    </div>

                                    {showTagInput ? (
                                        <div className="px-2 flex gap-1">
                                            <input
                                                value={newTag}
                                                onChange={e => setNewTag(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                                className="w-full text-xs bg-surface border border-border rounded px-2 py-1 outline-none focus:border-accent"
                                                placeholder="New tag..."
                                                autoFocus
                                            />
                                            <button onClick={handleAddTag} className="p-1 bg-accent text-white rounded"><Check size={12} /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowTagInput(true)}
                                            className="w-full text-left px-4 py-2 text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={10} /> ADD TAG
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 mt-auto border-t border-border/50">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-4 mb-3">Settings</p>
                                <button
                                    onClick={() => setShowTagInput(!showTagInput)}
                                    className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:bg-surface-hover transition-colors"
                                >
                                    <Tag size={14} /> Manage Tags
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isProcessing === 'deleting'}
                                    className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/5 transition-colors"
                                >
                                    {isProcessing === 'deleting' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    Delete Permanent
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col overflow-hidden bg-surface-2/[0.02]">
                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                {activeTab === 'content' && (
                                    <div className="max-w-3xl mx-auto space-y-8 animate-enter">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Editor Space</h3>
                                                <button
                                                    onClick={runAIRefinement}
                                                    disabled={isProcessing === 'ai'}
                                                    className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1.5"
                                                >
                                                    {isProcessing === 'ai' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                    IMPROVE WITH AI
                                                </button>
                                            </div>
                                            <textarea
                                                value={editedContent}
                                                onChange={(e) => { setEditedContent(e.target.value); setEditMode(true); }}
                                                className="w-full h-[400px] bg-surface border border-border rounded-3xl p-8 text-base leading-relaxed text-text-primary focus:border-accent outline-none transition-all shadow-inner font-inter"
                                                placeholder="Inject your thoughts, scripts, or hooks here..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-surface/50 border border-border rounded-2xl p-6">
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Asset Metadata</p>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-text-muted">Type</span>
                                                        <span className="font-bold text-text-primary uppercase tracking-tighter">{item.type || 'RAW IDEA'}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-text-muted">Platform</span>
                                                        <span className="font-bold text-text-primary uppercase tracking-tighter">{item.platform || 'MULTICHANNEL'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-surface/50 border border-border rounded-2xl p-6">
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Quick Actions</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="bg-accent/10 text-accent text-[9px] font-bold px-2 py-1 rounded border border-accent/20">READY TO POST</span>
                                                    <span className="bg-surface-2 text-text-muted text-[9px] font-bold px-2 py-1 rounded border border-border">AI ANALYZED</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'ai' && (
                                    <div className="max-w-3xl mx-auto space-y-8 animate-enter">
                                        <div className="text-center py-10">
                                            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-4">
                                                <Sparkles size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold">CreatorOS Intelligence</h3>
                                            <p className="text-text-muted text-sm mt-2">What would you like to build based on this idea?</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                onClick={handlePromoteToStudio}
                                                className="group p-6 bg-surface border border-border rounded-2xl text-left hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all"
                                            >
                                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                                                    <PenTool size={20} />
                                                </div>
                                                <h4 className="font-bold text-sm mb-1">Generate Full Script</h4>
                                                <p className="text-xs text-text-muted">Write a production-ready script for YouTube or Reels.</p>
                                            </button>
                                            <button
                                                onClick={() => router.push(`/repurposing?content=${encodeURIComponent(editedContent)}`)}
                                                className="group p-6 bg-surface border border-border rounded-2xl text-left hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/5 transition-all"
                                            >
                                                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                                                    <History size={20} />
                                                </div>
                                                <h4 className="font-bold text-sm mb-1">Repurpose Asset</h4>
                                                <p className="text-xs text-text-muted">Turn this into X threads, LinkedIn posts, or emails.</p>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'distribution' && (
                                    <div className="max-w-3xl mx-auto space-y-8 animate-enter">
                                        <div className="bg-surface border border-border rounded-3xl p-8 space-y-6">
                                            <div>
                                                <h4 className="font-bold text-lg mb-2">Schedule Item</h4>
                                                <p className="text-sm text-text-muted">Push this asset to your content calendar to track its distribution.</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Date</label>
                                                    <div className="bg-surface-2 border border-border rounded-xl p-3 flex items-center gap-3 text-sm">
                                                        <Calendar size={16} className="text-text-muted" />
                                                        <input
                                                            type="date"
                                                            value={scheduleDate}
                                                            onChange={e => setScheduleDate(e.target.value)}
                                                            className="bg-transparent border-none outline-none text-text-primary w-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase ml-1">Platform</label>
                                                    <select
                                                        value={schedulePlatform}
                                                        onChange={e => setSchedulePlatform(e.target.value)}
                                                        className="input h-11 bg-surface-2 w-full px-3 rounded-xl border border-border"
                                                    >
                                                        <option value="LinkedIn">LinkedIn</option>
                                                        <option value="Twitter/X">Twitter/X</option>
                                                        <option value="YouTube">YouTube</option>
                                                        <option value="Instagram">Instagram</option>
                                                        <option value="TikTok">TikTok</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleSchedule}
                                                disabled={isProcessing === 'scheduling'}
                                                className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-sm hover:bg-accent-hover transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20"
                                            >
                                                {isProcessing === 'scheduling' ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
                                                CONFIRM TO CALENDAR
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sticky Bottom Actions */}
                            <div className="p-6 border-t border-border bg-surface/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-surface-2 border border-surface flex items-center justify-center text-[8px] font-bold text-text-muted">
                                                TS
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Shared with team</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handlePromoteToStudio}
                                        className="btn-primary py-2 px-6 text-xs h-10"
                                    >
                                        STUDIO BUILD <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
