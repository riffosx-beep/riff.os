'use client'

import React, { useState } from 'react'
import {
    Layers,
    Sparkles,
    Loader2,
    Copy,
    Check,
    ArrowRight,
    Calendar,
    GripVertical,
    ChevronDown,
    ChevronUp,
    Zap,
    Target,
    Clock,
    LinkIcon,
} from 'lucide-react'

interface SeriesPost {
    day: number
    type: string
    title: string
    hook: string
    body: string
    cta: string
    platform: string
    content_pillar?: string
    cross_promo?: string
    hashtags?: string[]
}

export default function SeriesPage() {
    const [topic, setTopic] = useState('')
    const [platform, setPlatform] = useState('LinkedIn')
    const [days, setDays] = useState(7)
    const [goal, setGoal] = useState('Build authority')
    const [tone, setTone] = useState('professional')
    const [offerTieIn, setOfferTieIn] = useState('')
    const [contentPillars, setContentPillars] = useState('')
    const [enableCrossPromo, setEnableCrossPromo] = useState(true)
    const [showAdvanced, setShowAdvanced] = useState(false)

    const [loading, setLoading] = useState(false)
    const [series, setSeries] = useState<SeriesPost[]>([])
    const [seriesTitle, setSeriesTitle] = useState('')
    const [expandedPost, setExpandedPost] = useState<number | null>(null)
    const [copied, setCopied] = useState('')

    const copyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(''), 2000)
    }

    async function generateSeries() {
        if (!topic.trim()) return
        setLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'series',
                    topic,
                    platform,
                    days,
                    goal,
                    tone,
                    offerTieIn,
                    includeHashtags: true,
                    contentPillars: contentPillars.split(',').map(p => p.trim()).filter(Boolean),
                    crossPromo: enableCrossPromo,
                }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setSeries(data.posts || data.series?.posts || [])
            setSeriesTitle(data.series_title || data.series?.series_title || topic)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to generate')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-enter pb-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Layers size={20} className="text-cyan-500" />
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Series Builder</h1>
                </div>
                <p className="text-sm text-text-muted">Create multi-day content series with cross-promo, varied formats, and strategic CTAs.</p>
            </div>

            {/* Controls */}
            <div className="card p-6 space-y-5">
                <div>
                    <label className="text-caption mb-1 block">Series Topic</label>
                    <textarea
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        rows={2}
                        className="input resize-none"
                        placeholder="e.g., '7 Days of Scaling Your Coaching Business' or 'The Content Formula That Built My Audience to 50K'"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-caption mb-1 block">Platform</label>
                        <select value={platform} onChange={e => setPlatform(e.target.value)} className="input">
                            {['LinkedIn', 'Twitter/X', 'Instagram', 'TikTok', 'YouTube'].map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-caption mb-1 block">Duration</label>
                        <div className="flex gap-2">
                            {[3, 5, 7, 14, 30].map(d => (
                                <button key={d} onClick={() => setDays(d)} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium ${days === d ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-surface-2 text-text-muted border border-border'}`}>
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-caption mb-1 block">Goal</label>
                        <select value={goal} onChange={e => setGoal(e.target.value)} className="input">
                            <option>Build authority</option>
                            <option>Generate leads</option>
                            <option>Launch offer</option>
                            <option>Grow audience</option>
                            <option>Drive DMs</option>
                            <option>Educate audience</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-caption mb-1 block">Tone</label>
                        <div className="flex gap-2 flex-wrap">
                            {['professional', 'casual', 'provocative', 'storytelling', 'educational'].map(t => (
                                <button key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${tone === t ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-surface-2 text-text-muted border border-border'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setEnableCrossPromo(!enableCrossPromo)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${enableCrossPromo ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-surface-2 text-text-muted border border-border'}`}>
                            <LinkIcon size={12} />
                            Cross-Platform Promo
                        </button>
                    </div>
                </div>

                {/* Advanced */}
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary">
                    {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    Advanced Options
                </button>

                {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-l-2 border-cyan-500/20 pl-4">
                        <div>
                            <label className="text-caption mb-1 block">Offer Tie-In</label>
                            <input type="text" value={offerTieIn} onChange={e => setOfferTieIn(e.target.value)} className="input" placeholder="What paid offer should this lead into?" />
                        </div>
                        <div>
                            <label className="text-caption mb-1 block">Content Pillars (comma-separated)</label>
                            <input type="text" value={contentPillars} onChange={e => setContentPillars(e.target.value)} className="input" placeholder="mindset, systems, hiring, pricing" />
                        </div>
                    </div>
                )}

                <button onClick={generateSeries} disabled={loading || !topic.trim()} className="btn-primary bg-cyan-600 hover:bg-cyan-700">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {loading ? 'Building Series...' : `Generate ${days}-Day Series`}
                </button>
            </div>

            {/* Results */}
            {series.length > 0 && (
                <div className="space-y-4">
                    <div className="card p-5">
                        <h2 className="text-h3 text-text-primary">{seriesTitle}</h2>
                        <p className="text-caption mt-1">{series.length} posts · {platform} · {goal}</p>
                    </div>

                    <div className="space-y-2">
                        {series.map((post, i) => (
                            <div key={i} className="card overflow-hidden">
                                {/* Header - always visible */}
                                <button
                                    onClick={() => setExpandedPost(expandedPost === i ? null : i)}
                                    className="w-full text-left p-4 flex items-center justify-between hover:bg-surface-hover transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm font-bold">{post.day}</span>
                                        <div>
                                            <h4 className="text-body font-medium text-text-primary">{post.title}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">{post.type}</span>
                                                {post.content_pillar && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{post.content_pillar}</span>}
                                                {post.platform && <span className="text-[10px] text-text-muted">{post.platform}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); copyText(`${post.hook}\n\n${post.body}\n\n${post.cta}`, `post-${i}`) }} className="btn-icon text-xs">
                                            {copied === `post-${i}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                        </button>
                                        {expandedPost === i ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
                                    </div>
                                </button>

                                {/* Expanded content */}
                                {expandedPost === i && (
                                    <div className="border-t border-border p-5 space-y-4">
                                        <div>
                                            <span className="text-caption text-amber-400">Hook</span>
                                            <p className="text-body font-medium text-text-primary mt-0.5">&quot;{post.hook}&quot;</p>
                                        </div>
                                        <div>
                                            <span className="text-caption">Body</span>
                                            <p className="text-body-sm text-text-secondary whitespace-pre-wrap mt-0.5">{post.body}</p>
                                        </div>
                                        <div>
                                            <span className="text-caption text-green-400">CTA</span>
                                            <p className="text-body-sm text-text-primary mt-0.5">{post.cta}</p>
                                        </div>
                                        {post.cross_promo && (
                                            <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                                                <span className="text-caption text-cyan-400 flex items-center gap-1"><LinkIcon size={10} /> Cross-Promo</span>
                                                <p className="text-body-sm text-text-secondary mt-0.5">{post.cross_promo}</p>
                                            </div>
                                        )}
                                        {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                                            <div className="flex gap-1.5 flex-wrap">
                                                {post.hashtags.map((h, j) => (
                                                    <span key={j} className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">#{h.replace('#', '')}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Copy All */}
                    <button onClick={() => {
                        const all = series.map(p => `DAY ${p.day}: ${p.title}\n\nHook: ${p.hook}\n\n${p.body}\n\nCTA: ${p.cta}`).join('\n\n---\n\n')
                        copyText(all, 'all-series')
                    }} className="btn-secondary w-full">
                        {copied === 'all-series' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        Copy Entire Series
                    </button>
                </div>
            )}
        </div>
    )
}
