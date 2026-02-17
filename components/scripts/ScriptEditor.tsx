'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, RefreshCw, Zap, TrendingUp, AlertTriangle, Check, Sliders } from 'lucide-react'

interface ScriptEditorProps {
    scriptData: any
    onRegenerate: () => void
}

export default function ScriptEditor({ scriptData, onRegenerate }: ScriptEditorProps) {
    const [selectedHook, setSelectedHook] = useState(0)
    const [activeTab, setActiveTab] = useState<'editor' | 'optimizer'>('editor')
    const [scriptContent, setScriptContent] = useState(scriptData?.content || '')

    if (!scriptData) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-text-muted">
                <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4">
                    <Zap size={24} />
                </div>
                <h3 className="text-lg font-bold text-text-secondary">Ready to build</h3>
                <p className="max-w-xs text-sm mt-2">Configure your inputs on the left and hit generate to see your viral script here.</p>
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
                    <button onClick={onRegenerate} className="p-2 text-text-muted hover:text-text-primary transition-colors" title="Regenerate">
                        <RefreshCw size={16} />
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
                            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Choose a Hook</h3>
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
                                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Full Content</h3>
                                <button className="text-xs text-accent hover:underline flex items-center gap-1">
                                    <Copy size={12} /> Copy
                                </button>
                            </div>
                            <textarea
                                value={scriptContent}
                                onChange={e => setScriptContent(e.target.value)}
                                className="w-full h-96 bg-surface border border-border rounded-xl p-6 text-base leading-relaxed resize-none outline-none focus:border-accent transition-colors font-mono text-sm"
                            />
                        </div>

                        {/* Viral Score */}
                        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <TrendingUp size={18} className="text-green-500" />
                                    Viral Score
                                </h3>
                                <span className="text-2xl font-black text-green-500">{scriptData.score}/100</span>
                            </div>
                            <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-500 to-green-500"
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
                    // OPTIMIZER TAB
                    <div className="space-y-6 animate-enter">
                        <div className="bg-surface border border-border rounded-xl p-6 text-center space-y-4">
                            <h3 className="font-bold">Hook Optimizer</h3>
                            <p className="text-sm text-text-muted">A/B test your hooks against millions of viral data points.</p>

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
