'use client'

import React, { useState } from 'react'
import {
    Zap,
    Sparkles,
    Loader2,
    Copy,
    Check,
    ArrowRight,
    TrendingUp,
    AlertTriangle,
    Target,
    Eye,
    MessageCircle,
    Shield,
    Brain,
} from 'lucide-react'

interface HookRewrite {
    style: string
    hook: string
    explanation: string
    predicted_score: number
}

interface HookAnalysis {
    original: string
    overall_score: number
    analysis: {
        curiosity: { score: number; feedback: string }
        specificity: { score: number; feedback: string }
        emotional_trigger: { score: number; primary_emotion: string; feedback: string }
        pattern_interrupt: { score: number; feedback: string }
        authority_signal: { score: number; feedback: string }
    }
    rewrites: HookRewrite[]
    overall_feedback: string
    best_rewrite: number
    best_rewrite_reason: string
}

export default function HooksPage() {
    const [hook, setHook] = useState('')
    const [platform, setPlatform] = useState('any')
    const [niche, setNiche] = useState('coaching/consulting')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<HookAnalysis | null>(null)
    const [copied, setCopied] = useState('')
    const [history, setHistory] = useState<HookAnalysis[]>([])

    const copyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(''), 2000)
    }

    async function analyzeHook() {
        if (!hook.trim()) return
        setLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'hook-optimize', hook, platform, niche }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            const analysis = data.hookAnalysis
            setResult(analysis)
            setHistory(prev => [analysis, ...prev.slice(0, 9)])
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to analyze')
        } finally {
            setLoading(false)
        }
    }

    const scoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400'
        if (score >= 60) return 'text-amber-400'
        return 'text-red-400'
    }

    const scoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-500/10 border-green-500/20'
        if (score >= 60) return 'bg-amber-500/10 border-amber-500/20'
        return 'bg-red-500/10 border-red-500/20'
    }

    return (
        <div className="space-y-6 animate-enter pb-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Zap size={20} className="text-amber-500" />
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Hook Optimizer</h1>
                </div>
                <p className="text-sm text-text-muted">Score your hooks across 5 dimensions. Get 5 named rewrites with predicted performance.</p>
            </div>

            {/* Input */}
            <div className="card p-6 space-y-4">
                <div>
                    <label className="text-caption mb-1 block">Your Hook</label>
                    <textarea
                        value={hook}
                        onChange={e => setHook(e.target.value)}
                        rows={3}
                        className="input resize-none text-lg"
                        placeholder="Type or paste your hook here..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-caption mb-1 block">Platform</label>
                        <div className="flex gap-2 flex-wrap">
                            {['any', 'LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'TikTok'].map(p => (
                                <button key={p} onClick={() => setPlatform(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${platform === p ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-surface-2 text-text-muted border border-border'}`}>
                                    {p === 'any' ? 'Any Platform' : p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-caption mb-1 block">Niche</label>
                        <select value={niche} onChange={e => setNiche(e.target.value)} className="input">
                            <option value="coaching/consulting">Coaching / Consulting</option>
                            <option value="SaaS">SaaS / Tech</option>
                            <option value="e-commerce">E-commerce</option>
                            <option value="personal brand">Personal Brand</option>
                            <option value="agency">Agency</option>
                            <option value="real estate">Real Estate</option>
                            <option value="fitness">Fitness / Health</option>
                            <option value="finance">Finance / Investing</option>
                        </select>
                    </div>
                </div>

                <button onClick={analyzeHook} disabled={loading || !hook.trim()} className="btn-primary bg-amber-600 hover:bg-amber-700">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    {loading ? 'Analyzing Hook...' : 'Analyze & Rewrite'}
                </button>
            </div>

            {result && (
                <div className="space-y-4">
                    {/* Overall Score */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-h3 text-text-primary">Score Breakdown</h3>
                            <div className={`text-3xl font-black ${scoreColor(result.overall_score)}`}>
                                {result.overall_score}<span className="text-lg text-text-muted">/100</span>
                            </div>
                        </div>

                        {/* 5 Dimension Scores */}
                        <div className="space-y-4">
                            {result.analysis && Object.entries(result.analysis).map(([key, dim]) => (
                                <div key={key}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-body-sm font-medium text-text-primary capitalize flex items-center gap-1.5">
                                            {key === 'curiosity' && <Eye size={12} className="text-purple-400" />}
                                            {key === 'specificity' && <Target size={12} className="text-blue-400" />}
                                            {key === 'emotional_trigger' && <Brain size={12} className="text-red-400" />}
                                            {key === 'pattern_interrupt' && <AlertTriangle size={12} className="text-amber-400" />}
                                            {key === 'authority_signal' && <Shield size={12} className="text-green-400" />}
                                            {key.replace(/_/g, ' ')}
                                            {key === 'emotional_trigger' && 'primary_emotion' in dim && dim.primary_emotion && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 ml-1">
                                                    {dim.primary_emotion}
                                                </span>
                                            )}
                                        </span>
                                        <span className={`text-sm font-bold ${scoreColor(dim.score * 10)}`}>{dim.score}/10</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden mb-1">
                                        <div className={`h-full rounded-full transition-all duration-500 ${dim.score >= 8 ? 'bg-green-500' : dim.score >= 6 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${dim.score * 10}%` }} />
                                    </div>
                                    <p className="text-caption">{dim.feedback}</p>
                                </div>
                            ))}
                        </div>

                        {/* Overall Feedback */}
                        {result.overall_feedback && (
                            <div className="mt-5 p-4 bg-surface-2 rounded-lg border border-border">
                                <p className="text-body leading-relaxed">{result.overall_feedback}</p>
                            </div>
                        )}
                    </div>

                    {/* 5 Rewrites */}
                    <div className="card p-6">
                        <h3 className="text-h3 text-text-primary mb-4">5 Rewrite Styles</h3>
                        <div className="space-y-3">
                            {result.rewrites?.map((rw, i) => (
                                <div key={i} className={`p-4 rounded-lg border transition-colors ${i === result.best_rewrite ? 'bg-green-500/5 border-green-500/30' : 'bg-surface-2 border-border'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">{rw.style}</span>
                                            {i === result.best_rewrite && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">★ Best</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${scoreColor(rw.predicted_score)}`}>{rw.predicted_score}/100</span>
                                            <button onClick={() => copyText(rw.hook, `rw-${i}`)} className="btn-icon text-xs">
                                                {copied === `rw-${i}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-body font-medium text-text-primary mb-1.5">&quot;{rw.hook}&quot;</p>
                                    <p className="text-caption">{rw.explanation}</p>
                                </div>
                            ))}
                        </div>

                        {result.best_rewrite_reason && (
                            <div className="mt-4 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                                <p className="text-body-sm text-green-400">
                                    <TrendingUp size={12} className="inline mr-1" />
                                    {result.best_rewrite_reason}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Quick Reuse */}
                    <div className="card p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-caption">Want to refine further?</span>
                            <div className="flex gap-2">
                                {result.rewrites?.slice(0, 3).map((rw, i) => (
                                    <button key={i} onClick={() => { setHook(rw.hook); setResult(null) }} className="text-xs px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-text-muted hover:text-text-secondary hover:border-border-light transition-colors">
                                        Use &quot;{rw.style}&quot; <ArrowRight size={10} className="inline ml-0.5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History */}
            {history.length > 1 && (
                <div>
                    <h3 className="text-caption mb-2">Recent Analyses</h3>
                    <div className="space-y-2">
                        {history.slice(1).map((h, i) => (
                            <button key={i} onClick={() => setResult(h)} className="w-full text-left p-3 card hover:border-amber-500/20 transition-colors">
                                <div className="flex items-center justify-between">
                                    <p className="text-body-sm text-text-primary truncate pr-4">&quot;{h.original}&quot;</p>
                                    <span className={`text-xs font-bold ${scoreColor(h.overall_score)}`}>{h.overall_score}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
