'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutGrid,
    GripVertical,
    MoreHorizontal,
    Plus,
    Calendar,
    Sparkles,
    Check,
    Clock,
    Trash2,
    ArrowRight,
    Search,
    Filter,
    Loader2,
    Lightbulb,
    PenTool,
    Zap,
    Youtube,
    Linkedin,
    Twitter,
    Instagram,
    MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import VaultItemModal from '@/components/VaultItemModal'

type PipelineItem = {
    id: string
    title: string
    type: string
    status: string
    content?: string
    date?: string
    platform?: string
    originTable: 'vault' | 'calendar'
    tags?: string[]
}

type Column = {
    id: string
    title: string
    icon: any
    color: string
    description: string
}

const COLUMNS: Column[] = [
    { id: 'idea', title: 'Ideas Bank', icon: Lightbulb, color: 'text-purple-500', description: 'Raw concepts to refine' },
    { id: 'script', title: 'Content Studio', icon: PenTool, color: 'text-blue-500', description: 'Scripts in production' },
    { id: 'scheduled', title: 'Distribution', icon: Calendar, color: 'text-green-500', description: 'Scheduled for release' }
]

const PlatformIcon = ({ platform }: { platform?: string }) => {
    switch (platform?.toLowerCase()) {
        case 'youtube': return <Youtube size={12} className="text-red-500" />
        case 'linkedin': return <Linkedin size={12} className="text-blue-600" />
        case 'twitter':
        case 'twitter/x':
        case 'x': return <Twitter size={12} className="text-sky-500" />
        case 'instagram': return <Instagram size={12} className="text-pink-500" />
        default: return <MessageSquare size={12} className="text-gray-400" />
    }
}

export default function PipelinePage() {
    const [items, setItems] = useState<PipelineItem[]>([])
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            if (user.user_metadata?.full_name) {
                setUserName(user.user_metadata.full_name.split(' ')[0])
            }

            const [vaultRes, calendarRes] = await Promise.all([
                supabase.from('vault').select('*').eq('user_id', user.id).neq('status', 'trash'),
                supabase.from('calendar').select('*').eq('user_id', user.id)
            ])

            const vaultItems: PipelineItem[] = (vaultRes.data || []).map(v => ({
                id: v.id,
                title: v.title,
                type: v.type, // 'idea', 'script', etc.
                status: v.status,
                content: v.content,
                tags: v.tags,
                originTable: 'vault'
            }))

            const calendarItems: PipelineItem[] = (calendarRes.data || []).map(c => ({
                id: c.id,
                title: c.title,
                type: 'scheduled',
                status: c.status,
                platform: c.platform,
                date: c.date,
                content: c.notes, // Map notes to content for preview
                originTable: 'calendar'
            }))

            setItems([...vaultItems, ...calendarItems])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddItem = (columnId: string) => {
        const newItem: PipelineItem = {
            id: 'new',
            title: '',
            content: '',
            type: columnId,
            status: columnId === 'scheduled' ? 'scheduled' : 'active',
            originTable: columnId === 'scheduled' ? 'calendar' : 'vault',
            platform: 'LinkedIn', // Default
            date: new Date().toISOString().split('T')[0]
        }
        setSelectedItem(newItem)
    }

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id)
        setDraggingId(id)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (e: React.DragEvent, targetCol: string) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('text/plain')
        setDraggingId(null)

        const item = items.find(i => i.id === id)
        if (!item || item.type === targetCol) return

        // Optimistic Update
        const optimisticItems = items.map(i => i.id === id ? { ...i, type: targetCol } : i)
        setItems(optimisticItems)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Moving to Calendar (Distribution)
            if (targetCol === 'scheduled') {
                if (item.originTable === 'vault') {
                    // Create calendar entry
                    await supabase.from('calendar').insert({
                        user_id: user?.id,
                        title: item.title,
                        date: new Date().toISOString().split('T')[0],
                        platform: item.platform || 'LinkedIn',
                        content_type: 'post',
                        status: 'scheduled',
                        notes: item.content,
                        script_id: item.id
                    })

                    // Archive the vault item so it moves out of pipeline active view
                    await supabase.from('vault').update({ status: 'archived' }).eq('id', id)

                    // Refresh to get the new ID from calendar table
                    fetchData()
                }
            }
            // 2. Moving between Idea and Script or Back from Calendar
            else if (targetCol === 'idea' || targetCol === 'script') {
                if (item.originTable === 'vault') {
                    await supabase.from('vault').update({ type: targetCol }).eq('id', id)
                } else if (item.originTable === 'calendar') {
                    // Moving from Calendar back to Pipeline (Un-scheduling)
                    // Create a vault item or reactivate the old one?
                    // For simplicity, let's create a new vault item from the calendar entry
                    await supabase.from('vault').insert({
                        user_id: user?.id,
                        title: item.title,
                        content: item.content || '',
                        type: targetCol, // 'idea' or 'script'
                        status: 'active',
                        source: 'pipeline'
                    })

                    // Delete the calendar entry
                    await supabase.from('calendar').delete().eq('id', id)

                    fetchData()
                }
            }
        } catch (err) {
            console.error('Failed to update pipeline:', err)
            fetchData() // Revert on error
        }
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-background">
                <Loader2 size={32} className="animate-spin text-accent mb-4" />
                <p className="text-text-muted font-bold tracking-widest uppercase text-[10px]">Synchronizing Creator Engine...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto overflow-hidden bg-background min-h-screen p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-2">Creator Pipeline</h1>
                    <p className="text-text-muted text-[10px] font-bold tracking-[0.2em] uppercase">DRAG AND DROP TO CHANNEL YOUR CONTENT FLOW</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:flex-none">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search pipeline..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-surface border border-border rounded-full pl-9 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent w-full md:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => handleAddItem('idea')}
                        className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40"
                    >
                        <Plus size={14} /> NEW IDEA
                    </button>
                </div>
            </div>

            {/* Pipeline Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[700px]">
                {COLUMNS.map(col => (
                    <div
                        key={col.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                        className="flex flex-col bg-surface-2/40 border border-border rounded-[2.5rem] p-5 min-h-full backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between mb-6 px-2 pt-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center ${col.color} shadow-sm group-hover:shadow-accent/10 transition-shadow`}>
                                    <col.icon size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-text-primary uppercase tracking-tight">{col.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-text-muted font-bold tracking-widest">
                                            {filteredItems.filter(i => {
                                                if (col.id === 'idea') return i.type === 'idea'
                                                if (col.id === 'script') return i.type === 'script'
                                                if (col.id === 'scheduled') return (i.type === 'scheduled' || i.originTable === 'calendar')
                                                return false
                                            }).length} ASSETS
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-surface-hover rounded-xl transition-colors text-text-muted hover:text-text-primary border border-transparent hover:border-border">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1">
                            <AnimatePresence>
                                {filteredItems
                                    .filter(i => {
                                        if (col.id === 'idea') return i.type === 'idea'
                                        if (col.id === 'script') return i.type === 'script'
                                        if (col.id === 'scheduled') return i.originTable === 'calendar' // Calendar items
                                        return false
                                    })
                                    .map(item => (
                                        <motion.div
                                            key={item.id}
                                            layoutId={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            draggable
                                            onDragStart={(e: any) => handleDragStart(e, item.id)}
                                            onClick={() => setSelectedItem(item)}
                                            className={`group relative bg-surface border ${draggingId === item.id ? 'border-accent opacity-50' : 'border-border hover:border-accent/40'} rounded-2xl p-5 cursor-grab active:cursor-grabbing transition-all hover:bg-surface-hover hover:shadow-xl hover:shadow-black/[0.02]`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex gap-2">
                                                    {item.originTable === 'calendar' && (
                                                        <div className="flex items-center gap-1.5 bg-accent/5 border border-accent/10 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-accent">
                                                            <PlatformIcon platform={item.platform} />
                                                            {item.platform}
                                                        </div>
                                                    )}
                                                    {item.tags && item.tags.length > 0 && (
                                                        <span className="bg-surface-2 border border-border px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-text-muted">
                                                            #{item.tags[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <GripVertical size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <h4 className="font-bold text-sm text-text-primary leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
                                                {item.title}
                                            </h4>

                                            {item.content && (
                                                <p className="text-[11px] text-text-secondary line-clamp-3 mb-4 leading-relaxed opacity-70">
                                                    {item.content}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between pt-3 border-t border-border">
                                                <div className="flex items-center gap-2">
                                                    {item.date ? (
                                                        <div className={`flex items-center gap-1.5 ${new Date(item.date) < new Date() ? 'text-danger' : 'text-green-500'}`}>
                                                            <Clock size={10} />
                                                            <span className="text-[9px] font-bold uppercase tracking-wider">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-text-muted">
                                                            <Sparkles size={10} />
                                                            <span className="text-[9px] font-bold uppercase tracking-wider">Draft Asset</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center text-[8px] font-bold text-text-muted border border-border uppercase">
                                                    {userName?.[0] || 'TS'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                            </AnimatePresence>

                            {/* Add Button */}
                            <button
                                onClick={() => handleAddItem(col.id)}
                                className="w-full py-4 rounded-2xl border-2 border-dashed border-border flex items-center justify-center gap-3 text-text-muted hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all group mt-2 opacity-60 hover:opacity-100"
                            >
                                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Add to {col.title}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <VaultItemModal
                item={selectedItem}
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                onUpdate={fetchData}
            />
        </div>
    )
}
