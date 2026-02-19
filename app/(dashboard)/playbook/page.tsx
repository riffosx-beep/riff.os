'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Save,
    User,
    Target,
    Zap,
    MessageSquare,
    TrendingUp,
    Shield,
    Loader2,
    Check
} from 'lucide-react'

export default function PersonalizationPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [formData, setFormData] = useState({
        niche: '',
        audience_description: '',
        content_style: '',
        current_reach: '',
        growth_goal: '',
        topics_to_avoid: '',
        winning_formats: ''
    })

    const supabase = createClient()

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata?.personalization) {
            setFormData(user.user_metadata.personalization)
        }
        setLoading(false)
    }

    async function handleSave() {
        setSaving(true)
        setStatus('idle')
        const { error } = await supabase.auth.updateUser({
            data: { personalization: formData }
        })

        if (error) {
            setStatus('error')
        } else {
            setStatus('success')
            setTimeout(() => setStatus('idle'), 3000)
        }
        setSaving(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>

    return (
        <div className="max-w-4xl mx-auto pb-20 p-6 space-y-8">
            <div className="space-y-2">
                <div className="flex items-center gap-3 text-accent mb-2">
                    <Shield size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Personalization Engine</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Your Creator DNA.</h1>
                <p className="text-lg text-text-secondary max-w-2xl font-medium leading-relaxed">
                    Input your exact context here. The AI models will use this data to generate content that sounds exactly like you and speaks directly to your specific audience.
                </p>
            </div>

            <div className="grid gap-8">
                {/* Core Identity */}
                <div className="bg-surface border border-border rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center gap-4 border-b border-border pb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-text-primary">Core Identity</h3>
                            <p className="text-xs text-text-muted">Who you are and who you serve.</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Your Niche</label>
                            <input
                                name="niche"
                                value={formData.niche}
                                onChange={handleChange}
                                placeholder="e.g. B2B SaaS Marketing"
                                className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:border-accent outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Current Reach / Status</label>
                            <input
                                name="current_reach"
                                value={formData.current_reach}
                                onChange={handleChange}
                                placeholder="e.g. 10k LinkedIn followers, just starting out"
                                className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:border-accent outline-none transition-colors"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Audience Description</label>
                            <textarea
                                name="audience_description"
                                value={formData.audience_description}
                                onChange={handleChange}
                                placeholder="Describe your ideal reader in detail. What keeps them up at night? What are their titles?"
                                className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:border-accent outline-none transition-colors min-h-[100px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Style & Strategy */}
                <div className="bg-surface border border-border rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center gap-4 border-b border-border pb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-text-primary">Style & Strategy</h3>
                            <p className="text-xs text-text-muted">How you communicate and where you're going.</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Content Style / Tone</label>
                            <input
                                name="content_style"
                                value={formData.content_style}
                                onChange={handleChange}
                                placeholder="e.g. Contrarian, authoritative, empathetic, humorous"
                                className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:border-accent outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Growth Goal</label>
                            <input
                                name="growth_goal"
                                value={formData.growth_goal}
                                onChange={handleChange}
                                placeholder="e.g. Build newsletter list, get high-ticket leads"
                                className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:border-accent outline-none transition-colors"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Winning Formats (What works for you)</label>
                            <textarea
                                name="winning_formats"
                                value={formData.winning_formats}
                                onChange={handleChange}
                                placeholder="e.g. Personal stories, step-by-step guides, polarizing hot takes"
                                className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:border-accent outline-none transition-colors min-h-[80px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Guardrails */}
                <div className="bg-surface border border-border rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center gap-4 border-b border-border pb-6">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-text-primary">Guardrails</h3>
                            <p className="text-xs text-text-muted">What the AI should absolutely avoid.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Topics/Angles to Avoid</label>
                        <textarea
                            name="topics_to_avoid"
                            value={formData.topics_to_avoid}
                            onChange={handleChange}
                            placeholder="e.g. Political topics, generic 'hustle' advice, engagement bait"
                            className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:border-accent outline-none transition-colors min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 items-center gap-4">
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="text-emerald-500 font-bold text-xs flex items-center gap-2 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20"
                            >
                                <Check size={14} /> DNA SAVED
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'SAVING...' : 'SAVE CONFIGURATION'}
                    </button>
                </div>
            </div>
        </div>
    )
}
