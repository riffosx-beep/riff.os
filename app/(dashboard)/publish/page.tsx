'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
    Loader2,
    ArrowRight,
    RefreshCw,
    Plus,
} from 'lucide-react'

interface PipelineItem {
    id: string
    title: string
    stage: 'idea' | 'drafting' | 'ready' | 'scheduled' | 'published'
    platform?: string
    date?: string
    originTable: 'ideas' | 'scripts' | 'vault' | 'calendar'
    originId: string
    status?: string
    meta?: any
}

const STAGES = [
    { id: 'idea', label: 'IDEAS' },
    { id: 'drafting', label: 'DRAFTING' },
    { id: 'ready', label: 'READY' },
    { id: 'scheduled', label: 'SCHEDULED' },
    { id: 'published', label: 'PUBLISHED' },
]

import PipelineCard from '@/components/publish/PipelineCard'

export default function PublishPage() {
    const [items, setItems] = useState<PipelineItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        setLoading(true)
        const supabase = createClient()
        const [ideasRes, scriptsRes, vaultRes, calendarRes] = await Promise.all([
            supabase.from('ideas').select('*').order('created_at', { ascending: false }),
            supabase.from('scripts').select('*').order('created_at', { ascending: false }),
            supabase.from('vault').select('*').order('created_at', { ascending: false }),
            supabase.from('calendar').select('*').order('date', { ascending: false }),
        ])

        const pipelineItems: PipelineItem[] = []
        if (ideasRes.data) {
            // Only show ideas that don't have a corresponding script yet
            const ideasWithScripts = new Set(scriptsRes.data?.map(s => s.origin_idea_id).filter(Boolean))
            ideasRes.data.forEach((item: any) => {
                if (ideasWithScripts.has(item.id)) return
                pipelineItems.push({
                    id: `idea-${item.id}`,
                    title: item.title || item.content?.substring(0, 50) || 'Untitled Idea',
                    stage: 'idea',
                    platform: item.platform || 'INTERNAL',
                    originTable: 'ideas',
                    originId: item.id,
                    meta: item
                })
            })
        }
        if (scriptsRes.data) {
            scriptsRes.data.forEach((item: any) => {
                // If script is already in vault or calendar, skip it here? 
                // Let's rely on status.
                if (item.status === 'archived') return
                pipelineItems.push({
                    id: `script-${item.id}`,
                    title: item.title,
                    stage: 'drafting',
                    platform: item.platform || 'INTERNAL',
                    originTable: 'scripts',
                    originId: item.id,
                    meta: item
                })
            })
        }
        if (vaultRes.data) {
            vaultRes.data.forEach((item: any) => {
                if (item.status === 'scheduled' || item.status === 'posted') return
                pipelineItems.push({
                    id: `vault-${item.id}`,
                    title: item.title,
                    stage: 'ready',
                    platform: item.platform || 'INTERNAL',
                    originTable: 'vault',
                    originId: item.id,
                    status: item.status,
                    meta: item
                })
            })
        }
        if (calendarRes.data) {
            calendarRes.data.forEach((item: any) => {
                const isPublished = item.status === 'posted' || item.status === 'done'
                pipelineItems.push({
                    id: `cal-${item.id}`,
                    title: item.title,
                    stage: isPublished ? 'published' : 'scheduled',
                    platform: item.platform || 'INTERNAL',
                    date: item.date,
                    originTable: 'calendar',
                    originId: item.id,
                    status: item.status,
                    meta: item
                })
            })
        }
        setItems(pipelineItems)
        setLoading(false)
    }

    const handleMoveStage = async (item: PipelineItem, targetStage: string) => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setLoading(true)
        try {
            if (item.stage === 'idea' && targetStage === 'drafting') {
                // Idea -> Drafting: Create Script
                const { data: script } = await supabase.from('scripts').insert({
                    user_id: user.id,
                    title: item.title,
                    content: item.meta.content,
                    platform: item.platform || 'any',
                    status: 'draft',
                    origin_idea_id: item.originId
                }).select().single()
                if (script) window.location.href = `/scripts?id=${script.id}`
            }
            else if (targetStage === 'ready') {
                // Drafting -> Ready: Move to Vault
                await supabase.from('vault').insert({
                    user_id: user.id,
                    title: item.title,
                    content: item.meta.content || item.meta.body || '',
                    type: 'script',
                    platform: item.platform || 'any',
                    status: 'draft'
                })
                // Mark script as archived or similar if needed
            }
            else if (targetStage === 'scheduled') {
                // Ready -> Scheduled: Move to Calendar
                const today = new Date().toISOString().split('T')[0]
                await supabase.from('calendar').insert({
                    user_id: user.id,
                    title: item.title,
                    date: today,
                    platform: item.platform || 'any',
                    status: 'scheduled',
                    origin_table: item.originTable,
                    origin_id: item.originId
                })
            }
            else if (targetStage === 'published') {
                // Scheduled -> Published: Update Calendar Status
                if (item.originTable === 'calendar') {
                    await supabase.from('calendar').update({ status: 'posted' }).eq('id', item.originId)
                }
            }

            await fetchData()
        } catch (e) {
            console.error(e)
            alert('Failed to move stage')
        } finally {
            setLoading(false)
        }
    }

    const handleAddAsset = async (item: PipelineItem, url: string) => {
        const supabase = createClient()
        const meta = { ...item.meta, assets: [...(item.meta.assets || []), url] }
        await supabase.from(item.originTable as any).update({
            // This is tricky as different tables have different columns
            // For now, let's assume many have a 'meta' or 'ai_notes' field or just log it
            [item.originTable === 'ideas' ? 'content' : 'body']: item.meta.content + `\n\nAsset: ${url}`
        }).eq('id', item.originId)
        fetchData()
    }

    const getItemsByStage = (stage: string) => items.filter(i => i.stage === stage)

    return (
        <div className="max-w-screen-2xl mx-auto space-y-8 animate-enter h-[calc(100vh-120px)] flex flex-col pb-12">
            <div className="py-8 border-b border-border flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-display mb-1">Pipeline.</h1>
                    <p className="text-body uppercase tracking-[0.2em] opacity-60 text-[10px]">Workflow Logistics / Content Operations</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="btn-outline">
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> REFRESH
                    </button>
                    <Link href="/ideas" className="btn-primary">
                        <Plus size={12} /> NEW ENTRY
                    </Link>
                </div>
            </div>

            <div className={`flex-1 flex gap-px bg-border border border-border overflow-x-auto custom-scrollbar transition-opacity ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {STAGES.map(stage => {
                    const stageItems = getItemsByStage(stage.id)
                    return (
                        <div key={stage.id} className="w-80 shrink-0 flex flex-col bg-surface-2 group/col">
                            <div className="flex items-center justify-between p-4 bg-surface border-b border-border">
                                <span className="text-overline tracking-widest font-black">{stage.label}</span>
                                <span className="text-[10px] font-mono text-text-muted border border-border px-1.5">{stageItems.length.toString().padStart(2, '0')}</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {stageItems.length === 0 ? (
                                    <div className="p-12 border border-dashed border-border flex items-center justify-center opacity-20">
                                        <p className="text-[10px] uppercase font-bold tracking-widest">Null</p>
                                    </div>
                                ) : (
                                    stageItems.map(item => (
                                        <PipelineCard
                                            key={item.id}
                                            item={item}
                                            onMove={(target) => handleMoveStage(item, target)}
                                            onAddAsset={(url) => handleAddAsset(item, url)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="p-4 bg-surface-2 border border-border text-center">
                <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] font-bold">Standard Operating Procedure: Sync → Draft → Archive → Schedule.</p>
            </div>
        </div>
    )
}
