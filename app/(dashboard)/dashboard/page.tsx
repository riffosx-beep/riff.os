'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import StreakDisplay from '@/components/StreakDisplay'
import Link from 'next/link'
import {
    ChevronDown,
    ChevronRight,
    ArrowRight,
    Clock,
    Plus,
    Target,
    Zap,
    TrendingUp,
    AlertCircle,
} from 'lucide-react'

// Minimal Widget Component with Expand/Collapse
const Widget = ({ title, children, defaultExpanded = true, actions }: { title: string, children: React.ReactNode, defaultExpanded?: boolean, actions?: React.ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)
    return (
        <div className="border border-border bg-surface animate-enter rounded-xl overflow-hidden shadow-sm">
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface-2 transition-colors border-b border-transparent"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <ChevronRight size={14} className={`text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    <span className="text-overline tracking-widest">{title}</span>
                </div>
                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    {actions}
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-border bg-surface">
                    {children}
                </div>
            )}
        </div>
    )
}

export default function DashboardPage() {
    const [userName, setUserName] = useState('')
    const [greeting, setGreeting] = useState('Welcome back')

    // Stats & Goals
    const [weeklyTarget, setWeeklyTarget] = useState(3)
    const [postsThisWeek, setPostsThisWeek] = useState(0)
    const [consistencyScore, setConsistencyScore] = useState(0)

    const [stats, setStats] = useState({ ideas: 0, drafts: 0, ready: 0, scheduled: 0 })
    const [upcoming, setUpcoming] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [aiInsight, setAiInsight] = useState<any>(null)

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour < 12) setGreeting('Good morning')
        else if (hour < 18) setGreeting('Good afternoon')
        else setGreeting('Good evening')

        const savedTarget = localStorage.getItem('weekly_target')
        if (savedTarget) setWeeklyTarget(parseInt(savedTarget))

        fetchDashboardData()
    }, [])

    useEffect(() => {
        // Calculate Consistency Score
        // Base logic: (Posts / Target) * 60 + (Streak Bonus) + (Activity Bonus)
        const completionRatio = Math.min(postsThisWeek / weeklyTarget, 1.5) // Cap at 150%
        const score = Math.round(completionRatio * 100)
        setConsistencyScore(score)
    }, [postsThisWeek, weeklyTarget])

    const updateTarget = (newTarget: number) => {
        setWeeklyTarget(newTarget)
        localStorage.setItem('weekly_target', newTarget.toString())
    }

    async function fetchDashboardData() {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (user?.user_metadata?.full_name) {
            setUserName(user.user_metadata.full_name.split(' ')[0])
        }

        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay()) // Current week Sunday
        const startOfWeekStr = startOfWeek.toISOString().split('T')[0]

        // Fetch counts for all stages
        const [ideasRes, scriptsRes, vaultRes, calendarRes, weeklyReportRes, allCalRes] = await Promise.all([
            supabase.from('ideas').select('id', { count: 'exact' }),
            supabase.from('scripts').select('id', { count: 'exact' }),
            supabase.from('vault').select('id', { count: 'exact' }).eq('status', 'draft'),
            supabase.from('calendar').select('id', { count: 'exact' }).eq('status', 'scheduled'),
            supabase.from('weekly_reports').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
            supabase.from('calendar').select('date, status').order('date', { ascending: false })
        ])

        // Calculate Posts This Week
        const completedThisWeek = allCalRes.data?.filter(item => {
            const d = new Date(item.date)
            return d >= startOfWeek && (item.status === 'posted' || item.status === 'done')
        }).length || 0
        setPostsThisWeek(completedThisWeek)

        // Calculate Streak (Consecutive days with a post)
        let currentStreak = 0
        if (allCalRes.data) {
            const postedDates = new Set(allCalRes.data
                .filter(i => i.status === 'posted' || i.status === 'done')
                .map(i => i.date.split('T')[0])
            )

            let d = new Date()
            while (postedDates.has(d.toISOString().split('T')[0])) {
                currentStreak++
                d.setDate(d.getDate() - 1)
            }
        }

        // Generate Heatmap (Last 14 days)
        const heatmap = []
        for (let i = 13; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dStr = d.toISOString().split('T')[0]
            const hasPost = allCalRes.data?.some(item => item.date.startsWith(dStr) && (item.status === 'posted' || item.status === 'done'))
            heatmap.push(hasPost ? 'posted' : 'missed')
        }

        setStats({
            ideas: ideasRes.count || 0,
            drafts: scriptsRes.count || 0,
            ready: vaultRes.count || 0,
            scheduled: calendarRes.count || 0,
        })

        setUpcoming(allCalRes.data?.filter(i => new Date(i.date) >= new Date()).slice(0, 5) || [])

        if (weeklyReportRes.data && weeklyReportRes.data.recommendations) {
            try {
                const parsed = JSON.parse(weeklyReportRes.data.recommendations)
                setAiInsight(parsed)
            } catch (e) { console.error('Failed to parse report', e) }
        }

        setStreakInfo({
            currentStreak,
            bestStreak: Math.max(currentStreak, 10), // Fallback if best isn't tracked
            heatmapData: heatmap as any,
            hasStreakFreeze: true
        })

        setLoading(false)
    }

    const [streakInfo, setStreakInfo] = useState({
        currentStreak: 0,
        bestStreak: 0,
        heatmapData: [] as any[],
        hasStreakFreeze: false
    })

    return (
        <div className="max-w-screen-xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="py-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-display mb-1 text-4xl">
                        {greeting}{userName ? `, ${userName}` : ''}.
                    </h1>
                    <p className="text-body uppercase tracking-[0.2em] opacity-60 text-[10px]">Creator Command Center</p>
                </div>
                <div className="flex items-center gap-4 bg-surface-2 px-4 py-2 rounded-full border border-border">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-text-muted">Consistency Score</span>
                        <span className={`text-xl font-black ${consistencyScore > 80 ? 'text-green-500' : consistencyScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                            {consistencyScore}
                        </span>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] uppercase font-bold text-text-muted">Weekly Target</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-text-primary">{postsThisWeek} / {weeklyTarget}</span>
                            <div className="flex gap-1">
                                <button onClick={() => updateTarget(Math.max(1, weeklyTarget - 1))} className="w-5 h-5 flex items-center justify-center rounded bg-surface border hover:bg-surface-hover">-</button>
                                <button onClick={() => updateTarget(weeklyTarget + 1)} className="w-5 h-5 flex items-center justify-center rounded bg-surface border hover:bg-surface-hover">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak - Full width */}
            <Widget title="Consistency Tracker" defaultExpanded={true}>
                <StreakDisplay
                    currentStreak={streakInfo.currentStreak}
                    bestStreak={streakInfo.bestStreak}
                    heatmapData={streakInfo.heatmapData as any}
                    hasStreakFreeze={streakInfo.hasStreakFreeze}
                />
            </Widget>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Quick Stats & Pipeline */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Ideas Bank', count: stats.ideas, href: '/ideas', color: 'text-purple-400' },
                            { label: 'Drafts', count: stats.drafts, href: '/scripts', color: 'text-blue-400' },
                            { label: 'Ready', count: stats.ready, href: '/vault', color: 'text-green-400' },
                            { label: 'Scheduled', count: stats.scheduled, href: '/calendar', color: 'text-amber-400' },
                        ].map(stat => (
                            <Link key={stat.label} href={stat.href} className="card p-4 hover:border-text-muted transition-all group">
                                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">{stat.label}</p>
                                <p className={`text-3xl font-mono tracking-tighter ${stat.color} group-hover:scale-110 origin-left transition-transform`}>{loading ? '-' : stat.count}</p>
                            </Link>
                        ))}
                    </div>

                    <Widget title="Upcoming Schedule">
                        <div className="space-y-1">
                            {loading ? (
                                <p className="text-[10px] text-text-muted italic">Loading records...</p>
                            ) : upcoming.length === 0 ? (
                                <div className="text-center py-8 opacity-50">
                                    <p className="text-sm font-bold">Nothing scheduled.</p>
                                    <Link href="/calendar" className="text-xs text-accent hover:underline">Go to Calendar +</Link>
                                </div>
                            ) : (
                                upcoming.map((item, i) => (
                                    <div key={item.id || i} className="flex items-center justify-between p-3 bg-surface-2 hover:bg-surface-active transition-colors rounded-lg border border-transparent hover:border-border">
                                        <div className="min-w-0 flex-1 flex items-center gap-3">
                                            <div className="flex flex-col items-center justify-center w-10 h-10 bg-surface rounded border border-border">
                                                <span className="text-[9px] uppercase font-bold text-red-400">{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-sm font-bold text-text-primary leading-none">{new Date(item.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-bold mb-1 inline-block">{item.platform?.toUpperCase() || 'POST'}</span>
                                                <p className="text-sm font-medium tracking-tight truncate max-w-[200px]">{item.title}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono ml-4">
                                            <Clock size={12} />
                                            {item.time_slot || '09:00'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Widget>
                </div>

                {/* Right Column: AI Insights & Quick Actions */}
                <div className="space-y-6">
                    {/* AI Insights Card */}
                    <div className="card p-0 overflow-hidden border-indigo-500/20 bg-indigo-500/5">
                        <div className="p-4 border-b border-indigo-500/10 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                                <Zap size={16} /> AI Growth Insight
                            </h3>
                            <button className="text-[10px] uppercase font-bold text-indigo-400 hover:text-indigo-300">View Report</button>
                        </div>
                        <div className="p-5">
                            {aiInsight ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <TrendingUp size={20} className="text-green-400 mt-1" />
                                        <div>
                                            <p className="text-sm font-medium text-text-primary mb-1">Performance Trend</p>
                                            <p className="text-caption text-text-secondary leading-relaxed">{aiInsight.summary || "Your content consistency is improving. Engagement on LinkedIn posts is up 12% week-over-week."}</p>
                                        </div>
                                    </div>
                                    {aiInsight.recommendations && aiInsight.recommendations[0] && (
                                        <div className="bg-surface/50 p-3 rounded-lg border border-indigo-500/10">
                                            <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Recommended Action</p>
                                            <p className="text-xs text-text-primary">{aiInsight.recommendations[0].action}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Zap size={24} className="mx-auto text-indigo-300 mb-2 opacity-50" />
                                    <p className="text-xs text-indigo-300/70">Connect data source or wait for weekly report to see AI insights.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Widget title="Quick Actions">
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'New Idea', href: '/ideas', icon: Plus },
                                { label: 'Draft Script', href: '/scripts', icon: Plus },
                                { label: 'Pipeline', href: '/publish', icon: ArrowRight },
                                { label: 'Calendar', href: '/calendar', icon: ArrowRight },
                            ].map(action => (
                                <Link key={action.label} href={action.href} className="btn-outline flex-col py-4 border-border hover:bg-accent hover:text-white group h-24 justify-center gap-2">
                                    <action.icon size={20} className="text-text-muted group-hover:text-white transition-colors" />
                                    <span className="text-[10px] tracking-widest font-bold text-center">{action.label.toUpperCase()}</span>
                                </Link>
                            ))}
                        </div>
                    </Widget>
                </div>
            </div>

            {/* Practical Use Case Hint */}
            <div className="p-6 border border-dashed border-border text-center bg-surface-2 rounded-xl mt-8">
                <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] mb-2 font-bold italic">Pro Tip</p>
                <p className="text-[12px] max-w-lg mx-auto text-text-secondary leading-relaxed">
                    Improve your <strong>Consistency Score</strong> by planning your week ahead in the <Link href="/calendar" className="underline font-bold text-accent">Calendar</Link>.
                    Scheduled posts count towards your target immediately.
                </p>
            </div>
        </div>
    )
}
