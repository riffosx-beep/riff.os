'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
    Clock,
    Plus,
    ArrowRight,
    Loader2,
    FileText,
    Calendar,
    CheckCircle2,
    Layout,
    Flame,
    Zap,
    Info,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import StreakDisplay from '@/components/StreakDisplay'

export default function DashboardPage() {
    const [userName, setUserName] = useState('')
    const [stats, setStats] = useState({
        ideas: 0,
        scheduled: 0,
        published: 0,
        disciplineScore: 85
    })
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [upcoming, setUpcoming] = useState<any[]>([])
    const [streakData, setStreakData] = useState({
        current: 0,
        best: 10,
        heatmap: []
    })
    const [recoveryDays, setRecoveryDays] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showGuide, setShowGuide] = useState(false)
    const [isSynced, setIsSynced] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        fetchDashboardData()

        const channel = supabase
            .channel('dashboard_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vault' }, () => {
                fetchDashboardData()
                triggerSyncPulse()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar' }, () => {
                fetchDashboardData()
                triggerSyncPulse()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    function triggerSyncPulse() {
        setIsSynced(false)
        setTimeout(() => setIsSynced(true), 1000)
    }

    async function fetchDashboardData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (user?.user_metadata?.full_name) {
            setUserName(user.user_metadata.full_name.split(' ')[0])
        }

        const [vaultRes, calendarRes, recentRes, allCalRes] = await Promise.all([
            supabase.from('vault').select('id, type, status'),
            supabase.from('calendar').select('*').order('date', { ascending: true }),
            supabase.from('vault').select('*').order('updated_at', { ascending: false }).limit(5),
            supabase.from('calendar').select('date, status').order('date', { ascending: false })
        ])

        // Stats
        const scheduled = calendarRes.data?.filter(e => e.status === 'scheduled') || []
        const published = calendarRes.data?.filter(e => e.status === 'posted' || e.status === 'done') || []

        // CDS Calculation
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            return d.toISOString().split('T')[0]
        })
        const postedSet = new Set(allCalRes.data?.filter(e => e.status === 'posted' || e.status === 'done').map(e => e.date))
        const postedLast7 = last7Days.filter(d => postedSet.has(d)).length
        const cds = Math.round((postedLast7 / 7) * 100)

        setStats({
            ideas: vaultRes.data?.length || 0,
            scheduled: scheduled.length,
            published: published.length,
            disciplineScore: cds
        })

        // Streak & Recovery logic
        const postedDays = new Set(
            allCalRes.data
                ?.filter(e => e.status === 'posted' || e.status === 'done')
                .map(e => e.date)
        )

        let currentStreak = 0
        const checkDate = new Date()
        while (postedDays.has(checkDate.toISOString().split('T')[0])) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
        }

        let inactiveCount = 0
        const recDate = new Date()
        while (!postedDays.has(recDate.toISOString().split('T')[0]) && inactiveCount < 14) {
            inactiveCount++
            recDate.setDate(recDate.getDate() - 1)
        }
        setRecoveryDays(currentStreak > 0 ? 0 : inactiveCount)

        const heatmap = Array.from({ length: 14 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            if (postedDays.has(dateStr)) return 'posted'
            return 'empty'
        }).reverse()

        setStreakData({
            current: currentStreak,
            best: Math.max(currentStreak, 10),
            heatmap: heatmap as any
        })

        setRecentActivity(recentRes.data || [])
        setUpcoming(scheduled.filter(e => new Date(e.date) >= new Date()).slice(0, 5))

        setLoading(false)
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20 p-6 bg-background min-h-screen text-text-primary">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Welcome, {userName || 'Creator'}.
                        </h1>
                        <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`} />
                    </div>
                    <p className="text-text-muted text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                        <Zap size={12} className="text-accent" /> CREATOR COMMAND CENTER — SYNCED
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/ideation" className="btn-primary px-8 py-3 rounded-xl shadow-xl shadow-accent/20">
                        <Plus size={16} /> NEW IDEA
                    </Link>
                </div>
            </div>

            {/* Momentum Recovery Alert */}
            <AnimatePresence>
                {recoveryDays > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-danger/10 border border-danger/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-danger/20 flex items-center justify-center text-danger">
                                <Zap size={24} className="fill-danger" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-danger uppercase italic">Momentum Warning</h3>
                                <p className="text-xs text-text-secondary">You've skipped {recoveryDays} days. The algorithm is cooling off — here's how to recover.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Link href="/playbook" className="flex-1 md:flex-none text-center px-6 py-2 bg-danger text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-danger/20">
                                3-STEP RECOVERY PLAN
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Stats & Feed Grid */}
            <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                <div className="space-y-8">
                    {/* Streak Engine */}
                    <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <div className="flex-1">
                                <StreakDisplay
                                    currentStreak={streakData.current}
                                    bestStreak={streakData.best}
                                    heatmapData={streakData.heatmap}
                                />
                            </div>
                            <div className="flex flex-col items-center lg:items-end gap-2">
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Discipline Score</p>
                                    <div className="flex items-baseline gap-2 justify-end">
                                        <span className={`text-4xl font-black ${stats.disciplineScore > 70 ? 'text-success' : 'text-warning'}`}>{stats.disciplineScore}%</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowGuide(!showGuide)}
                                    className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest hover:underline"
                                >
                                    System Guide {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showGuide && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-8 pt-8 border-t border-border"
                                >
                                    <div className="grid md:grid-cols-3 gap-8">
                                        <div>
                                            <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-widest mb-3">01 EXECUTION</h4>
                                            <p className="text-xs text-text-secondary leading-relaxed">Daily posting is the memory system for your audience. Maintain 100% CDS to lock in trust.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-widest mb-3">02 STRUCTURE</h4>
                                            <p className="text-xs text-text-secondary leading-relaxed">The Pipeline converts raw focus into distributed value. Don't wait for inspiration.</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-widest mb-3">03 RECOVERY</h4>
                                            <p className="text-xs text-text-secondary leading-relaxed">If momentum drops, the system provides a personalized playbook to restart.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Feedback Engine & Growth Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-surface border border-border rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-accent/40 transition-colors">
                            <div>
                                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mb-4">Growth Summary</h3>
                                <div className="relative aspect-video rounded-2xl bg-surface-2 border border-border overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-purple-600/20 mix-blend-overlay" />
                                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer border border-white/20">
                                        <ArrowRight size={24} className="text-white fill-white" />
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">Generating Weekly Breakdown...</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-text-secondary mt-6 leading-relaxed">Your weekly engagement memory is being processed. 14 insights pending.</p>
                        </div>

                        <div className="bg-gradient-to-br from-accent/5 to-purple-600/5 border border-accent/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-16 h-16 bg-accent/20 rounded-[2rem] flex items-center justify-center text-accent">
                                <Layout size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-text-primary uppercase italic tracking-tighter">Content Playbook</h3>
                                <p className="text-xs text-text-secondary">Your personalized systems for LinkedIn & X distribution.</p>
                            </div>
                            <Link href="/playbook" className="w-full py-4 bg-surface border border-border hover:border-accent rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                                VIEW PLAYBOOK
                            </Link>
                        </div>
                    </div>

                    {/* Real-time Feed */}
                    <div className="bg-surface border border-border rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-sm uppercase tracking-tight flex items-center gap-3">
                                <Clock size={16} className="text-accent" /> Real-time Feed
                            </h3>
                            <Link href="/pipeline" className="text-[9px] font-bold text-text-muted hover:text-text-primary uppercase tracking-widest flex items-center gap-1 transition-colors">
                                Manage Pipeline <ArrowRight size={12} />
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {loading ? (
                                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent" /></div>
                            ) : (
                                recentActivity.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-2 transition-all group border border-transparent hover:border-border">
                                        <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted group-hover:text-accent transition-colors">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-text-primary truncate">{item.title || 'Untitled'}</h4>
                                            <p className="text-[10px] text-text-muted font-bold uppercase mt-1">{item.type} • Synced {new Date(item.updated_at).toLocaleDateString()}</p>
                                        </div>
                                        <ArrowRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-surface border border-border rounded-3xl p-8">
                        <h3 className="font-bold text-sm uppercase tracking-tight mb-8 flex items-center gap-3">
                            <Calendar size={16} className="text-blue-500" /> Upcoming Queue
                        </h3>
                        <div className="space-y-4">
                            {upcoming.length === 0 ? (
                                <div className="py-10 text-center bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                    <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-2">Queue is empty</p>
                                    <Link href="/scheduling" className="text-accent text-[10px] font-bold hover:underline uppercase tracking-widest">Schedule Content</Link>
                                </div>
                            ) : (
                                upcoming.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-2/50 border border-border group hover:border-accent transition-all">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-surface border border-border shrink-0">
                                            <span className="text-[9px] font-black text-danger uppercase leading-none mb-1">{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="text-lg font-bold text-text-primary leading-none">{new Date(item.date).getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-xs text-text-primary truncate">{item.title}</h4>
                                            <p className="bg-accent/10 text-accent px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest inline-block mt-1">{item.platform}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-accent rounded-[2.5rem] text-white shadow-2xl shadow-accent/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap size={80} />
                        </div>
                        <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                            <Flame size={16} className="fill-white" /> Execution Memory
                        </h4>
                        <p className="text-[11px] leading-relaxed opacity-90">
                            The system has noted your hook performance on LinkedIn is peaking on Tuesdays. We recommend concentrating your heavy 'Founder-led' scripts for that window.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 border border-border rounded-2xl bg-surface-2/40">
                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Ideas Bank</p>
                            <p className="text-2xl font-bold mt-1">{stats.ideas}</p>
                        </div>
                        <div className="p-6 border border-border rounded-2xl bg-surface-2/40">
                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Scheduled</p>
                            <p className="text-2xl font-bold mt-1 text-blue-500">{stats.scheduled}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
