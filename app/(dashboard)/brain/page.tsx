'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Brain,
    Sparkles,
    Loader2,
    Plus,
    X,
    Check,
    Upload,
    RefreshCw,
    Mic,
    FileText,
    Zap,
    MessageCircle,
    Target,
    Shield,
    TrendingUp,
} from 'lucide-react'

interface VoiceDNA {
    tone: {
        primary: string
        secondary: string
        emotional_range: string
        formality_score: number
        humor_style: string
        description: string
    }
    sentence_structure: {
        avg_length: string
        patterns: string[]
        opening_style: string
        closing_style: string
    }
    vocabulary: {
        sophistication: string
        power_words: string[]
        avoided_words: string[]
        jargon_level: string
        signature_phrases: string[]
    }
    content_patterns: {
        favorite_formats: string[]
        hook_style: string
        cta_style: string
        storytelling_tendency: string
        data_usage: string
    }
    personality_markers: {
        confidence_level: string
        vulnerability: string
        teaching_style: string
        contrarian_tendency: string
    }
}

export default function BrainPage() {
    const [samples, setSamples] = useState<string[]>([''])
    const [loading, setLoading] = useState(false)
    const [voiceProfile, setVoiceProfile] = useState<{ voice_dna: VoiceDNA; summary: string } | null>(null)
    const [existingProfile, setExistingProfile] = useState<{ voice_dna: VoiceDNA; summary: string; sample_count: number; updated_at: string } | null>(null)
    const [activeTab, setActiveTab] = useState<'train' | 'profile' | 'autopsy'>('train')

    // Content Autopsy state
    const [autopsyContent, setAutopsyContent] = useState('')
    const [autopsyPlatform, setAutopsyPlatform] = useState('LinkedIn')
    const [autopsyLoading, setAutopsyLoading] = useState(false)
    const [autopsyResult, setAutopsyResult] = useState<{
        verdict?: string
        hook_analysis?: { technique: string; effectiveness: number; breakdown: string }
        emotional_triggers?: { primary: string; secondary: string; intensity: string }
        cta_analysis?: { type: string; effectiveness: number; improvement: string }
        narrative_structure?: { type: string; pacing: string; turning_point: string }
        what_to_steal?: string[]
    } | null>(null)

    useEffect(() => {
        fetchExistingProfile()
    }, [])

    async function fetchExistingProfile() {
        const supabase = createClient()
        const { data } = await supabase
            .from('voice_profiles')
            .select('*')
            .single()
        if (data) {
            setExistingProfile(data)
            setActiveTab('profile')
        }
    }

    const addSample = () => setSamples([...samples, ''])
    const removeSample = (i: number) => setSamples(samples.filter((_, idx) => idx !== i))
    const updateSample = (i: number, val: string) => {
        const updated = [...samples]
        updated[i] = val
        setSamples(updated)
    }

    async function trainVoice() {
        const validSamples = samples.filter(s => s.trim().length > 20)
        if (validSamples.length < 3) return alert('Please add at least 3 content samples (20+ characters each)')

        setLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'voice-train', samples: validSamples }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setVoiceProfile(data.voiceProfile)
            setExistingProfile({ ...data.voiceProfile, sample_count: validSamples.length, updated_at: new Date().toISOString() })
            setActiveTab('profile')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to train voice')
        } finally {
            setLoading(false)
        }
    }

    async function runAutopsy() {
        if (!autopsyContent.trim()) return
        setAutopsyLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'content-autopsy', content: autopsyContent, platform: autopsyPlatform }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setAutopsyResult(data.autopsy)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to analyze')
        } finally {
            setAutopsyLoading(false)
        }
    }

    const profile = voiceProfile?.voice_dna || existingProfile?.voice_dna

    return (
        <div className="space-y-6 animate-enter pb-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Brain size={20} className="text-purple-500" />
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">AI Brain</h1>
                </div>
                <p className="text-sm text-text-muted">Train your AI to write in your voice. Analyze viral content. Build your content intelligence.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
                {[
                    { id: 'train', label: 'Voice Training', icon: Mic },
                    { id: 'profile', label: 'Voice DNA', icon: Zap },
                    { id: 'autopsy', label: 'Content Autopsy', icon: Target },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'train' | 'profile' | 'autopsy')}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id ? 'border-purple-500 text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══ VOICE TRAINING TAB ═══ */}
            {activeTab === 'train' && (
                <div className="space-y-6">
                    <div className="card p-6">
                        <h2 className="text-h3 text-text-primary mb-1">Upload Your Content Samples</h2>
                        <p className="text-body-sm mb-6">Paste 5-20 of your best posts, scripts, or captions. The more samples, the more accurate your Voice DNA profile.</p>

                        <div className="space-y-4">
                            {samples.map((sample, i) => (
                                <div key={i} className="relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-caption">Sample {i + 1}</label>
                                        {samples.length > 1 && (
                                            <button onClick={() => removeSample(i)} className="text-text-muted hover:text-danger text-xs">
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        value={sample}
                                        onChange={e => updateSample(i, e.target.value)}
                                        rows={4}
                                        className="input resize-none"
                                        placeholder="Paste one of your best posts, scripts, or captions here..."
                                    />
                                    <span className="text-[10px] text-text-muted absolute bottom-2 right-2">{sample.length} chars</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <button onClick={addSample} className="btn-secondary">
                                <Plus size={14} /> Add Sample
                            </button>
                            <button
                                onClick={trainVoice}
                                disabled={loading || samples.filter(s => s.trim().length > 20).length < 3}
                                className="btn-primary bg-purple-600 hover:bg-purple-700"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {loading ? 'Analyzing Voice...' : 'Train Voice DNA'}
                            </button>
                        </div>

                        <p className="text-caption mt-3">
                            {samples.filter(s => s.trim().length > 20).length} / {samples.length} samples valid (min 3 required, 10+ recommended)
                        </p>
                    </div>

                    {existingProfile && (
                        <div className="card p-4 bg-success-bg border-green-500/20">
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-green-500" />
                                <span className="text-sm text-text-primary font-medium">Voice profile active</span>
                            </div>
                            <p className="text-caption mt-1">
                                Trained on {existingProfile.sample_count} samples. Last updated {new Date(existingProfile.updated_at).toLocaleDateString()}.
                                All AI output is now personalized to your voice.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ VOICE DNA PROFILE TAB ═══ */}
            {activeTab === 'profile' && profile && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="card p-6">
                        <h2 className="text-h3 text-text-primary mb-2">Your Voice Summary</h2>
                        <p className="text-body leading-relaxed">{voiceProfile?.summary || existingProfile?.summary || (existingProfile?.voice_dna as unknown as Record<string, string>)?.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tone */}
                        <div className="card p-5">
                            <h3 className="text-h3 text-text-primary mb-3 flex items-center gap-2"><MessageCircle size={16} className="text-purple-500" /> Tone</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span className="text-caption">Primary</span><span className="text-body-sm font-medium text-text-primary">{profile.tone?.primary}</span></div>
                                <div className="flex justify-between"><span className="text-caption">Secondary</span><span className="text-body-sm text-text-secondary">{profile.tone?.secondary}</span></div>
                                <div className="flex justify-between"><span className="text-caption">Emotional Range</span><span className="text-body-sm text-text-secondary">{profile.tone?.emotional_range}</span></div>
                                <div className="flex justify-between"><span className="text-caption">Formality</span><span className="text-body-sm text-text-secondary">{profile.tone?.formality_score}/10</span></div>
                                <div className="flex justify-between"><span className="text-caption">Humor</span><span className="text-body-sm text-text-secondary">{profile.tone?.humor_style}</span></div>
                            </div>
                        </div>

                        {/* Sentence Structure */}
                        <div className="card p-5">
                            <h3 className="text-h3 text-text-primary mb-3 flex items-center gap-2"><FileText size={16} className="text-blue-500" /> Structure</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span className="text-caption">Avg Length</span><span className="text-body-sm text-text-secondary">{profile.sentence_structure?.avg_length}</span></div>
                                <div className="flex justify-between"><span className="text-caption">Opens With</span><span className="text-body-sm text-text-secondary">{profile.sentence_structure?.opening_style}</span></div>
                                <div className="flex justify-between"><span className="text-caption">Closes With</span><span className="text-body-sm text-text-secondary">{profile.sentence_structure?.closing_style}</span></div>
                                <div className="mt-2">
                                    <span className="text-caption">Patterns</span>
                                    <ul className="mt-1 space-y-1">
                                        {profile.sentence_structure?.patterns?.map((p: string, i: number) => (
                                            <li key={i} className="text-[12px] text-text-muted pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-border">{p}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Vocabulary */}
                        <div className="card p-5">
                            <h3 className="text-h3 text-text-primary mb-3 flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Vocabulary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span className="text-caption">Level</span><span className="text-body-sm text-text-secondary">{profile.vocabulary?.sophistication}</span></div>
                                <div className="flex justify-between"><span className="text-caption">Jargon</span><span className="text-body-sm text-text-secondary">{profile.vocabulary?.jargon_level}</span></div>
                                <div className="mt-2">
                                    <span className="text-caption">Power Words</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {profile.vocabulary?.power_words?.map((w: string, i: number) => (
                                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{w}</span>
                                        ))}
                                    </div>
                                </div>
                                {profile.vocabulary?.signature_phrases?.length > 0 && (
                                    <div className="mt-2">
                                        <span className="text-caption">Signature Phrases</span>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {profile.vocabulary?.signature_phrases?.map((p: string, i: number) => (
                                                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">&quot;{p}&quot;</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Personality */}
                        <div className="card p-5">
                            <h3 className="text-h3 text-text-primary mb-3 flex items-center gap-2"><Shield size={16} className="text-green-500" /> Personality</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span className="text-caption">Confidence</span><span className="text-body-sm text-text-secondary">{profile.personality_markers?.confidence_level}</span></div>
                                <div className="flex justify-between"><span className="text-caption">Vulnerability</span><span className="text-body-sm text-text-secondary">{profile.personality_markers?.vulnerability}</span></div>
                                <div className="flex justify-between"><span className="text-caption">Teaching Style</span><span className="text-body-sm text-text-secondary">{profile.personality_markers?.teaching_style}</span></div>
                                <div className="flex justify-between"><span className="text-caption">Contrarian</span><span className="text-body-sm text-text-secondary">{profile.personality_markers?.contrarian_tendency}</span></div>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => { setActiveTab('train'); setSamples(['']) }} className="btn-secondary">
                        <RefreshCw size={14} /> Retrain Voice DNA
                    </button>
                </div>
            )}

            {activeTab === 'profile' && !profile && (
                <div className="card p-12 text-center">
                    <Brain size={32} className="text-text-muted mx-auto mb-3" />
                    <h3 className="text-h3 text-text-primary mb-1">No Voice DNA yet</h3>
                    <p className="text-body-sm mb-4">Train your AI by uploading content samples.</p>
                    <button onClick={() => setActiveTab('train')} className="btn-primary bg-purple-600">Start Training</button>
                </div>
            )}

            {/* ═══ CONTENT AUTOPSY TAB ═══ */}
            {activeTab === 'autopsy' && (
                <div className="space-y-6">
                    <div className="card p-6">
                        <h2 className="text-h3 text-text-primary mb-1">Content Autopsy</h2>
                        <p className="text-body-sm mb-4">Paste any viral post (yours or a competitor) and AI will reverse-engineer exactly WHY it works.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-caption mb-1 block">Platform</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'TikTok'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setAutopsyPlatform(p)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${autopsyPlatform === p ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-surface-2 text-text-muted border border-border hover:border-border-light'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <textarea
                                value={autopsyContent}
                                onChange={e => setAutopsyContent(e.target.value)}
                                rows={8}
                                className="input resize-none"
                                placeholder="Paste the full content of a viral post here..."
                            />

                            <button onClick={runAutopsy} disabled={autopsyLoading || !autopsyContent.trim()} className="btn-primary bg-purple-600">
                                {autopsyLoading ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
                                {autopsyLoading ? 'Analyzing...' : 'Run Autopsy'}
                            </button>
                        </div>
                    </div>

                    {autopsyResult && (
                        <div className="space-y-4">
                            {/* Verdict */}
                            <div className="card p-5">
                                <h3 className="text-h3 text-text-primary mb-2">Verdict</h3>
                                <p className="text-body leading-relaxed">{autopsyResult.verdict}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Hook Analysis */}
                                {autopsyResult.hook_analysis && (
                                    <div className="card p-5">
                                        <h3 className="text-h3 text-text-primary mb-2">Hook Analysis</h3>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between"><span className="text-caption">Technique</span><span className="text-body-sm text-text-secondary">{autopsyResult.hook_analysis.technique}</span></div>
                                            <div className="flex justify-between"><span className="text-caption">Effectiveness</span><span className="text-body-sm font-medium text-text-primary">{autopsyResult.hook_analysis.effectiveness}/10</span></div>
                                        </div>
                                        <p className="text-body-sm mt-2">{autopsyResult.hook_analysis.breakdown}</p>
                                    </div>
                                )}

                                {/* Emotional Triggers */}
                                {autopsyResult.emotional_triggers && (
                                    <div className="card p-5">
                                        <h3 className="text-h3 text-text-primary mb-2">Emotional Triggers</h3>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between"><span className="text-caption">Primary</span><span className="text-body-sm font-medium text-purple-400">{autopsyResult.emotional_triggers.primary}</span></div>
                                            <div className="flex justify-between"><span className="text-caption">Secondary</span><span className="text-body-sm text-text-secondary">{autopsyResult.emotional_triggers.secondary}</span></div>
                                            <div className="flex justify-between"><span className="text-caption">Intensity</span><span className="text-body-sm text-text-secondary">{autopsyResult.emotional_triggers.intensity}</span></div>
                                        </div>
                                    </div>
                                )}

                                {/* CTA Analysis */}
                                {autopsyResult.cta_analysis && (
                                    <div className="card p-5">
                                        <h3 className="text-h3 text-text-primary mb-2">CTA Analysis</h3>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between"><span className="text-caption">Type</span><span className="text-body-sm text-text-secondary">{autopsyResult.cta_analysis.type}</span></div>
                                            <div className="flex justify-between"><span className="text-caption">Effectiveness</span><span className="text-body-sm text-text-secondary">{autopsyResult.cta_analysis.effectiveness}/10</span></div>
                                        </div>
                                        <p className="text-body-sm mt-2">{autopsyResult.cta_analysis.improvement}</p>
                                    </div>
                                )}

                                {/* Narrative Structure */}
                                {autopsyResult.narrative_structure && (
                                    <div className="card p-5">
                                        <h3 className="text-h3 text-text-primary mb-2">Narrative Structure</h3>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between"><span className="text-caption">Type</span><span className="text-body-sm text-text-secondary">{autopsyResult.narrative_structure.type}</span></div>
                                            <div className="flex justify-between"><span className="text-caption">Pacing</span><span className="text-body-sm text-text-secondary">{autopsyResult.narrative_structure.pacing}</span></div>
                                        </div>
                                        <p className="text-body-sm mt-2">{autopsyResult.narrative_structure.turning_point}</p>
                                    </div>
                                )}
                            </div>

                            {/* What to Steal */}
                            {Array.isArray(autopsyResult.what_to_steal) && (
                                <div className="card p-5">
                                    <h3 className="text-h3 text-text-primary mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-green-500" /> Steal These Techniques</h3>
                                    <ul className="space-y-2">
                                        {autopsyResult.what_to_steal.map((item: string, i: number) => (
                                            <li key={i} className="text-body-sm pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-2 before:h-2 before:rounded-full before:bg-green-500/30">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
