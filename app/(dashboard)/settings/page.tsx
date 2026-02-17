'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Settings as SettingsIcon,
    User,
    Crown,
    Sparkles,
    Shield,
    Loader2,
    Save,
    PenTool,
    Target,
    Megaphone,
} from 'lucide-react'

// Simple User interface
interface UserData {
    id: string
    email?: string
    user_metadata: {
        full_name?: string
        avatar_url?: string
        // Brand DNA
        brand_voice?: string
        target_audience?: string
        content_pillars?: string[]
    }
    app_metadata: {
        provider?: string
    }
    last_sign_in_at?: string
}

export default function SettingsPage() {
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Brand DNA State
    const [brandVoice, setBrandVoice] = useState('')
    const [targetAudience, setTargetAudience] = useState('')
    const [contentPillars, setContentPillars] = useState(['', '', ''])

    useEffect(() => {
        fetchUser()
    }, [])

    async function fetchUser() {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUser(user as any)
            // Load DNA if exists
            setBrandVoice(user.user_metadata?.brand_voice || '')
            setTargetAudience(user.user_metadata?.target_audience || '')
            if (user.user_metadata?.content_pillars) {
                setContentPillars(user.user_metadata.content_pillars)
            }
        }
        setLoading(false)
    }

    async function saveBrandDNA() {
        if (!user) return
        setSaving(true)
        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({
            data: {
                brand_voice: brandVoice,
                target_audience: targetAudience,
                content_pillars: contentPillars.filter(p => p.trim()),
            }
        })
        if (!error) {
            // Refresh local user state
            fetchUser()
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={24} className="animate-spin text-accent" />
            </div>
        )
    }

    if (!user) return null

    const userName = user.user_metadata?.full_name || 'User'
    const email = user.email || ''
    const avatar = user.user_metadata?.avatar_url
    const initials = userName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <SettingsIcon size={20} className="text-text-secondary" />
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
                </div>
                <p className="text-sm text-text-muted">Manage you profile and Brand DNA.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile & Subscription */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="glass-card p-6">
                        <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <User size={14} className="text-blue-500" /> Identity
                        </h2>
                        <div className="flex items-center gap-4 mb-6">
                            {avatar ? (
                                <img src={avatar} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                            ) : (
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                                    {initials}
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-text-primary">{userName}</h3>
                                <p className="text-xs text-text-muted">{email}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-surface-2/50 rounded-xl border border-border/50 text-xs text-text-secondary">
                            UserID: <span className="font-mono text-text-muted">{user.id.slice(0, 8)}...</span>
                        </div>
                    </div>

                    {/* Subscription Card */}
                    <div className="glass-card p-6 border-accent/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                            <Crown size={14} className="text-amber-500" /> Plan Status
                        </h2>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-text-primary text-sm">FounderOS Pro</p>
                                <p className="text-xs text-text-muted">Early Access License</p>
                            </div>
                            <span className="ml-auto badge badge-green text-[10px]">Active</span>
                        </div>
                        <button className="btn-secondary w-full text-xs justify-center">Manage Billing</button>
                    </div>
                </div>

                {/* Right Column: Brand DNA (Personalization) */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                    <Sparkles size={18} className="text-accent" /> Brand DNA
                                </h2>
                                <p className="text-sm text-text-muted">Personalize AI generation with your unique voice and audience.</p>
                            </div>
                            <button
                                onClick={saveBrandDNA}
                                disabled={saving}
                                className="btn-primary text-xs"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Save Changes
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Brand Voice */}
                            <div>
                                <label className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-2">
                                    <Megaphone size={14} className="text-blue-500" /> Brand Voice
                                </label>
                                <textarea
                                    value={brandVoice}
                                    onChange={e => setBrandVoice(e.target.value)}
                                    placeholder="e.g. Authoritative yet empathetic. I use short sentences. No corporate jargon. Like James Clear meets Naval Ravikant."
                                    className="input-premium h-24 text-sm"
                                />
                                <p className="text-[10px] text-text-muted mt-1.5 ml-1">
                                    The AI will mimic this tone in scripts and posts.
                                </p>
                            </div>

                            {/* Target Audience */}
                            <div>
                                <label className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-2">
                                    <Target size={14} className="text-red-500" /> Target Audience
                                </label>
                                <textarea
                                    value={targetAudience}
                                    onChange={e => setTargetAudience(e.target.value)}
                                    placeholder="e.g. B2B SaaS Founders earning $10k-$50k MRR. They struggle with hiring and delegation. They are busy and value direct advice."
                                    className="input-premium h-24 text-sm"
                                />
                            </div>

                            {/* Content Pillars */}
                            <div>
                                <label className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-2">
                                    <PenTool size={14} className="text-green-500" /> Core Content Pillars
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {contentPillars.map((pillar, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            value={pillar}
                                            onChange={e => {
                                                const newPillars = [...contentPillars]
                                                newPillars[i] = e.target.value
                                                setContentPillars(newPillars)
                                            }}
                                            placeholder={`Pillar ${i + 1} (e.g. Sales)`}
                                            className="input-premium text-sm"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
