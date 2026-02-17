'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Sparkles,
    FileText,
    Clock,
    Loader2,
    Trash2,
    Check,
    Brain,
    Zap,
    Target,
    ChevronDown,
    Save,
    Edit2, // Added Edit icon
    Paperclip
} from 'lucide-react'
import { Database } from '@/lib/types'
import AssetManager from '@/components/AssetManager' // Import AssetManager

type CalendarRow = Database['public']['Tables']['calendar']['Row']
type VaultRow = Database['public']['Tables']['vault']['Row']

interface CalendarEntry extends Omit<CalendarRow, 'created_at' | 'updated_at'> {
    // UI specific optional fields if any, but mostly strict database mapping
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const getDayOfWeek = (year: number, month: number, day: number) => new Date(year, month, day).getDay()

const PLATFORMS = ['LinkedIn', 'Twitter/X', 'Instagram', 'YouTube', 'TikTok']
const CONTENT_TYPES = ['text', 'carousel', 'video', 'reel', 'story', 'thread', 'newsletter']
const TIME_SLOTS = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']

export default function CalendarPage() {
    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [entries, setEntries] = useState<CalendarEntry[]>([])
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newEntry, setNewEntry] = useState<Partial<CalendarEntry>>({ title: '', platform: 'LinkedIn', content_type: 'text', status: 'planned', time_slot: '9:00 AM', notes: '' })
    const [saving, setSaving] = useState(false)

    // AI Autofill
    const [aiLoading, setAiLoading] = useState(false)
    const [aiFillDays, setAiFillDays] = useState(7)
    const [aiFillPlatforms, setAiFillPlatforms] = useState<string[]>(['LinkedIn'])
    const [aiFillFreq, setAiFillFreq] = useState('daily')
    const [aiFillContentPillars, setAiFillContentPillars] = useState('')

    // Strategy State
    const [showStrategy, setShowStrategy] = useState(false)
    const [savingStrategy, setSavingStrategy] = useState(false)
    const [strategy, setStrategy] = useState({
        theme: '',
        goal: 'growth',
        pillars: [] as string[],
        cta: ''
    })

    const supabase = createClient()

    useEffect(() => {
        // Fetch strategy for this month
        const fetchStrategy = async () => {
            const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
            const { data } = await supabase.from('vault')
                .select('*')
                .eq('type', 'strategy_monthly')
                .ilike('title', `%${monthStr}%`)
                .maybeSingle()

            if (data && data.content) {
                try {
                    const parsed = JSON.parse(data.content)
                    setStrategy(parsed)
                } catch (e) { console.error('Failed to parse strategy', e) }
            } else {
                setStrategy({ theme: '', goal: 'growth', pillars: [], cta: '' })
            }
        }
        fetchStrategy()
    }, [currentMonth, currentYear])

    const saveStrategy = async () => {
        setSavingStrategy(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
            const title = `Strategy ${monthStr}`

            // Check if exists
            const { data: existing } = await supabase.from('vault')
                .select('id')
                .eq('type', 'strategy_monthly')
                .ilike('title', `%${monthStr}%`)
                .maybeSingle()

            if (existing) {
                await supabase.from('vault').update({
                    content: JSON.stringify(strategy),
                    ai_notes: `Goal: ${strategy.goal}, Theme: ${strategy.theme}`
                }).eq('id', existing.id)
            } else {
                await supabase.from('vault').insert({
                    user_id: user.id,
                    title: title,
                    content: JSON.stringify(strategy),
                    type: 'strategy_monthly',
                    status: 'active',
                    ai_notes: `Goal: ${strategy.goal}, Theme: ${strategy.theme}`
                })
            }
            setShowStrategy(false)
        } catch (e) {
            console.error(e)
            alert('Failed to save strategy')
        } finally {
            setSavingStrategy(false)
        }
    }



    useEffect(() => {
        fetchEntries()
        const scheduleTitle = localStorage.getItem('schedule_title')
        if (scheduleTitle) {
            setNewEntry(prev => ({ ...prev, title: scheduleTitle }))
            setSelectedDate(new Date().toISOString().split('T')[0]) // Default to today
            setShowAddModal(true)
            localStorage.removeItem('schedule_title')
        }
    }, [currentMonth, currentYear])

    async function fetchEntries() {
        const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
        const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${getDaysInMonth(currentYear, currentMonth)}`
        const { data } = await supabase.from('calendar').select('*').gte('date', startDate).lte('date', endDate).order('date')
        if (data) setEntries(data as CalendarEntry[])
    }

    async function saveEntry() {
        if (!newEntry.title?.trim() || !selectedDate) return
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const entryToSave = {
                ...newEntry,
                date: selectedDate,
                user_id: user.id,
                platform: newEntry.platform || 'LinkedIn',
                content_type: newEntry.content_type || 'text',
                title: newEntry.title
            }

            if (newEntry.id) {
                // Update
                await supabase.from('calendar').update(entryToSave as any).eq('id', newEntry.id)
            } else {
                // Insert
                await supabase.from('calendar').insert(entryToSave as any)
            }

            setShowAddModal(false)
            setNewEntry({ title: '', platform: 'LinkedIn', content_type: 'text', status: 'planned', time_slot: '9:00 AM', notes: '' })
            fetchEntries()
        } catch (err) {
            console.error('Calendar save error:', err)
            alert(err instanceof Error ? `Failed to save: ${err.message}` : 'Failed to save schedule')
        } finally {
            setSaving(false)
        }
    }

    async function deleteEntry(id: string) {
        if (!confirm('Delete this entry?')) return
        await supabase.from('calendar').delete().eq('id', id)
        fetchEntries()
    }

    // Open modal for editing
    function editEntry(entry: CalendarEntry) {
        setNewEntry(entry)
        setSelectedDate(entry.date)
        setShowAddModal(true)
    }

    async function aiAutofill() {
        setAiLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'calendar-autofill',
                    daysToFill: aiFillDays,
                    platforms: aiFillPlatforms,
                    niche: aiFillContentPillars,
                    startDate: new Date().toISOString().split('T')[0],
                }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            const startDateObj = new Date()

            const calItems = Array.isArray(data.calendar) ? data.calendar : []
            const calEntries = calItems.map((item: any) => {
                // Calculate date based on day offset
                const itemDate = new Date(startDateObj)

                // Safely parse day offset
                let dayOffset = 0
                if (item.day) {
                    const parsedDay = parseInt(String(item.day).replace(/\D/g, ''))
                    if (!isNaN(parsedDay)) dayOffset = parsedDay - 1
                }
                itemDate.setDate(startDateObj.getDate() + dayOffset)

                return {
                    title: item.title || 'Untitled Content',
                    date: itemDate.toISOString().split('T')[0],
                    platform: item.platform || 'LinkedIn',
                    content_type: item.content_type || 'text',
                    status: 'planned',
                    time_slot: item.time_slot || '9:00 AM',
                    notes: item.hook || item.notes || '',
                    user_id: user.id,
                }
            })

            if (calEntries.length > 0) {
                const { error: insertError } = await supabase.from('calendar').insert(calEntries)
                if (insertError) throw insertError
                fetchEntries()
                alert(`Successfully filled ${calEntries.length} days!`)
            } else {
                alert('AI returned an empty calendar. Try broadening your pillars.')
            }
        } catch (err) {
            console.error(err)
            alert(err instanceof Error ? err.message : 'AI autofill failed')
        } finally {
            setAiLoading(false)
        }
    }

    function updateStatus(id: string, status: string) {
        supabase.from('calendar').update({ status }).eq('id', id).then(() => fetchEntries())
    }

    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfWeek = getDayOfWeek(currentYear, currentMonth, 1)
    const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    const days = []
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)

    const getEntriesForDay = (day: number) => entries.filter(e => {
        if (!e.date) return false
        const entryDate = new Date(e.date)
        if (isNaN(entryDate.getTime())) return false
        return entryDate.getDate() === day && entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
    })

    const isToday = (day: number) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

    return (
        <div className="space-y-6 animate-enter pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon size={20} className="text-blue-500" />
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Content Calendar</h1>
                    </div>
                    <p className="text-sm text-text-muted">Plan, schedule, and AI-fill your content calendar.</p>
                </div>
            </div>

            {/* AI Autofill Card */}
            <div className="card p-5">
                <h3 className="text-h3 text-text-primary mb-3 flex items-center gap-2"><Brain size={16} className="text-blue-500" /> AI Auto-Fill Calendar</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="text-caption mb-1 block">Days</label>
                        <div className="flex gap-2">
                            {[7, 14, 30].map(d => (
                                <button key={d} onClick={() => setAiFillDays(d)} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium ${aiFillDays === d ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-surface-2 text-text-muted border border-border'}`}>
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-caption mb-1 block">Platforms</label>
                        <div className="flex gap-1 flex-wrap">
                            {PLATFORMS.map(p => (
                                <button key={p} onClick={() => setAiFillPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} className={`px-2 py-1 rounded text-[10px] font-medium ${aiFillPlatforms.includes(p) ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-surface-2 text-text-muted border border-border'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-caption mb-1 block">Frequency</label>
                        <select value={aiFillFreq} onChange={e => setAiFillFreq(e.target.value)} className="input text-xs">
                            <option value="daily">Daily</option>
                            <option value="weekdays">Weekdays</option>
                            <option value="3x-week">3x / Week</option>
                            <option value="2x-week">2x / Week</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-caption mb-1 block">Content Pillars</label>
                        <input type="text" value={aiFillContentPillars} onChange={e => setAiFillContentPillars(e.target.value)} className="input text-xs" placeholder="mindset, scaling..." />
                    </div>
                </div>
                <button onClick={aiAutofill} disabled={aiLoading || aiFillPlatforms.length === 0} className="btn-primary bg-blue-600 hover:bg-blue-700 mt-3">
                    {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {aiLoading ? 'Filling Calendar...' : `Auto-fill ${aiFillDays} Days`}
                </button>
            </div>

            {/* Month Navigation & Strategy */}
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between">
                    <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) } else setCurrentMonth(currentMonth - 1) }} className="btn-icon">
                        <ChevronLeft size={16} />
                    </button>
                    <h2 className="text-h3 text-text-primary capitalize">{monthName}</h2>
                    <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) } else setCurrentMonth(currentMonth + 1) }} className="btn-icon">
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Strategy Builder */}
                <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setShowStrategy(!showStrategy)}>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                            <Target size={14} className="text-accent" /> Monthly Strategy
                        </h3>
                        {showStrategy ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>

                    {showStrategy && (
                        <div className="space-y-4 animate-enter mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-caption mb-1 block">Monthly Theme</label>
                                    <input
                                        type="text"
                                        value={strategy.theme}
                                        onChange={e => setStrategy({ ...strategy, theme: e.target.value })}
                                        className="input"
                                        placeholder="e.g. Authority Building"
                                    />
                                </div>
                                <div>
                                    <label className="text-caption mb-1 block">Primary Goal</label>
                                    <select
                                        value={strategy.goal}
                                        onChange={e => setStrategy({ ...strategy, goal: e.target.value })}
                                        className="input"
                                    >
                                        <option value="growth">Audience Growth</option>
                                        <option value="leads">Lead Generation</option>
                                        <option value="sales">Direct Sales</option>
                                        <option value="nurture">Community Nurture</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-caption mb-1 block">Focus Pillars (max 3)</label>
                                <div className="flex gap-2">
                                    {['Education', 'Story', 'Case Study', 'Observation', 'Contrarian', 'Personal'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => {
                                                const pillars = strategy.pillars.includes(p)
                                                    ? strategy.pillars.filter(x => x !== p)
                                                    : [...strategy.pillars, p].slice(0, 3)
                                                setStrategy({ ...strategy, pillars })
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${strategy.pillars.includes(p) ? 'bg-accent/10 text-accent border-accent/30' : 'bg-surface-2 border-border text-text-muted'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-caption mb-1 block">Primary CTA</label>
                                <input
                                    type="text"
                                    value={strategy.cta}
                                    onChange={e => setStrategy({ ...strategy, cta: e.target.value })}
                                    className="input"
                                    placeholder="e.g. Join the newsletter"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button onClick={saveStrategy} disabled={savingStrategy} className="btn-secondary text-xs">
                                    {savingStrategy ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                    Save Strategy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="card overflow-hidden">
                <div className="grid grid-cols-7">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="p-2 text-center text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border bg-surface-2">
                            {d}
                        </div>
                    ))}
                    {days.map((day, i) => {
                        const dayEntries = day ? getEntriesForDay(day) : []
                        const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''
                        return (
                            <div
                                key={i}
                                onClick={() => { if (day) { setSelectedDate(dateStr); setNewEntry({ title: '', platform: 'LinkedIn', content_type: 'text', status: 'planned', time_slot: '9:00 AM', notes: '' }); setShowAddModal(true) } }}
                                className={`min-h-[80px] p-1.5 border-b border-r border-border cursor-pointer hover:bg-surface-hover transition-colors ${!day ? 'bg-surface-2' : ''} ${isToday(day || 0) ? 'bg-blue-500/5' : ''}`}
                            >
                                {day && (
                                    <>
                                        <span className={`text-xs font-medium ${isToday(day) ? 'text-blue-400 font-bold' : 'text-text-muted'}`}>{day}</span>
                                        <div className="mt-0.5 space-y-0.5">
                                            {dayEntries.slice(0, 3).map((e, j) => (
                                                <div key={j} onClick={(ev) => { ev.stopPropagation(); editEntry(e) }} className={`text-[9px] px-1 py-0.5 rounded truncate cursor-pointer hover:scale-105 transition-transform ${e.status === 'done' ? 'bg-green-500/10 text-green-400' : e.status === 'posted' ? 'bg-blue-500/10 text-blue-400' : 'bg-surface-2 text-text-muted border border-border'}`} title={e.title}>
                                                    {e.title}
                                                </div>
                                            ))}
                                            {dayEntries.length > 3 && <span className="text-[9px] text-text-muted">+{dayEntries.length - 3} more</span>}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Day Detail Panel */}
            {selectedDate && (
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-h3 text-text-primary">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                        <button onClick={() => setSelectedDate(null)} className="btn-icon"><X size={14} /></button>
                    </div>
                    <div className="space-y-2 mb-4">
                        {entries.filter(e => e.date === selectedDate || e.date?.startsWith(selectedDate)).map((e, i) => (
                            <div key={e.id || i} onClick={() => editEntry(e)} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg border border-border cursor-pointer hover:border-blue-500/30 transition-colors">
                                <div>
                                    <p className="text-body-sm font-medium text-text-primary">{e.title}</p>
                                    <p className="text-caption">{e.platform} · {e.content_type} · {e.time_slot}</p>
                                    {e.notes && <p className="text-caption text-text-muted mt-0.5">{e.notes}</p>}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border uppercase tracking-wider font-bold text-text-muted">
                                        {e.status}
                                    </div>
                                    <button onClick={(ev) => { ev.stopPropagation(); if (e.id) deleteEntry(e.id) }} className="btn-icon text-red-400 hover:bg-red-500/10"><Trash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => { setNewEntry({ title: '', platform: 'LinkedIn', content_type: 'text', status: 'planned', time_slot: '9:00 AM', notes: '' }); setShowAddModal(true) }} className="btn-secondary w-full">
                        <Plus size={14} /> Add Content for This Day
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto" onClick={() => setShowAddModal(false)}>
                    <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6 shadow-2xl my-8 relative" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-h3 text-text-primary">{newEntry.id ? 'Edit Content' : 'Schedule Content'}</h3>
                            <button onClick={() => setShowAddModal(false)} className="btn-icon"><X size={14} /></button>
                        </div>
                        <p className="text-caption mb-4">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <div className="space-y-3">
                            <input type="text" value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} className="input" placeholder="Content title or topic..." />
                            <div className="grid grid-cols-3 gap-3">
                                <select value={newEntry.platform} onChange={e => setNewEntry({ ...newEntry, platform: e.target.value })} className="input">
                                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                                </select>
                                <select value={newEntry.content_type} onChange={e => setNewEntry({ ...newEntry, content_type: e.target.value })} className="input">
                                    {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <select value={newEntry.time_slot || ''} onChange={e => setNewEntry({ ...newEntry, time_slot: e.target.value })} className="input">
                                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <select value={newEntry.status || 'planned'} onChange={e => setNewEntry({ ...newEntry, status: e.target.value })} className="input">
                                    <option value="planned">Planned</option>
                                    <option value="drafted">Drafted</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="posted">Posted</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>

                            <textarea value={newEntry.notes || ''} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} rows={2} className="input resize-none" placeholder="Notes, hook idea, or brief..." />

                            {/* Assets Section */}
                            <div className="pt-4 border-t border-border">
                                {newEntry.id ? (
                                    <AssetManager parentId={newEntry.id} />
                                ) : (
                                    <div className="p-3 bg-surface-2 rounded-lg border border-border text-center">
                                        <p className="text-xs text-text-muted">Save this entry to attach files & assets.</p>
                                    </div>
                                )}
                            </div>

                            <button onClick={saveEntry} disabled={saving || !newEntry.title?.trim()} className="btn-primary bg-blue-600 w-full mt-4">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <CalendarIcon size={14} />}
                                {saving ? 'Saving...' : 'Save Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
