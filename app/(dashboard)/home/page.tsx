'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, FileText, Calendar, BarChart3, ArrowRight, ArrowUpRight, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useDashboardStats } from '@/hooks/useDashboardStats'

export default function HomePage() {
    const { stats, recentActivity, loading } = useDashboardStats()

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-20"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-2 border border-accent/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        System Online
                    </motion.div>
                    <motion.h1 variants={item} className="text-4xl font-bold text-text-primary tracking-tight">Command Center</motion.h1>
                    <motion.p variants={item} className="text-text-muted mt-1">Overview of your content engine.</motion.p>
                </div>
                <motion.div variants={item} className="flex gap-3">
                    <Link href="/ideas" className="btn-secondary flex items-center gap-2">
                        <Plus size={16} /> New Idea
                    </Link>
                    <Link href="/scripts" className="btn-primary flex items-center gap-2 shadow-lg shadow-accent/20">
                        <Sparkles size={16} /> Generate Script
                    </Link>
                </motion.div>
            </div>

            {/* Stats Grid - Bento Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    label="Total Ideas"
                    value={loading ? '-' : stats.totalIdeas.toString()}
                    icon={Lightbulb}
                    trend="+2 this week"
                    color="text-yellow-400"
                    gradient="from-yellow-400/20 to-transparent"
                    delay={0}
                />
                <StatsCard
                    label="Scripts Drafted"
                    value={loading ? '-' : stats.totalScripts.toString()}
                    icon={FileText}
                    trend="Active"
                    color="text-blue-400"
                    gradient="from-blue-400/20 to-transparent"
                    delay={0.1}
                />
                <StatsCard
                    label="Scheduled"
                    value={loading ? '-' : stats.scheduledPosts.toString()}
                    icon={Calendar}
                    trend="Up Next: Today"
                    color="text-pink-400"
                    gradient="from-pink-400/20 to-transparent"
                    delay={0.2}
                />
                <StatsCard
                    label="Projected Reach"
                    value={loading ? '-' : stats.totalViews}
                    icon={BarChart3}
                    trend="Based on DNA"
                    color="text-emerald-400"
                    gradient="from-emerald-400/20 to-transparent"
                    delay={0.3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <motion.div variants={item} className="space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                            <span className="w-1 h-4 bg-accent rounded-full" /> Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ActionCard
                                title="Capture Idea"
                                desc="Voice or text input"
                                icon={Lightbulb}
                                href="/ideas"
                                color="bg-yellow-500"
                            />
                            <ActionCard
                                title="Writer AI"
                                desc="Draft high-impact scripts"
                                icon={FileText}
                                href="/scripts"
                                color="bg-blue-500"
                            />
                            <ActionCard
                                title="Analytics"
                                desc="Performance data"
                                icon={BarChart3}
                                href="/performance"
                                color="bg-emerald-500"
                            />
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div variants={item} className="p-1 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/5">
                        <div className="bg-surface/80 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/2">
                                <h2 className="text-sm font-bold text-text-primary">Live Activity Feed</h2>
                                <button className="text-xs text-accent hover:text-accent-hover transition-colors">View All</button>
                            </div>
                            <div className="divide-y divide-white/5">
                                {loading ? (
                                    <div className="p-8 flex justify-center text-text-muted text-sm">Loading feed...</div>
                                ) : recentActivity.length > 0 ? (
                                    recentActivity.map((act) => (
                                        <div key={act.id} className="p-4 flex items-center gap-4 hover:bg-white/2 transition-colors group">
                                            <div className={`p-2 rounded-lg ${act.type === 'idea' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                {act.type === 'idea' ? <Lightbulb size={16} /> : <FileText size={16} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/5 uppercase text-text-muted">{act.type}</span>
                                                    <span className="text-xs text-text-muted">{new Date(act.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm font-medium text-text-primary truncate mt-1 group-hover:text-accent transition-colors">{act.title}</p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight size={16} className="text-text-muted" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-text-muted text-sm">
                                        No recent activity. Start creating!
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Area - 1/3 width */}
                <div className="space-y-6">
                    <motion.div variants={item} className="p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-noise opacity-20"></div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-accent text-inverse flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
                                <Sparkles size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-text-primary mb-2">Pro Tips</h3>
                            <p className="text-sm text-text-muted mb-4">
                                "Consistency is the killer of doubt. Post even when you don't feel like it."
                            </p>
                            <button className="text-xs font-bold text-accent uppercase tracking-wider hover:underline">Read Guide &rarr;</button>
                        </div>
                    </motion.div>

                    {/* Mini Calendar Placeholder */}
                    <motion.div variants={item} className="p-6 rounded-2xl bg-surface border border-border">
                        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Calendar size={16} className="text-pink-500" /> Upcoming
                        </h3>
                        <div className="space-y-3">
                            {[1, 2].map((_, i) => (
                                <div key={i} className="flex gap-3 items-center opacity-50">
                                    <div className="w-10 flex flex-col items-center justify-center bg-surface-2 rounded-lg p-1">
                                        <span className="text-[10px] font-bold text-pink-500 uppercase">Feb</span>
                                        <span className="text-sm font-bold text-text-primary">{18 + i}</span>
                                    </div>
                                    <div>
                                        <div className="h-2 w-24 bg-surface-2 rounded mb-1"></div>
                                        <div className="h-2 w-16 bg-surface-2 rounded"></div>
                                    </div>
                                </div>
                            ))}
                            <div className="text-xs text-center text-text-muted pt-2">No scheduled posts</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

function StatsCard({ label, value, icon: Icon, trend, color, gradient, delay }: any) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 }
            }}
            className="group relative overflow-hidden rounded-2xl bg-surface border border-white/5 p-6 hover:border-white/10 transition-colors"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity blur-2xl rounded-full -mr-10 -mt-10`} />

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">{label}</p>
                    <h3 className="text-3xl font-bold text-text-primary tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-surface-2 border border-white/5 ${color} shadow-inner`}>
                    <Icon size={20} />
                </div>
            </div>

            <div className="relative z-10 mt-4 flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-surface-2 border border-white/5 ${color}`}>
                    {trend}
                </span>
            </div>
        </motion.div>
    )
}

function ActionCard({ title, desc, icon: Icon, href, color }: any) {
    return (
        <Link href={href}>
            <div className="group relative h-full p-5 rounded-2xl bg-surface border border-white/5 hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/5 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-text-primary group-hover:text-accent transition-colors flex items-center gap-2">
                            {title} <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-xs text-text-muted mt-1">{desc}</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}
