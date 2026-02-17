'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Loader2,
    Plus,
    BarChart3,
    TrendingUp,
    Save,
    Calendar,
    ArrowUpRight
} from 'lucide-react'

// ─── TYPES ───
type PerformanceTab = 'log' | 'visuals' | 'analytics'
type Platform = 'LinkedIn' | 'Twitter' | 'Instagram' | 'TikTok' | 'YouTube' | 'Blog' | 'Newsletter'

interface ContentEntry {
    id?: string
    content_text: string
    platform: string
    impressions: number
    likes: number
    comments: number
    shares: number
    saves: number
    link_clicks: number
    date_posted: string
    content_type: string
}

export default function PerformancePage() {
    const [activeTab, setActiveTab] = useState<PerformanceTab>('log')
    const [entries, setEntries] = useState<ContentEntry[]>([])

    // ─── STATE: MANUAL LOGGING ───
    const [newEntry, setNewEntry] = useState<ContentEntry>({
        content_text: '',
        platform: 'LinkedIn',
        impressions: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        link_clicks: 0,
        date_posted: new Date().toISOString().split('T')[0],
        content_type: 'Text',
    })

    const [saving, setSaving] = useState(false)
    const [importModalOpen, setImportModalOpen] = useState(false)

    useEffect(() => { fetchEntries() }, [])

    async function fetchEntries() {
        const supabase = createClient()
        const { data } = await supabase.from('content_performance').select('*').order('date_posted', { ascending: false }).limit(50)
        if (data) setEntries(data)
    }

    async function saveEntry() {
        if (!newEntry.content_text.trim()) return
        setSaving(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            await supabase.from('content_performance').insert({ ...newEntry, user_id: user.id })

            setNewEntry({
                ...newEntry,
                content_text: '',
                impressions: 0, likes: 0, comments: 0, shares: 0, saves: 0, link_clicks: 0
            })
            fetchEntries()
            alert('Performance data logged successfully.')
        } catch (err) {
            console.error(err)
            alert('Failed to save entry.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-screen-2xl mx-auto p-6 pb-24 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Performance Tracker</h1>
                    <p className="text-text-muted mt-1">Manual data logging & analytics.</p>
                </div>
                <div className="flex bg-surface-2 p-1 rounded-lg border border-border">
                    {['log', 'visuals', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as PerformanceTab)}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === tab
                                    ? 'bg-surface text-text-primary shadow-sm'
                                    : 'text-text-muted hover:text-text-secondary'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {activeTab === 'log' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ─── LEFT: DATA ENTRY ─── */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card p-5 space-y-5 border-l-4 border-l-accent">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                                <Plus size={16} /> Log New Performance
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold block mb-1.5">Platform</label>
                                    <select
                                        value={newEntry.platform}
                                        onChange={e => setNewEntry({ ...newEntry, platform: e.target.value })}
                                        className="input"
                                    >
                                        <option>LinkedIn</option>
                                        <option>Twitter/X</option>
                                        <option>Instagram</option>
                                        <option>TikTok</option>
                                        <option>YouTube</option>
                                        <option>Newsletter</option>
                                        <option>Blog</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold block mb-1.5">Date Posted</label>
                                    <input
                                        type="date"
                                        value={newEntry.date_posted}
                                        onChange={e => setNewEntry({ ...newEntry, date_posted: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold block mb-1.5">Content / Description</label>
                                <textarea
                                    value={newEntry.content_text}
                                    onChange={e => setNewEntry({ ...newEntry, content_text: e.target.value })}
                                    rows={3}
                                    className="input resize-none"
                                    placeholder="What was the post about?"
                                />
                            </div>

                            <hr className="border-border" />

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: 'impressions', label: 'Impressions' },
                                    { key: 'likes', label: 'Likes' },
                                    { key: 'comments', label: 'Comments' },
                                    { key: 'shares', label: 'Shares' },
                                    { key: 'saves', label: 'Saves' },
                                    { key: 'link_clicks', label: 'Clicks' },
                                ].map(metric => (
                                    <div key={metric.key}>
                                        <label className="text-[10px] text-text-muted uppercase font-bold block mb-1">{metric.label}</label>
                                        <input
                                            type="number"
                                            value={newEntry[metric.key as keyof ContentEntry] as number}
                                            onChange={e => setNewEntry({ ...newEntry, [metric.key]: parseInt(e.target.value) || 0 })}
                                            className="input text-right font-mono"
                                            min={0}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={saveEntry}
                                disabled={saving}
                                className="btn-primary w-full py-3"
                            >
                                {saving ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Save System Entry'}
                            </button>
                        </div>

                        <div className="p-4 bg-surface-2 border border-dashed border-border rounded-lg text-center">
                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">
                                Pro Tip: Connect APIs in Settings for auto-import.
                            </p>
                        </div>
                    </div>

                    {/* ─── RIGHT: LOG HISTORY ─── */}
                    <div className="lg:col-span-2">
                        <div className="card h-full min-h-[500px] flex flex-col">
                            <div className="p-4 border-b border-border bg-surface-2 flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">History Log</span>
                                <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-bold">{entries.length} Entries</span>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-surface sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-4 text-[10px] uppercase text-text-muted font-bold tracking-wider w-24">Date</th>
                                            <th className="p-4 text-[10px] uppercase text-text-muted font-bold tracking-wider w-24">Platform</th>
                                            <th className="p-4 text-[10px] uppercase text-text-muted font-bold tracking-wider">Content</th>
                                            <th className="p-4 text-[10px] uppercase text-text-muted font-bold tracking-wider text-right">Reach</th>
                                            <th className="p-4 text-[10px] uppercase text-text-muted font-bold tracking-wider text-right">Engage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {entries.map((entry, i) => (
                                            <tr key={i} className="hover:bg-surface-2 transition-colors group">
                                                <td className="p-4 text-xs font-mono text-text-muted">{entry.date_posted}</td>
                                                <td className="p-4">
                                                    <span className="badge badge-purple text-[9px]">{entry.platform}</span>
                                                </td>
                                                <td className="p-4 text-xs text-text-secondary truncate max-w-[200px]" title={entry.content_text}>
                                                    {entry.content_text}
                                                </td>
                                                <td className="p-4 text-xs font-mono text-right">{entry.impressions.toLocaleString()}</td>
                                                <td className="p-4 text-xs font-mono text-right font-bold text-text-primary">
                                                    {(entry.likes + entry.comments + entry.shares).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {entries.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center text-text-muted text-xs">
                                                    No performance data logged yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'log' && (
                <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-border rounded-xl bg-surface-2/30">
                    <BarChart3 size={48} className="text-text-muted opacity-20 mb-4" />
                    <p className="text-text-muted text-sm uppercase tracking-widest font-bold">Analytics Module Ready</p>
                    <p className="text-text-muted text-xs mt-2">Log more data to unlock visual trends.</p>
                </div>
            )}
        </div>
    )
}
