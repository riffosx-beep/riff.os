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
    Edit2,
    BarChart3,
    ArrowRight,
    Search,
    Filter,
    Flame
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PLATFORMS = ['LinkedIn', 'Twitter/X', 'Instagram', 'YouTube', 'TikTok']
const CONTENT_TYPES = ['text', 'carousel', 'video', 'reel', 'story', 'thread', 'newsletter']
const TIME_SLOTS = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const getDayOfWeek = (year: number, month: number, day: number) => new Date(year, month, day).getDay()

export default function SchedulingPage() {
    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [entries, setEntries] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newEntry, setNewEntry] = useState<any>({ title: '', platform: 'LinkedIn', content_type: 'text', status: 'planned', time_slot: '9:00 AM', notes: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showStats, setShowStats] = useState(false)

    // Stats state
    const [stats, setStats] = useState({
        planned: 0,
        scheduled: 0,
        posted: 0,
        streak: 0
    })

    const supabase = createClient()

    useEffect(() => {
        fetchEntries()
    }, [currentMonth, currentYear])

    async function fetchEntries() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
        const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${getDaysInMonth(currentYear, currentMonth)}`

        const [calRes, allCalRes] = await Promise.all([
            supabase.from('calendar').select('*').gte('date', startDate).lte('date', endDate).order('date'),
            supabase.from('calendar').select('date, status').eq('user_id', user.id).order('date', { ascending: false })
        ])

        if (calRes.data) {
            setEntries(calRes.data)

            // Calculate Streak
            const postedDays = new Set(allCalRes.data?.filter(e => e.status === 'posted' || e.status === 'done').map(e => e.date))
            let streak = 0
            const check = new Date()
            while (postedDays.has(check.toISOString().split('T')[0])) {
                streak++
                check.setDate(check.getDate() - 1)
            }

            setStats({
                planned: calRes.data.filter(e => e.status === 'planned' || e.status === 'drafted').length,
                scheduled: calRes.data.filter(e => e.status === 'scheduled').length,
                posted: calRes.data.filter(e => e.status === 'posted' || e.status === 'done').length,
                streak
            })
        }
        setLoading(false)
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
                user_id: user.id
            }

            // Remove id from payload if update
            const { id, ...dataToSave } = entryToSave

            if (id && id !== 'new') {
                await supabase.from('calendar').update(dataToSave).eq('id', id)
            } else {
                await supabase.from('calendar').insert(dataToSave)
            }

            setShowAddModal(false)
            setNewEntry({ title: '', platform: 'LinkedIn', content_type: 'text', status: 'planned', time_slot: '9:00 AM', notes: '' })
            fetchEntries()
        } catch (err) {
            console.error(err)
            alert('Failed to save entry')
        } finally {
            setSaving(false)
        }
    }

    async function deleteEntry(id: string) {
        if (!confirm('Delete this entry?')) return
        await supabase.from('calendar').delete().eq('id', id)
        fetchEntries()
    }

    const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfWeek = getDayOfWeek(currentYear, currentMonth, 1)

    const calendarDays = []
    for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null)
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

    const getEntriesForDay = (day: number) => entries.filter(e => {
        const d = new Date(e.date + 'T12:00:00') // Avoid TZ issues
        return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const handleApplyAiStrategy = () => {
        setNewEntry({
            title: 'AI Strategy: Contrarian Education Post',
            platform: 'LinkedIn',
            content_type: 'text',
            status: 'planned',
            time_slot: '10:00 AM',
            notes: 'Suggested by CreatorOS AI based on your recent 80/20 slant.'
        })
        setSelectedDate(new Date().toISOString().split('T')[0])
        setShowAddModal(true)
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 p-6 bg-background text-text-primary min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Scheduling Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Plan your content empire.</p>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-xs font-bold text-accent uppercase tracking-widest">Synced with Engine</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className={`btn-secondary px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all ${showStats ? 'bg-accent text-white border-accent' : ''}`}
                    >
                        <BarChart3 size={16} /> {showStats ? 'HIDE STATS' : 'ANALYTICS'}
                    </button>
                    <button
                        onClick={() => {
                            setSelectedDate(today.toISOString().split('T')[0])
                            setNewEntry({ title: '', platform: 'LinkedIn', content_type: 'text', status: 'planned', time_slot: '9:00 AM', notes: '' })
                            setShowAddModal(true)
                        }}
                        className="btn-primary px-8 py-2.5 rounded-xl shadow-lg shadow-accent/20"
                    >
                        <Plus size={16} /> NEW POST
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showStats && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-surface border border-border rounded-2xl mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Planned</p>
                                <p className="text-2xl font-bold">{stats.planned}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Scheduled</p>
                                <p className="text-2xl font-bold text-blue-500">{stats.scheduled}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Live Posts</p>
                                <p className="text-2xl font-bold text-green-500">{stats.posted}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Streak</p>
                                <p className="text-2xl font-bold text-orange-500">{stats.streak} Days</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                {/* Calendar Area */}
                <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                    {/* Month Navigator */}
                    <div className="p-6 border-b border-border flex items-center justify-between bg-surface-2/30">
                        <h2 className="text-xl font-bold">{monthName}</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                                    else setCurrentMonth(currentMonth - 1);
                                }}
                                className="p-2 hover:bg-surface-hover rounded-xl border border-border transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}
                                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors"
                            >
                                TODAY
                            </button>
                            <button
                                onClick={() => {
                                    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                                    else setCurrentMonth(currentMonth + 1);
                                }}
                                className="p-2 hover:bg-surface-hover rounded-xl border border-border transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                            <div key={d} className="py-4 text-[10px] font-black text-text-muted text-center border-b border-border tracking-[0.2em]">
                                {d}
                            </div>
                        ))}
                        {calendarDays.map((day, i) => {
                            const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null
                            const dayEntries = day ? getEntriesForDay(day) : []
                            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
                            const isSelected = selectedDate === dateStr

                            return (
                                <div
                                    key={i}
                                    onClick={() => day && setSelectedDate(dateStr)}
                                    className={`min-h-[140px] p-3 border-r border-b border-border transition-all cursor-pointer relative group ${!day ? 'bg-surface-2/20' : 'bg-transparent'} ${isSelected ? 'bg-accent/5' : 'hover:bg-surface-hover'}`}
                                >
                                    {day && (
                                        <>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-xs font-bold ${isToday ? 'w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center -mt-1 -ml-1' : 'text-text-muted'}`}>
                                                    {day}
                                                </span>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus size={14} className="text-text-muted hover:text-accent" onClick={(e) => { e.stopPropagation(); setSelectedDate(dateStr); setShowAddModal(true); }} />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 overflow-y-auto max-h-[100px] no-scrollbar">
                                                {dayEntries.map(e => (
                                                    <div
                                                        key={e.id}
                                                        onClick={(ev) => { ev.stopPropagation(); setNewEntry(e); setSelectedDate(e.date); setShowAddModal(true); }}
                                                        className={`px-2 py-1.5 rounded-lg text-[9px] font-bold truncate border transition-all hover:scale-[1.02] ${e.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                            e.status === 'posted' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                                'bg-surface-2 text-text-muted border-border'
                                                            }`}
                                                    >
                                                        {e.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 text-orange-500 mb-6 font-bold uppercase tracking-widest text-[10px]">
                            <Flame size={14} className="fill-orange-500" /> Consistency Engine
                        </div>
                        <div className="text-4xl font-black mb-2">{stats.streak} Days</div>
                        <p className="text-xs text-text-secondary leading-relaxed mb-6">You've posted {stats.posted} times this month. Your streak is calculated across all social channels.</p>
                        <button className="w-full py-3 bg-surface-2 hover:bg-surface-active rounded-xl border border-border text-[10px] font-bold uppercase tracking-widest transition-all">
                            Export Calendar
                        </button>
                    </div>

                    <div className="bg-accent rounded-3xl p-8 text-white relative overflow-hidden group">
                        <Zap size={40} className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform" />
                        <h4 className="font-bold text-sm mb-3 uppercase tracking-tight flex items-center gap-2">
                            <Zap size={14} /> Creator Insight
                        </h4>
                        <p className="text-xs leading-relaxed opacity-90 mb-6">
                            Contrarian posts are performing **better** on LinkedIn. Suggestion: Apply "Contrarian Education" strategy to next available slot.
                        </p>
                        <button
                            onClick={handleApplyAiStrategy}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            APPLY TO CALENDAR <ArrowRight size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-surface border border-border rounded-[2.5rem] w-full max-w-xl p-10 shadow-3xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold">{newEntry.id ? 'Edit Entry' : 'Schedule Content'}</h3>
                                    <p className="text-[10px] text-text-muted font-bold uppercase mt-1 tracking-widest">
                                        {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                                    </p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-surface-2 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Title / Hook Concept</label>
                                    <input
                                        type="text"
                                        value={newEntry.title}
                                        onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
                                        className="w-full bg-surface-2 border border-border rounded-2xl p-4 text-sm focus:border-accent outline-none"
                                        placeholder="Enter content title..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Platform</label>
                                        <select
                                            value={newEntry.platform}
                                            onChange={e => setNewEntry({ ...newEntry, platform: e.target.value })}
                                            className="w-full bg-surface-2 border border-border rounded-2xl p-4 text-sm outline-none"
                                        >
                                            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Status</label>
                                        <select
                                            value={newEntry.status}
                                            onChange={e => setNewEntry({ ...newEntry, status: e.target.value })}
                                            className="w-full bg-surface-2 border border-border rounded-2xl p-4 text-sm outline-none"
                                        >
                                            <option value="planned">Planned (Draft)</option>
                                            <option value="scheduled">Scheduled</option>
                                            <option value="posted">Posted / Live</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Notes / Script Context</label>
                                    <textarea
                                        value={newEntry.notes || ''}
                                        onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })}
                                        rows={4}
                                        className="w-full bg-surface-2 border border-border rounded-2xl p-4 text-sm outline-none resize-none"
                                        placeholder="Add additional notes or the full script here..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    {newEntry.id && (
                                        <button onClick={() => deleteEntry(newEntry.id)} className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 size={24} />
                                        </button>
                                    )}
                                    <button
                                        onClick={saveEntry}
                                        disabled={saving || !newEntry.title?.trim()}
                                        className="flex-1 py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20"
                                    >
                                        {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                        {newEntry.id ? 'UPDATE ENTRY' : 'SCHEDULE POST'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
