'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Twitter, Linkedin, Instagram, Youtube, Mail, BookOpen, ChevronRight, Check } from 'lucide-react'

// Constants
const PLATFORMS = [
    { id: 'twitter', icon: Twitter, label: 'Twitter' },
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
    { id: 'instagram', icon: Instagram, label: 'Instagram' },
    { id: 'youtube', icon: Youtube, label: 'YouTube' },
    { id: 'blog', icon: Mail, label: 'Blog' },
]

const FRAMEWORKS = [
    { id: 'hormozi', name: 'The Hormozi Hook', desc: 'Bold Claim + Proof + Curiosity' },
    { id: 'story', name: 'Standard Story Arc', desc: "Hero's Journey adapted for social" },
    { id: 'contrarian', name: 'The Contrarian', desc: 'Everyone says X. Here is why Y.' },
    { id: 'listicle', name: 'Educational List', desc: 'X steps to achieve Y result' },
]

const CONTENT_TYPES = [
    { id: 'short_form', name: 'Short Form Video', desc: 'Punchy, fast-paced (Reels/TikTok/Shorts)' },
    { id: 'educational', name: 'Educational Breakdown', desc: 'Deep dive into a specific topic' },
    { id: 'storytelling', name: 'Personal Narrative', desc: 'Vulnerable and authentic storytelling' },
    { id: 'controversial', name: 'The Hot Take', desc: 'Challenging the status quo' },
]

interface ScriptConfigProps {
    config: any
    setConfig: (config: any) => void
    onGenerate: () => void
    isGenerating: boolean
}

export default function ScriptConfig({ config, setConfig, onGenerate, isGenerating }: ScriptConfigProps) {

    const update = (key: string, value: any) => {
        setConfig({ ...config, [key]: value })
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b border-border">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles size={18} className="text-accent" />
                    Build Your Script
                </h2>
                <p className="text-xs text-text-muted">Configure your inputs to generate high-impact content.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Step 1: Topic */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Step 1: Topic</label>
                    <textarea
                        value={config.topic}
                        onChange={e => update('topic', e.target.value)}
                        placeholder="e.g. Why most founders fail at content marketing..."
                        className="w-full h-24 bg-surface input resize-none text-sm placeholder:text-text-muted"
                    />
                    <button className="text-xs text-accent hover:underline flex items-center gap-1">
                        <BookOpen size={12} /> Choose from Idea Vault
                    </button>
                </div>

                {/* Step 2: Platform */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Step 2: Platform</label>
                    <div className="flex flex-wrap gap-2">
                        {PLATFORMS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => update('platform', p.id)}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all min-w-[80px] ${config.platform === p.id
                                    ? 'bg-text-primary text-text-inverse border-text-primary shadow-lg'
                                    : 'bg-surface border-border hover:border-text-muted text-text-secondary'
                                    }`}
                            >
                                <p.icon size={18} />
                                <span className="text-[10px] font-bold">{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 3: Content Type */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Step 3: Content Type</label>
                    <div className="space-y-2">
                        {CONTENT_TYPES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => update('contentType', t.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${config.contentType === t.id
                                    ? 'bg-accent/10 border-accent text-accent'
                                    : 'bg-surface border-border hover:border-text-muted'
                                    }`}
                            >
                                <div>
                                    <h4 className={`text-sm font-bold ${config.contentType === t.id ? 'text-accent' : 'text-text-primary'}`}>{t.name}</h4>
                                    <p className="text-[10px] text-text-muted">{t.desc}</p>
                                </div>
                                {config.contentType === t.id && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 4: Framework */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Step 4: Framework</label>
                    <div className="space-y-2">
                        {FRAMEWORKS.map(f => (
                            <button
                                key={f.id}
                                onClick={() => update('framework', f.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${config.framework === f.id
                                    ? 'bg-accent/10 border-accent text-accent'
                                    : 'bg-surface border-border hover:border-text-muted'
                                    }`}
                            >
                                <div>
                                    <h4 className={`text-sm font-bold ${config.framework === f.id ? 'text-accent' : 'text-text-primary'}`}>{f.name}</h4>
                                    <p className="text-[10px] text-text-muted">{f.desc}</p>
                                </div>
                                {config.framework === f.id && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 5: Voice Tone */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Step 5: Voice & Tone</label>
                    <div className="bg-surface border border-border rounded-lg p-4">
                        <div className="flex justify-between text-[10px] font-bold text-text-muted mb-2">
                            <span>CASUAL</span>
                            <span>PROFESSIONAL</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={config.tone}
                            onChange={e => update('tone', parseInt(e.target.value))}
                            className="w-full h-1 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                    </div>
                </div>

                {/* Step 6: Duration */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Step 6: Duration</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: '30s', label: 'Short', desc: '30s' },
                            { id: '60s', label: 'Medium', desc: '60s' },
                            { id: '120s', label: 'Long', desc: '2m' },
                            { id: '10min', label: 'Deep', desc: '10m+' },
                        ].map(d => (
                            <button
                                key={d.id}
                                onClick={() => update('duration', d.id)}
                                className={`p-2 rounded-lg border flex flex-col items-center transition-all ${config.duration === d.id
                                    ? 'bg-accent/10 border-accent text-accent shadow-[0_0_10px_rgba(124,58,237,0.2)]'
                                    : 'bg-surface border-border text-text-secondary hover:border-text-muted'
                                    }`}
                            >
                                <span className="text-[10px] font-bold">{d.label}</span>
                                <span className="text-[9px] opacity-60">{d.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-border bg-surface-2">
                <button
                    onClick={onGenerate}
                    disabled={!config.topic || isGenerating}
                    className="btn-primary w-full py-3 h-12 text-sm shadow-xl shadow-accent/20"
                >
                    {isGenerating ? (
                        <span className="flex items-center gap-2 animate-pulse">
                            Writing Script...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            Global Generate <ChevronRight size={16} />
                        </span>
                    )}
                </button>
            </div>
        </div>
    )
}
