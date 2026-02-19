'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, RefreshCw, Zap, TrendingUp, AlertTriangle, Check, Sliders, Loader2, Sparkles, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ScriptEditorProps {
    scriptData: any
    onRegenerate: () => void
    onRefine: (feedback: string) => void
    isGenerating: boolean
    onSave?: (data: any) => Promise<void>
}

export default function ScriptEditor({ scriptData, onRegenerate, onRefine, isGenerating, onSave }: ScriptEditorProps) {
    const [selectedHook, setSelectedHook] = useState(0)
    const [activeTab, setActiveTab] = useState<'editor' | 'optimizer'>('editor')
    const [scriptContent, setScriptContent] = useState(scriptData?.content || '')
    const [refinePrompt, setRefinePrompt] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const handleSave = async () => {
        if (!scriptContent || isSaving) return
        setIsSaving(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase.from('vault').insert({
                user_id: user.id,
                title: scriptData.title || `Script: ${scriptContent.slice(0, 30)}...`,
                content: scriptContent,
                type: 'script',
                status: 'active',
                source: 'ai',
                metadata: {
                    hooks: scriptData.hooks,
                    score: scriptData.score
                }
            })

            if (error) throw error

            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
            if (onSave) await onSave(scriptData)
        } catch (err) {
            console.error('Save failed:', err)
            alert('Failed to save to vault')
        } finally {
            setIsSaving(false)
        }
    }

    // Update internal content when props change
    React.useEffect(() => {
        if (scriptData?.content) {
            setScriptContent(scriptData.content)
        }
    }, [scriptData?.content])

    if (!scriptData) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-text-muted">
                <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
                    <Zap size={24} />
                </div>
                <h3 className="text-lg font-bold text-text-secondary">Ready to build</h3>
                <p className="max-w-xs text-sm mt-2">Configure your inputs on the left and hit generate to see your localized, high-impact script here.</p>
            </div>
        )
    }

    const handleExport = (format: 'copy' | 'txt' | 'pdf') => {
        const textToExport = scriptContent || scriptData?.content || ''
        if (!textToExport) return

        if (format === 'copy') {
            navigator.clipboard.writeText(textToExport)
            alert('Script copied to clipboard!')
        }
        else if (format === 'txt') {
            const blob = new Blob([textToExport], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${scriptData.title || 'script'}.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
        else if (format === 'pdf') {
            alert('PDF export coming in next update. Text format downloaded instead.')
            handleExport('txt')
        }
    }

    return (
        <div className="h-full flex flex-col bg-surface-2/30">
            {/* Header / Tabs */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface sticky top-0 z-10">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`text-sm font-bold pb-1 transition-colors ${activeTab === 'editor' ? 'text-text-primary border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Script Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('optimizer')}
                        className={`text-sm font-bold pb-1 transition-colors flex items-center gap-1 ${activeTab === 'optimizer' ? 'text-text-primary border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        <Zap size={14} /> Hook Optimizer
                    </button>
                </div>
                <div className="flex gap-2">
                    <button onClick={onRegenerate} disabled={isGenerating} className="p-2 text-text-muted hover:text-text-primary transition-colors" title="Regenerate">
                        <RefreshCw size={16} className={`${isGenerating ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isGenerating}
                        className={`btn-secondary text-[10px] font-bold uppercase tracking-widest px-4 h-8 flex items-center gap-2 transition-all ${saveSuccess ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}`}
                    >
                        {isSaving ? <Loader2 size={12} className="animate-spin" /> : saveSuccess ? <Check size={12} /> : <Save size={12} />}
                        {isSaving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save to Vault'}
                    </button>
                    <button onClick={() => handleExport('txt')} className="btn-secondary text-xs h-8">
                        Export .TXT
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'editor' ? (
                    <div className="space-y-6 animate-enter">
                        {/* Hooks Selection */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Step 1: Choose Your Hook</h3>
                            <div className="grid gap-3">
                                {scriptData.hooks.map((hook: string, i: number) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedHook(i)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedHook === i
                                            ? 'bg-surface border-accent shadow-lg shadow-accent/5 ring-1 ring-accent'
                                            : 'bg-surface border-border hover:border-text-muted opacity-80 hover:opacity-100'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${selectedHook === i ? 'bg-accent/10 text-accent' : 'bg-surface-2 text-text-muted'}`}>
                                                Option {String.fromCharCode(65 + i)}
                                            </span>
                                            {selectedHook === i && <Check size={14} className="text-accent" />}
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed">"{hook}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Full Script */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Step 2: Script Content</h3>
                                <button onClick={() => handleExport('copy')} className="text-xs text-accent hover:underline flex items-center gap-1">
                                    <Copy size={12} /> Copy
                                </button>
                            </div>
                            <div className="relative group">
                                <textarea
                                    value={scriptContent}
                                    onChange={e => setScriptContent(e.target.value)}
                                    className="w-full h-96 bg-surface border border-border rounded-xl p-6 text-base leading-relaxed resize-none outline-none focus:border-accent transition-colors font-mono text-sm shadow-inner"
                                />
                                {isGenerating && (
                                    <div className="absolute inset-0 bg-surface/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                                        <Loader2 className="animate-spin text-accent" size={32} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Refinement */}
                        <div className="bg-surface border border-border rounded-xl p-5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={16} className="text-accent" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Step 3: Refine with AI</h3>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={refinePrompt}
                                    onChange={e => setRefinePrompt(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && onRefine(refinePrompt)}
                                    placeholder="e.g. 'Make it more punchy' or 'Change the CTA to join my newsletter'..."
                                    className="flex-1 bg-surface-2 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-accent"
                                />
                                <button
                                    onClick={() => {
                                        onRefine(refinePrompt)
                                        setRefinePrompt('')
                                    }}
                                    disabled={!refinePrompt || isGenerating}
                                    className="btn-primary py-2 px-4 text-xs flex items-center gap-2 shadow-lg shadow-accent/10"
                                >
                                    {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                                    Refine
                                </button>
                            </div>
                            <p className="text-[10px] text-text-muted italic">Pro tip: You can ask the AI to change the tone, shorten the body, or add specific details.</p>
                        </div>

                        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <TrendingUp size={18} className="text-green-500" />
                                    Strategic Impact
                                </h3>
                                <span className="text-2xl font-black text-green-500">{scriptData.score}/100</span>
                            </div>
                            <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-1000"
                                    style={{ width: `${scriptData.score}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <Check size={12} className="text-green-500" /> Strong Hook
                                </div>
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <Check size={12} className="text-green-500" /> Clear Structure
                                </div>
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <AlertTriangle size={12} className="text-yellow-500" /> Add more specifics
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // ... (rest of the file)
                    // OPTIMIZER TAB
                    <div className="space-y-6 animate-enter">
                        <div className="bg-surface border border-border rounded-xl p-6 text-center space-y-4">
                            <h3 className="font-bold">Hook Optimizer</h3>
                            <p className="text-sm text-text-muted">A/B test your hooks against your Creator DNA and audience goals.</p>

                            <div className="p-4 bg-surface-2 rounded-lg text-left text-sm border border-border">
                                <p className="font-mono text-xs text-text-muted mb-2">CURRENT HOOK:</p>
                                <p>"{scriptData.hooks[selectedHook]}"</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button className="p-4 rounded-lg bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors text-left group">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-accent">Alternative 1 (Contrarian)</span>
                                        <span className="text-xs font-bold text-green-500">Score: 92</span>
                                    </div>
                                    <p className="text-sm font-medium">"Stop trying to build an audience. Start building a system. Here's why:"</p>
                                </button>
                                <button className="p-4 rounded-lg bg-surface border border-border hover:border-text-muted transition-colors text-left group">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-text-muted">Alternative 2 (Negative)</span>
                                        <span className="text-xs font-bold text-green-500">Score: 88</span>
                                    </div>
                                    <p className="text-sm font-medium">"The biggest mistake founders make when posting content (and how to fix it):"</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
