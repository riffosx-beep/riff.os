'use client'

import React, { useState } from 'react'
import {
    DollarSign,
    Sparkles,
    Loader2,
    Copy,
    Check,
    Target,
    FileText,
    MessageCircle,
    Phone,
    Mail,
    Zap,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Download,
} from 'lucide-react'

type MonetizeTab = 'ctas' | 'lead-magnet' | 'sales-script'

export default function MonetizePage() {
    const [activeTab, setActiveTab] = useState<MonetizeTab>('ctas')
    const [copied, setCopied] = useState('')

    // CTA state
    const [ctaOfferType, setCtaOfferType] = useState('1:1 coaching')
    const [ctaOfferPrice, setCtaOfferPrice] = useState('')
    const [ctaContext, setCtaContext] = useState('')
    const [ctaPlatform, setCtaPlatform] = useState('LinkedIn')
    const [ctaFunnelStage, setCtaFunnelStage] = useState('mixed')
    const [ctaLoading, setCtaLoading] = useState(false)
    const [ctaResult, setCtaResult] = useState<Record<string, any> | null>(null)

    // Lead Magnet state
    const [lmTopic, setLmTopic] = useState('')
    const [lmFormat, setLmFormat] = useState('pdf-checklist')
    const [lmAudience, setLmAudience] = useState('coaches and consultants')
    const [lmOfferTieIn, setLmOfferTieIn] = useState('')
    const [lmLoading, setLmLoading] = useState(false)
    const [lmResult, setLmResult] = useState<Record<string, any> | null>(null)

    // Sales Script state
    const [ssOfferName, setSsOfferName] = useState('')
    const [ssOfferPrice, setSsOfferPrice] = useState('$5,000')
    const [ssOfferDesc, setSsOfferDesc] = useState('')
    const [ssScriptType, setSsScriptType] = useState<'dm' | 'call' | 'email-sequence'>('dm')
    const [ssAudience, setSsAudience] = useState('coaches')
    const [ssLoading, setSsLoading] = useState(false)
    const [ssResult, setSsResult] = useState<Record<string, any> | null>(null)

    const copyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(''), 2000)
    }

    async function generateCTAs() {
        setCtaLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'cta-optimize',
                    offerType: ctaOfferType,
                    offerPrice: ctaOfferPrice,
                    context: ctaContext,
                    platform: ctaPlatform,
                    funnelStage: ctaFunnelStage,
                }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setCtaResult(data.ctas)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to generate CTAs')
        } finally {
            setCtaLoading(false)
        }
    }

    async function generateLeadMagnet() {
        if (!lmTopic.trim()) return
        setLmLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'lead-magnet',
                    topic: lmTopic,
                    format: lmFormat,
                    targetAudience: lmAudience,
                    offerTieIn: lmOfferTieIn,
                }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setLmResult(data.leadMagnet)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to generate lead magnet')
        } finally {
            setLmLoading(false)
        }
    }

    async function generateSalesScript() {
        if (!ssOfferName.trim()) return
        setSsLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'sales-script',
                    offerName: ssOfferName,
                    offerPrice: ssOfferPrice,
                    offerDescription: ssOfferDesc,
                    scriptType: ssScriptType,
                    targetAudience: ssAudience,
                }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setSsResult(data.salesScript)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to generate sales script')
        } finally {
            setSsLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-enter pb-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={20} className="text-green-500" />
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Monetize</h1>
                </div>
                <p className="text-sm text-text-muted">Turn content into revenue. CTAs, lead magnets, and sales scripts — all AI-powered.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
                {[
                    { id: 'ctas' as MonetizeTab, label: 'CTA Optimizer', icon: Target },
                    { id: 'lead-magnet' as MonetizeTab, label: 'Lead Magnets', icon: Download },
                    { id: 'sales-script' as MonetizeTab, label: 'Sales Scripts', icon: MessageCircle },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id ? 'border-green-500 text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══ CTA OPTIMIZER ═══ */}
            {activeTab === 'ctas' && (
                <div className="space-y-6">
                    <div className="card p-6">
                        <h2 className="text-h3 text-text-primary mb-4">Generate High-Converting CTAs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-caption mb-1 block">Offer Type</label>
                                <select value={ctaOfferType} onChange={e => setCtaOfferType(e.target.value)} className="input">
                                    <option>1:1 coaching</option>
                                    <option>Group coaching</option>
                                    <option>Mastermind</option>
                                    <option>Course</option>
                                    <option>Done-for-you service</option>
                                    <option>Consulting</option>
                                    <option>Community membership</option>
                                    <option>Workshop/Event</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-caption mb-1 block">Price Point</label>
                                <input type="text" value={ctaOfferPrice} onChange={e => setCtaOfferPrice(e.target.value)} className="input" placeholder="e.g., $5,000" />
                            </div>
                            <div>
                                <label className="text-caption mb-1 block">Platform</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['LinkedIn', 'Instagram', 'Twitter', 'YouTube', 'TikTok', 'Email'].map(p => (
                                        <button key={p} onClick={() => setCtaPlatform(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${ctaPlatform === p ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-surface-2 text-text-muted border border-border'}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-caption mb-1 block">Funnel Stage</label>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { id: 'cold', label: 'Cold' },
                                        { id: 'warm', label: 'Warm' },
                                        { id: 'hot', label: 'Hot' },
                                        { id: 'mixed', label: 'Mixed' },
                                    ].map(s => (
                                        <button key={s.id} onClick={() => setCtaFunnelStage(s.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${ctaFunnelStage === s.id ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-surface-2 text-text-muted border border-border'}`}>
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-caption mb-1 block">Additional Context (optional)</label>
                                <textarea value={ctaContext} onChange={e => setCtaContext(e.target.value)} rows={2} className="input resize-none" placeholder="Any additional context about your offer or audience..." />
                            </div>
                        </div>
                        <button onClick={generateCTAs} disabled={ctaLoading} className="btn-primary bg-green-600 hover:bg-green-700 mt-4">
                            {ctaLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {ctaLoading ? 'Generating CTAs...' : 'Generate 6 CTAs'}
                        </button>
                    </div>

                    {ctaResult && (
                        <div className="space-y-4">
                            {/* CTA cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries((ctaResult as Record<string, Record<string, any>>).ctas || ctaResult).filter(([key]) => !['dm_script', 'pro_tips'].includes(key)).map(([key, cta]) => {
                                    if (typeof cta !== 'object' || cta === null) return null
                                    const ctaObj = cta as Record<string, string>
                                    return (
                                        <div key={key} className="card p-5 hover:border-green-500/30 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-green-400">{key.replace(/_/g, ' ')}</span>
                                                <button onClick={() => copyText(ctaObj.cta, key)} className="btn-icon text-xs">
                                                    {copied === key ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                            <p className="text-body text-text-primary font-medium mb-2">&quot;{ctaObj.cta}&quot;</p>
                                            <p className="text-caption">{ctaObj.where_to_use}</p>
                                            {ctaObj.expected_response_rate && (
                                                <p className="text-caption mt-1">Expected: <span className="text-green-400">{ctaObj.expected_response_rate}</span></p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* DM Script */}
                            {(ctaResult as Record<string, any>).dm_script && (
                                <div className="card p-5">
                                    <h3 className="text-h3 text-text-primary mb-3 flex items-center gap-2"><MessageCircle size={16} className="text-blue-500" /> DM Follow-Up Script</h3>
                                    {Object.entries((ctaResult as Record<string, Record<string, string>>).dm_script).map(([key, val]) => (
                                        <div key={key} className="mb-3">
                                            <span className="text-caption capitalize">{key.replace(/_/g, ' ')}</span>
                                            <p className="text-body-sm mt-0.5">{val}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ═══ LEAD MAGNET GENERATOR ═══ */}
            {activeTab === 'lead-magnet' && (
                <div className="space-y-6">
                    <div className="card p-6">
                        <h2 className="text-h3 text-text-primary mb-4">Generate a Lead Magnet</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-caption mb-1 block">Topic / Theme</label>
                                <input type="text" value={lmTopic} onChange={e => setLmTopic(e.target.value)} className="input" placeholder="e.g., How to write hooks that go viral, Client onboarding checklist..." />
                            </div>
                            <div>
                                <label className="text-caption mb-1 block">Format</label>
                                <select value={lmFormat} onChange={e => setLmFormat(e.target.value)} className="input">
                                    <option value="pdf-checklist">PDF Checklist</option>
                                    <option value="mini-guide">Mini Guide (5-10 pages)</option>
                                    <option value="swipe-file">Swipe File / Templates</option>
                                    <option value="notion-template">Notion Template</option>
                                    <option value="cheat-sheet">Cheat Sheet (1 page)</option>
                                    <option value="worksheet">Interactive Worksheet</option>
                                    <option value="email-course">5-Day Email Course</option>
                                    <option value="video-training">Video Training Outline</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-caption mb-1 block">Target Audience</label>
                                <input type="text" value={lmAudience} onChange={e => setLmAudience(e.target.value)} className="input" placeholder="e.g., new coaches, B2B SaaS founders..." />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-caption mb-1 block">Paid Offer Tie-In (optional)</label>
                                <input type="text" value={lmOfferTieIn} onChange={e => setLmOfferTieIn(e.target.value)} className="input" placeholder="What paid offer should this lead into? e.g., My $5K coaching program..." />
                            </div>
                        </div>
                        <button onClick={generateLeadMagnet} disabled={lmLoading || !lmTopic.trim()} className="btn-primary bg-green-600 hover:bg-green-700 mt-4">
                            {lmLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            {lmLoading ? 'Generating...' : 'Generate Lead Magnet'}
                        </button>
                    </div>

                    {lmResult && (
                        <div className="space-y-4">
                            <div className="card p-6">
                                <h3 className="text-xl font-bold text-text-primary mb-1">{(lmResult as Record<string, string>).title}</h3>
                                <p className="text-body-sm text-text-secondary mb-3">{(lmResult as Record<string, string>).subtitle}</p>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">{(lmResult as Record<string, string>).format}</span>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-caption mb-2">Positioning Hook</h4>
                                    <p className="text-body text-text-primary bg-surface-2 p-3 rounded-lg border border-border">&quot;{(lmResult as Record<string, string>).hook}&quot;</p>
                                </div>

                                {(lmResult as Record<string, string>).landing_page_headline && (
                                    <div className="mb-4">
                                        <h4 className="text-caption mb-2">Landing Page Headline</h4>
                                        <p className="text-body text-text-primary bg-surface-2 p-3 rounded-lg border border-border">{(lmResult as Record<string, string>).landing_page_headline}</p>
                                    </div>
                                )}
                            </div>

                            {/* Sections */}
                            {Array.isArray((lmResult as Record<string, any[]>).sections) && (
                                <div className="card p-6">
                                    <h4 className="text-h3 text-text-primary mb-3">Content Outline</h4>
                                    <div className="space-y-4">
                                        {((lmResult as Record<string, Record<string, string>[]>).sections).map((section, i) => (
                                            <div key={i} className="pl-4 border-l-2 border-green-500/30">
                                                <h5 className="text-body font-medium text-text-primary">{section.title}</h5>
                                                <p className="text-body-sm text-text-muted mt-0.5">{section.content_outline}</p>
                                                {section.key_takeaway && <p className="text-caption mt-1 text-green-400">Key: {section.key_takeaway}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Delivery Sequence */}
                            {(lmResult as Record<string, any>).delivery_sequence && (
                                <div className="card p-6">
                                    <h4 className="text-h3 text-text-primary mb-3 flex items-center gap-2"><Mail size={16} className="text-blue-500" /> Email Delivery Sequence</h4>
                                    <div className="space-y-3">
                                        {Object.entries((lmResult as Record<string, Record<string, string>>).delivery_sequence).filter(([k]) => k.includes('subject')).map(([key, val]) => {
                                            const num = key.replace('email_', '').replace('_subject', '')
                                            const previewKey = `email_${num}_preview`
                                            return (
                                                <div key={key} className="p-3 bg-surface-2 rounded-lg border border-border">
                                                    <p className="text-caption mb-0.5">Email {num}</p>
                                                    <p className="text-body-sm font-medium text-text-primary">Subject: {val}</p>
                                                    <p className="text-body-sm text-text-muted mt-1">{(lmResult as Record<string, Record<string, string>>).delivery_sequence[previewKey]}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* CTA Examples */}
                            {Array.isArray((lmResult as Record<string, any[]>).cta_examples) && (
                                <div className="card p-6">
                                    <h4 className="text-h3 text-text-primary mb-3">CTA Variations for Promotion</h4>
                                    <div className="space-y-2">
                                        {((lmResult as Record<string, string[]>).cta_examples).map((cta, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg border border-border">
                                                <p className="text-body-sm text-text-primary flex-1">&quot;{cta}&quot;</p>
                                                <button onClick={() => copyText(cta, `lm-cta-${i}`)} className="btn-icon ml-2">
                                                    {copied === `lm-cta-${i}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ═══ SALES SCRIPT BUILDER ═══ */}
            {activeTab === 'sales-script' && (
                <div className="space-y-6">
                    <div className="card p-6">
                        <h2 className="text-h3 text-text-primary mb-4">Build a Sales Script</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-caption mb-1 block">Offer Name</label>
                                <input type="text" value={ssOfferName} onChange={e => setSsOfferName(e.target.value)} className="input" placeholder="e.g., Scale Your Coaching Business Mastermind" />
                            </div>
                            <div>
                                <label className="text-caption mb-1 block">Price</label>
                                <input type="text" value={ssOfferPrice} onChange={e => setSsOfferPrice(e.target.value)} className="input" placeholder="$5,000" />
                            </div>
                            <div>
                                <label className="text-caption mb-1 block">Target Audience</label>
                                <input type="text" value={ssAudience} onChange={e => setSsAudience(e.target.value)} className="input" placeholder="e.g., coaches at $5K-$10K/month" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-caption mb-1 block">Offer Description</label>
                                <textarea value={ssOfferDesc} onChange={e => setSsOfferDesc(e.target.value)} rows={3} className="input resize-none" placeholder="Describe what the offer includes, the transformation, and any unique differentiators..." />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-caption mb-1 block">Script Type</label>
                                <div className="flex gap-3">
                                    {[
                                        { id: 'dm' as const, label: 'DM Sequence', icon: MessageCircle },
                                        { id: 'call' as const, label: 'Sales Call Script', icon: Phone },
                                        { id: 'email-sequence' as const, label: 'Email Sequence', icon: Mail },
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSsScriptType(t.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${ssScriptType === t.id ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-surface-2 text-text-muted border border-border hover:border-border-light'}`}
                                        >
                                            <t.icon size={14} />
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={generateSalesScript} disabled={ssLoading || !ssOfferName.trim()} className="btn-primary bg-green-600 hover:bg-green-700 mt-4">
                            {ssLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                            {ssLoading ? 'Writing Script...' : `Generate ${ssScriptType === 'dm' ? 'DM' : ssScriptType === 'call' ? 'Call' : 'Email'} Script`}
                        </button>
                    </div>

                    {ssResult && (
                        <div className="space-y-4">
                            {/* DM Sequence */}
                            {ssScriptType === 'dm' && Array.isArray((ssResult as Record<string, any[]>).dm_sequence) && (
                                <div className="card p-6">
                                    <h3 className="text-h3 text-text-primary mb-4 flex items-center gap-2"><MessageCircle size={16} className="text-green-500" /> DM Sequence</h3>
                                    <div className="space-y-4">
                                        {((ssResult as Record<string, Record<string, string>[]>).dm_sequence).map((msg, i) => (
                                            <div key={i} className="p-4 bg-surface-2 rounded-lg border border-border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-caption">Message {msg.message_number || i + 1} — {msg.timing}</span>
                                                    <button onClick={() => copyText(msg.message, `dm-${i}`)} className="btn-icon text-xs">
                                                        {copied === `dm-${i}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <div className="bg-surface rounded-xl rounded-tl-md p-3 border border-border mb-2">
                                                    <p className="text-body-sm text-text-primary whitespace-pre-wrap">{msg.message}</p>
                                                </div>
                                                <p className="text-caption text-green-400">Goal: {msg.goal}</p>
                                                {msg.if_they_respond && <p className="text-caption mt-1">↳ If positive: {msg.if_they_respond}</p>}
                                                {msg.if_no_response && <p className="text-caption mt-1">↳ No response: {msg.if_no_response}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Call Script */}
                            {ssScriptType === 'call' && (ssResult as Record<string, any>).call_script && (
                                <div className="card p-6">
                                    <h3 className="text-h3 text-text-primary mb-4 flex items-center gap-2"><Phone size={16} className="text-green-500" /> Sales Call Script</h3>
                                    <div className="space-y-4">
                                        {Object.entries((ssResult as Record<string, Record<string, any>>).call_script).map(([key, val]) => {
                                            if (key === 'objection_handling' && typeof val === 'object') {
                                                return (
                                                    <div key={key} className="p-4 bg-surface-2 rounded-lg border border-border">
                                                        <h4 className="text-body font-medium text-text-primary mb-3 uppercase text-xs tracking-wider">Objection Handling</h4>
                                                        <div className="space-y-3">
                                                            {Object.entries(val as Record<string, string>).map(([obj, response]) => (
                                                                <div key={obj}>
                                                                    <span className="text-caption text-red-400">&quot;{obj.replace(/_/g, ' ')}&quot;</span>
                                                                    <p className="text-body-sm text-text-primary mt-0.5">{response}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            return (
                                                <div key={key} className="p-4 bg-surface-2 rounded-lg border border-border">
                                                    <h4 className="text-caption uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</h4>
                                                    <p className="text-body-sm text-text-primary whitespace-pre-wrap">{val as string}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Email Sequence */}
                            {ssScriptType === 'email-sequence' && Array.isArray((ssResult as Record<string, any[]>).email_sequence) && (
                                <div className="card p-6">
                                    <h3 className="text-h3 text-text-primary mb-4 flex items-center gap-2"><Mail size={16} className="text-green-500" /> Email Sequence</h3>
                                    <div className="space-y-4">
                                        {((ssResult as Record<string, Record<string, string>[]>).email_sequence).map((email, i) => (
                                            <div key={i} className="p-4 bg-surface-2 rounded-lg border border-border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-caption">Email {email.email_number || i + 1} — {email.send_day}</span>
                                                    <button onClick={() => copyText(`Subject: ${email.subject}\n\n${email.body}${email.ps_line ? `\n\nP.S. ${email.ps_line}` : ''}`, `email-${i}`)} className="btn-icon text-xs">
                                                        {copied === `email-${i}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <p className="text-body font-medium text-text-primary mb-2">Subject: {email.subject}</p>
                                                <p className="text-body-sm whitespace-pre-wrap">{email.body}</p>
                                                {email.ps_line && <p className="text-body-sm mt-3 text-text-secondary italic">P.S. {email.ps_line}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
