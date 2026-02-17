'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowRight,
    Check,
    User,
    Briefcase,
    Megaphone,
    PenTool,
    Layers,
    Clock,
    Brain,
    BarChart3,
    Mic,
    FileText,
    Loader2
} from 'lucide-react'

// ─── STEP 1: ROLE ───
const ROLES = [
    { id: 'founder', label: 'Founder', icon: User },
    { id: 'coach', label: 'Coach', icon: Briefcase },
    { id: 'creator', label: 'Creator', icon: Megaphone },
    { id: 'agency', label: 'Agency', icon: Layers },
]

const PLATFORMS = [
    { id: 'twitter', label: 'Twitter/X' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'newsletter', label: 'Newsletter' },
]

// ─── STEP 2: STRUGGLES ───
const STRUGGLES = [
    { id: 'no_ideas', label: 'No ideas (Empty brain)', icon: Brain },
    { id: 'structure', label: 'Structuring thoughts', icon: Layers },
    { id: 'time', label: 'Writing takes too long', icon: Clock },
    { id: 'voice', label: 'Doesn\'t sound like me', icon: Mic },
    { id: 'analytics', label: 'No analytics insight', icon: BarChart3 },
    { id: 'consistency', label: 'Inconsistency', icon: FileText },
]

// ─── STEP 3: VOICE ───
const TONES = ['Professional', 'Casual', 'Provocative', 'Educational']
const STYLES = ['Storytelling', 'Data-driven', 'Conversational', 'Direct']

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // Data
    const [role, setRole] = useState('')
    const [platforms, setPlatforms] = useState<string[]>([])
    const [struggles, setStruggles] = useState<string[]>([])
    const [voiceMethod, setVoiceMethod] = useState<'upload' | 'manual' | null>(null)
    const [voiceConfig, setVoiceConfig] = useState({ tone: 'Professional', style: 'Storytelling' })

    const toggleSelection = (list: string[], setList: (l: string[]) => void, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item))
        } else {
            setList([...list, item])
        }
    }

    const handleComplete = async () => {
        setLoading(true)
        // Simulate API call to save preferences
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Save to local storage for "persisting" the demo state
        localStorage.setItem('architect_onboarding', JSON.stringify({
            role, platforms, struggles, voiceConfig
        }))

        router.push('/home')
    }

    return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 3) * 100}%` }}
                    className="h-full bg-accent transition-all duration-500"
                />
            </div>

            <div className="w-full max-w-2xl z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        {step === 1 && "Let's personalize Architect."}
                        {step === 2 && "What's holding you back?"}
                        {step === 3 && "Connect your voice."}
                    </h1>
                    <p className="text-text-muted">
                        {step === 1 && "Better inputs = Better AI outputs."}
                        {step === 2 && "We'll tailor your dashboard to solve these."}
                        {step === 3 && "Train the AI to write exactly like you."}
                    </p>
                </div>

                {/* ─── STEP 1: ROLE & PLATFORMS ─── */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted icon-text-muted">What best describes you?</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {ROLES.map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => setRole(r.id)}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${role === r.id
                                                ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                                                : 'bg-surface border-border hover:border-text-muted'
                                            }`}
                                    >
                                        <r.icon size={24} />
                                        <span className="text-sm font-medium">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {role && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Primary Platforms</label>
                                <div className="flex flex-wrap gap-3">
                                    {PLATFORMS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => toggleSelection(platforms, setPlatforms, p.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${platforms.includes(p.id)
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-surface-2 border-transparent text-text-secondary hover:bg-surface-hover'
                                                }`}
                                        >
                                            {p.label} {platforms.includes(p.id) && "✓"}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ─── STEP 2: STRUGGLES ─── */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {STRUGGLES.map(s => (
                            <button
                                key={s.id}
                                onClick={() => toggleSelection(struggles, setStruggles, s.id)}
                                className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${struggles.includes(s.id)
                                        ? 'bg-surface border-accent shadow-[0_0_0_1px_var(--accent)]'
                                        : 'bg-surface border-border hover:border-text-muted'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${struggles.includes(s.id) ? 'bg-accent/10 text-accent' : 'bg-surface-2 text-text-muted'}`}>
                                    <s.icon size={20} />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-semibold ${struggles.includes(s.id) ? 'text-text-primary' : 'text-text-secondary'}`}>{s.label}</h3>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* ─── STEP 3: VOICE ─── */}
                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {!voiceMethod ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <button
                                    onClick={() => setVoiceMethod('upload')}
                                    className="group p-8 rounded-2xl border border-dashed border-border hover:border-accent hover:bg-surface transition-all text-center space-y-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mx-auto group-hover:bg-accent group-hover:text-white transition-colors">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Analyze Past Content</h3>
                                        <p className="text-xs text-text-muted mt-1">Upload 5-10 posts and we'll extract your DNA.</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setVoiceMethod('manual')}
                                    className="group p-8 rounded-2xl border border-dashed border-border hover:border-accent hover:bg-surface transition-all text-center space-y-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mx-auto group-hover:bg-accent group-hover:text-white transition-colors">
                                        <PenTool size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">Describe Manually</h3>
                                        <p className="text-xs text-text-muted mt-1">Select tone and style tags tailored to you.</p>
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div className="bg-surface border border-border rounded-xl p-8 animate-enter">
                                {voiceMethod === 'manual' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">Tone</label>
                                            <div className="flex flex-wrap gap-2">
                                                {TONES.map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setVoiceConfig({ ...voiceConfig, tone: t })}
                                                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${voiceConfig.tone === t ? 'bg-black text-white border-black' : 'border-border text-text-secondary'
                                                            }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">Style</label>
                                            <div className="flex flex-wrap gap-2">
                                                {STYLES.map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setVoiceConfig({ ...voiceConfig, style: s })}
                                                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${voiceConfig.style === s ? 'bg-black text-white border-black' : 'border-border text-text-secondary'
                                                            }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {voiceMethod === 'upload' && (
                                    <div className="text-center py-8">
                                        <p className="text-text-muted text-sm">Upload simulation active. We'll use "Professional Storytelling" as default.</p>
                                        <button onClick={() => setVoiceMethod('manual')} className="text-xs text-accent mt-4 hover:underline">Switch to Manual</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ─── NAVIGATION ─── */}
                <div className="mt-10 flex justify-end">
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !role}
                            className="btn-primary px-8 py-3 text-sm h-12 shadow-xl shadow-accent/10"
                        >
                            Continue <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={!voiceMethod && !loading}
                            className="btn-primary px-8 py-3 text-sm h-12 w-full sm:w-auto shadow-xl shadow-accent/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Launch Architect OS"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
