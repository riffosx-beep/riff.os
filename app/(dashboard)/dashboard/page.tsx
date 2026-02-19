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
        <div className="max-w-5xl mx-auto space-y-6 pb-20 p-4 md:p-6 bg-background min-h-screen text-text-primary">
            {/* Compact Header - Mobile Optimized */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                Welcome, {userName || 'Creator'}.
                            </h1>
                            <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`} />
                        </div>
                        <p className="text-text-muted text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                            <Zap size={12} className="text-accent" /> SYSTEM SYNCED
                        </p>
                    </div>
                </div>
                <Link href="/ideation" className="w-full md:w-auto btn-primary px-6 py-3 md:py-2.5 rounded-lg shadow-lg shadow-accent/20 text-xs flex justify-center items-center gap-2">
                    <Plus size={14} /> NEW IDEA
                </Link>
            </div>

            {/* Momentum Recovery Alert - Compact */}
            <AnimatePresence>
                {recoveryDays > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-3 px-4 bg-danger/10 border border-danger/20 rounded-xl flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <Zap size={16} className="text-danger fill-danger" />
                            <p className="text-xs font-medium text-danger">Consistency Gap: {recoveryDays} days since last post.</p>
                        </div>
                        <Link href="/playbook" className="w-full md:w-auto text-center px-4 py-1.5 bg-danger text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-danger/90 transition-colors">
                            Fix DNA & Post
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Stats & Feed Grid - Compact Bento Style */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Column - Main Action (Span 8) */}
                <div className="lg:col-span-8 space-y-4 order-2 lg:order-1">
                    {/* Streak Engine - Compact */}
                    <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 shadow-sm relative overflow-hidden group">
                        <div className="flex flex-col gap-6">
                            <div className="w-full">
                                <StreakDisplay
                                    currentStreak={streakData.current}
                                    bestStreak={streakData.best}
                                    heatmapData={streakData.heatmap}
                                />
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-4">
                                <div>
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Discipline</p>
                                    <span className={`text-2xl md:text-3xl font-black ${stats.disciplineScore > 70 ? 'text-success' : 'text-warning'}`}>{stats.disciplineScore}%</span>
                                </div>
                                <button
                                    onClick={() => setShowGuide(!showGuide)}
                                    className="flex items-center gap-1 text-[9px] font-bold text-accent uppercase tracking-widest hover:underline"
                                >
                                    Guide {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {showGuide && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-6 pt-6 border-t border-border"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            { t: 'EXECUTION', d: 'Daily posting locks in trust.' },
                                            { t: 'STRUCTURE', d: 'Pipeline converts focus to value.' },
                                            { t: 'RECOVERY', d: 'Use the playbook if you fall behind.' }
                                        ].map((i, k) => (
                                            <div key={k}>
                                                <h4 className="text-[9px] font-bold text-text-primary uppercase tracking-widest mb-1">{i.t}</h4>
                                                <p className="text-[10px] text-text-secondary leading-snug">{i.d}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Real-time Feed - Compact List */}
                    <div className="bg-surface border border-border rounded-2xl p-4 md:p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xs uppercase tracking-tight flex items-center gap-2">
                                <Clock size={14} className="text-accent" /> Recent Activity
                            </h3>
                            <Link href="/pipeline" className="text-[9px] font-bold text-text-muted hover:text-text-primary uppercase tracking-widest flex items-center gap-1">
                                View All <ArrowRight size={10} />
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {loading ? (
                                <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-accent" /></div>
                            ) : (
                                recentActivity.slice(0, 3).map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition-all group border border-transparent hover:border-border/50 cursor-pointer">
                                        <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                                            <FileText size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-xs text-text-primary truncate max-w-[200px] md:max-w-none">{item.title || 'Untitled Draft'}</h4>
                                            <p className="text-[9px] text-text-muted uppercase">{item.type} • {new Date(item.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar (Span 4) */}
                <div className="lg:col-span-4 space-y-4 order-1 lg:order-2">
                    {/* Compact Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 border border-border rounded-xl bg-surface-2/30 flex flex-col items-center text-center">
                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Ideas</p>
                            <p className="text-xl font-bold">{stats.ideas}</p>
                        </div>
                        <div className="p-4 border border-border rounded-xl bg-surface-2/30 flex flex-col items-center text-center">
                            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Scheduled</p>
                            <p className="text-xl font-bold text-blue-500">{stats.scheduled}</p>
                        </div>
                    </div>

                    {/* Upcoming Queue - Compact */}
                    <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 h-fit">
                        <h3 className="font-bold text-xs uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Calendar size={14} className="text-blue-500" /> Up Next
                        </h3>
                        <div className="space-y-3">
                            {upcoming.length === 0 ? (
                                <div className="py-6 text-center bg-blue-500/5 rounded-xl border border-blue-500/10">
                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-2">Queue Empty</p>
                                    <Link href="/scheduling" className="text-accent text-[9px] font-bold hover:underline uppercase tracking-normal">Schedule +</Link>
                                </div>
                            ) : (
                                upcoming.slice(0, 3).map(item => (
                                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface-2/30 border border-transparent hover:border-border transition-all">
                                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-surface border border-border shrink-0">
                                            <span className="text-[8px] font-black text-danger uppercase leading-none mb-0.5">{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            <span className="text-sm font-bold text-text-primary leading-none">{new Date(item.date).getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-[11px] text-text-primary truncate max-w-[150px]">{item.title}</h4>
                                            <p className="text-[9px] text-text-muted uppercase">{item.platform}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Execution Memory - Compact */}
                    <div className="p-5 bg-accent/90 rounded-2xl text-white shadow-lg relative overflow-hidden group hidden md:block">
                        <div className="absolute -top-2 -right-2 p-2 opacity-10 rotate-12">
                            <Zap size={60} />
                        </div>
                        <h4 className="font-bold text-xs mb-2 flex items-center gap-2">
                            <Flame size={14} className="fill-white" /> System Insight
                        </h4>
                        <p className="text-[10px] leading-relaxed opacity-90 font-medium">
                            Your Creator DNA is the engine. The more specific your 'Personalization' settings, the higher the impact of your generated scripts.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
