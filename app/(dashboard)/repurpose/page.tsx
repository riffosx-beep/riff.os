'use client'

import React, { useState } from 'react'
import {
    Layers,
    Sparkles,
    Loader2,
    Copy,
    Check,
    ArrowRight,
    Linkedin,
    Twitter,
    Instagram,
    Mail,
    FileText,
    Youtube,
    Link as LinkIcon,
    Download,
    MessageCircle,
    Image,
} from 'lucide-react'

type RepurposeFormat = 'linkedin-post' | 'twitter-thread' | 'instagram-carousel' | 'email-newsletter' | 'youtube-script' | 'tiktok-script' | 'blog-post' | 'lead-magnet-outline' | 'dm-outreach' | 'quote-graphics'

export default function RepurposePage() {
    const [originalContent, setOriginalContent] = useState('')
    const [originalPlatform, setOriginalPlatform] = useState('YouTube')
    const [selectedFormats, setSelectedFormats] = useState<RepurposeFormat[]>(['linkedin-post', 'twitter-thread'])
    const [tone, setTone] = useState('maintain')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<Record<string, Record<string, string | string[]>> | null>(null)
    const [copied, setCopied] = useState('')

    const formats: { id: RepurposeFormat; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
        { id: 'linkedin-post', label: 'LinkedIn Post', icon: Linkedin },
        { id: 'twitter-thread', label: 'Twitter Thread', icon: Twitter },
        { id: 'instagram-carousel', label: 'IG Carousel', icon: Instagram },
        { id: 'email-newsletter', label: 'Email Newsletter', icon: Mail },
        { id: 'youtube-script', label: 'YouTube Script', icon: Youtube },
        { id: 'tiktok-script', label: 'TikTok Script', icon: FileText },
        { id: 'blog-post', label: 'Blog Post', icon: FileText },
        { id: 'lead-magnet-outline', label: 'Lead Magnet', icon: Download },
        { id: 'dm-outreach', label: 'DM Outreach', icon: MessageCircle },
        { id: 'quote-graphics', label: 'Quote Graphics', icon: Image },
    ]

    const toggleFormat = (id: RepurposeFormat) => {
        setSelectedFormats(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
    }

    const copyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(''), 2000)
    }

    async function repurpose() {
        if (!originalContent.trim() || selectedFormats.length === 0) return
        setLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'repurpose',
                    content: originalContent,
                    sourcePlatform: originalPlatform,
                    targetFormats: selectedFormats,
                    tone,
                }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setResults(data.repurposed)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to repurpose')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-enter pb-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Layers size={20} className="text-violet-500" />
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Repurpose</h1>
                </div>
                <p className="text-sm text-text-muted">Turn one piece of content into 10+ formats — LinkedIn, Twitter, carousel, email, DM, lead magnet, and more.</p>
            </div>

            {/* Input */}
            <div className="card p-6 space-y-5">
                <div>
                    <label className="text-caption mb-1 block">Original Content</label>
                    <textarea
                        value={originalContent}
                        onChange={e => setOriginalContent(e.target.value)}
                        rows={6}
                        className="input resize-none"
                        placeholder="Paste your original content here — a video transcript, blog post, podcast notes, or any piece of content..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-caption mb-1 block">Source Platform</label>
                        <select value={originalPlatform} onChange={e => setOriginalPlatform(e.target.value)} className="input">
                            {['YouTube', 'Blog', 'Podcast', 'LinkedIn', 'Twitter', 'Instagram', 'Newsletter', 'Other'].map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-caption mb-1 block">Output Tone</label>
                        <select value={tone} onChange={e => setTone(e.target.value)} className="input">
                            <option value="maintain">Maintain Original Tone</option>
                            <option value="casual">More Casual</option>
                            <option value="professional">More Professional</option>
                            <option value="provocative">More Provocative</option>
                            <option value="educational">More Educational</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-caption mb-2 block">Target Formats (select multiple)</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {formats.map(f => (
                            <button
                                key={f.id}
                                onClick={() => toggleFormat(f.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${selectedFormats.includes(f.id) ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-surface-2 text-text-muted border border-border hover:border-border-light'}`}
                            >
                                <f.icon size={12} />
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-caption mt-1">{selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''} selected</p>
                </div>

                <button onClick={repurpose} disabled={loading || !originalContent.trim() || selectedFormats.length === 0} className="btn-primary bg-violet-600 hover:bg-violet-700">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {loading ? 'Repurposing...' : `Repurpose Into ${selectedFormats.length} Format${selectedFormats.length !== 1 ? 's' : ''}`}
                </button>
            </div>

            {/* Results */}
            {results && (
                <div className="space-y-4">
                    {Object.entries(results).map(([key, val]) => {
                        const formatInfo = formats.find(f => f.id === key)
                        const content = typeof val === 'string' ? val : val?.content || val?.body || val?.script || ''
                        const contentStr = Array.isArray(content) ? content.join('\n\n') : String(content)

                        return (
                            <div key={key} className="card p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-h3 text-text-primary flex items-center gap-2">
                                        {formatInfo && <formatInfo.icon size={16} className="text-violet-400" />}
                                        {formatInfo?.label || key.replace(/-/g, ' ').replace(/_/g, ' ')}
                                    </h3>
                                    <button onClick={() => copyText(contentStr, `rep-${key}`)} className="btn-secondary text-xs">
                                        {copied === `rep-${key}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                        Copy
                                    </button>
                                </div>

                                {/* Thread format */}
                                {(key.includes('thread') || key.includes('carousel')) && Array.isArray(content) ? (
                                    <div className="space-y-3">
                                        {content.map((item: string, i: number) => (
                                            <div key={i} className="p-3 bg-surface-2 rounded-lg border border-border">
                                                <span className="text-[10px] text-text-muted mb-1 block">
                                                    {key.includes('thread') ? `Tweet ${i + 1}` : `Slide ${i + 1}`}
                                                </span>
                                                <p className="text-body-sm text-text-primary whitespace-pre-wrap">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : typeof val === 'object' && val !== null ? (
                                    <div className="space-y-3">
                                        {Object.entries(val).map(([subKey, subVal]) => (
                                            <div key={subKey}>
                                                <span className="text-caption capitalize">{subKey.replace(/_/g, ' ')}</span>
                                                <p className="text-body-sm text-text-primary whitespace-pre-wrap mt-0.5">{String(subVal)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-surface-2 p-4 rounded-lg border border-border">
                                        <p className="text-body-sm text-text-primary whitespace-pre-wrap leading-relaxed">{contentStr}</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
