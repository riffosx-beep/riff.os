'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Repeat,
    Zap,
    Share2,
    MessageSquare,
    Twitter,
    Linkedin,
    ArrowRight,
    Loader2,
    Check,
    Copy,
    Sparkles,
    Search,
    ChevronRight,
    Save
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

const TOOLS = [
    {
        id: 'hook-optimize',
        name: 'Hook Optimizer',
        desc: '10 viral hooks for any script',
        icon: Zap,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        borderColor: 'border-yellow-400/30'
    },
    {
        id: 'remix-twitter',
        name: 'Thread Maker',
        desc: 'Turn long-form into X threads',
        icon: Twitter,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        borderColor: 'border-blue-400/30'
    },
    {
        id: 'remix-linkedin',
        name: 'LinkedIn Remix',
        desc: 'Optimized post for professional reach',
        icon: Linkedin,
        color: 'text-blue-600',
        bg: 'bg-blue-600/10',
        borderColor: 'border-blue-600/30'
    }
]

export default function RepurposingPage() {
    const [step, setStep] = useState(1)
    const [selectedTool, setSelectedTool] = useState(TOOLS[0])
    const [content, setContent] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [copied, setCopied] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const searchParams = useSearchParams()

    React.useEffect(() => {
        const prefill = searchParams.get('content')
        if (prefill) {
            setContent(prefill)
            setStep(2)
        }
    }, [searchParams])

    const handleSaveAll = async () => {
        if (!result || isSaving) return
        setIsSaving(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            let contentToSave = ''
            if (selectedTool.id === 'hook-optimize') {
                contentToSave = result.hooks.map((h: any) => `${h.trigger}: ${h.text}`).join('\n\n')
            } else if (selectedTool.id === 'remix-twitter') {
                contentToSave = result.thread.map((t: any) => `TWEET ${t.tweet_number}: ${t.text}`).join('\n\n')
            } else if (selectedTool.id === 'remix-linkedin') {
                contentToSave = result.post
            }

            const { error } = await supabase.from('vault').insert({
                user_id: user.id,
                title: `${selectedTool.name} Generation: ${new Date().toLocaleDateString()}`,
                content: contentToSave,
                type: 'snippet',
                status: 'active',
                source: 'ai',
                metadata: { tool: selectedTool.id, raw: result }
            })

            if (error) throw error
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err) {
            console.error(err)
            alert('Failed to save to vault')
        } finally {
            setIsSaving(false)
        }
    }

    const handleProcess = async () => {
        if (!content.trim()) return
        setIsProcessing(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'repurpose',
                    content,
                    action: selectedTool.id
                })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setResult(data.result)
            setStep(3)
        } catch (err) {
            console.error(err)
            alert('Failed to repurpose content.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                    Repurposing Studio
                </h1>
                <p className="text-text-muted mt-1 text-sm">One asset, infinite distributions. Apply viral frameworks to existing content.</p>
            </div>

            <div className="grid lg:grid-cols-[300px_1fr] gap-8">
                {/* Left: Tool Selection - Mobile Scrollable Row / Desktop Vertical Column */}
                <div className="space-y-4">
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-2">Select Engine</div>
                    <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-3 no-scrollbar">
                        {TOOLS.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => {
                                    setSelectedTool(tool)
                                    if (step === 3) setStep(2)
                                }}
                                className={`flex-shrink-0 w-[240px] lg:w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 group ${selectedTool.id === tool.id
                                    ? `bg-surface border-accent shadow-lg shadow-accent/10`
                                    : 'bg-surface/40 border-border hover:border-text-muted opacity-60'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${selectedTool.id === tool.id ? tool.bg : 'bg-surface-2'
                                    }`}>
                                    <tool.icon size={20} className={selectedTool.id === tool.id ? tool.color : 'text-text-muted'} />
                                </div>
                                <div>
                                    <div className={`text-sm font-semibold ${selectedTool.id === tool.id ? 'text-text-primary' : 'text-text-muted'}`}>
                                        {tool.name}
                                    </div>
                                    <div className="text-[10px] text-text-secondary">{tool.desc}</div>
                                </div>
                                <ChevronRight size={14} className={`ml-auto hidden lg:block transition-transform ${selectedTool.id === tool.id ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
                            </button>
                        ))}
                    </div>

                    <div className="hidden lg:block pt-6">
                        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-accent mb-2 flex items-center gap-2">
                                <Sparkles size={12} /> PRO TIP
                            </h4>
                            <p className="text-[10px] text-text-muted leading-relaxed">
                                Paste your 10-minute scripts here to generate a week's worth of viral social content in seconds.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Workflow */}
                <div className="min-h-[600px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {step <= 2 ? (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex-1 flex flex-col space-y-4"
                            >
                                <div className="flex-1 bg-surface/40 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col space-y-4 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] text-white">1</span>
                                            PASTE SOURCE CONTENT
                                        </div>
                                        <button className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1">
                                            <Search size={10} /> SEARCH VAULT
                                        </button>
                                    </div>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Paste your script, blog post, or raw ideas here..."
                                        className="flex-1 bg-surface-2/50 border border-border rounded-xl p-6 text-sm text-text-primary outline-none focus:border-accent resize-none custom-scrollbar leading-relaxed"
                                    />
                                    <button
                                        onClick={handleProcess}
                                        disabled={isProcessing || !content.trim()}
                                        className="w-full py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-accent/20"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                RUNNING {selectedTool.name.toUpperCase()}...
                                            </>
                                        ) : (
                                            <>
                                                GENERATE VIRAL ASSETS
                                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col space-y-6"
                            >
                                <div className="bg-surface/40 backdrop-blur-sm border border-border rounded-2xl p-8 flex flex-col space-y-6 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
                                        <button
                                            onClick={handleSaveAll}
                                            disabled={isSaving}
                                            className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all flex items-center gap-2 ${saveSuccess ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'text-text-muted border-border hover:text-accent hover:border-accent'}`}
                                        >
                                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : saveSuccess ? <Check size={12} /> : <Save size={12} />}
                                            {isSaving ? 'SAVING...' : saveSuccess ? 'SAVED TO VAULT' : 'SAVE ALL TO VAULT'}
                                        </button>
                                        <button
                                            onClick={() => setStep(2)}
                                            className="text-[10px] font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-widest"
                                        >
                                            NEW REMIX
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedTool.bg}`}>
                                            <selectedTool.icon size={24} className={selectedTool.color} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{selectedTool.name} Output</h3>
                                            <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">READY FOR DISTRIBUTION</p>
                                        </div>
                                    </div>

                                    {/* Scrollable Result Area */}
                                    <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                        {selectedTool.id === 'hook-optimize' && result.hooks?.map((hook: any, i: number) => (
                                            <div key={i} className="bg-surface-2/50 border border-border rounded-xl p-4 hover:border-accent transition-all group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{hook.trigger}</span>
                                                    <button onClick={() => handleCopy(hook.text)} className="text-text-muted hover:text-accent transition-colors">
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-medium leading-relaxed">{hook.text}</p>
                                                <div className="mt-2 text-[10px] text-text-secondary">{hook.why}</div>
                                            </div>
                                        ))}

                                        {selectedTool.id === 'remix-twitter' && result.thread?.map((tweet: any, i: number) => (
                                            <div key={i} className="bg-surface-2/50 border border-border rounded-xl p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">TWEET {tweet.tweet_number}</span>
                                                    <button onClick={() => handleCopy(tweet.text)} className="text-text-muted hover:text-blue-400 transition-colors">
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-sm border-l-2 border-blue-400/30 pl-4 py-1 leading-relaxed">{tweet.text}</p>
                                            </div>
                                        ))}

                                        {selectedTool.id === 'remix-linkedin' && (
                                            <div className="bg-surface-2/50 border border-border rounded-xl p-6 space-y-4">
                                                <div className="flex items-center justify-between border-b border-border pb-4">
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-bold">OPTIMIZED POST</span>
                                                    <button onClick={() => handleCopy(result.post)} className="text-text-muted hover:text-blue-600 transition-colors">
                                                        <Copy size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{result.post}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-border flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
                                                <span className="text-[10px] text-text-muted font-bold tracking-tighter uppercase">AI Quality: HIGH</span>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 text-[10px] font-bold text-accent hover:underline uppercase tracking-widest">
                                            <Share2 size={12} /> Schedule Asset
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
