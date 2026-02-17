'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Lightbulb, PenTool, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import ScriptConfig from '@/components/scripts/ScriptConfig'
import ScriptEditor from '@/components/scripts/ScriptEditor'

export default function IdeationPage() {
    const [mode, setMode] = useState<'vault' | 'studio'>('studio')
    const [selectedIdea, setSelectedIdea] = useState<any>(null)

    // Config State (Lifted from ScriptsPage)
    const [config, setConfig] = useState({
        topic: '',
        platform: 'youtube', // Default to YouTube for long form support
        framework: 'hormozi',
        contentType: 'educational', // Default for 10min support
        tone: 50,
        duration: '10min', // Default to 10min for premium feel
        styles: [] as string[],
        ideaId: null as string | null
    })

    const [scriptData, setScriptData] = useState<any>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    // Handle "Global Generate"
    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'script',
                    hook: config.topic,
                    platform: config.platform,
                    tone: config.tone > 75 ? 'provocative' : config.tone > 40 ? 'casual' : 'professional',
                    framework: config.framework,
                    contentType: config.contentType,
                    length: config.duration
                })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            const result = data.script
            const formattedContent = result.full_script || result.body || ''

            // Handle hooks parsing
            const hooks = Array.isArray(result.hooks)
                ? result.hooks.map((h: any) => typeof h === 'string' ? h : h.text)
                : [result.hook || 'Viral Hook Concept']

            setScriptData({
                hooks: hooks,
                content: formattedContent,
                score: result.viral_score || 85,
                raw: result
            })
        } catch (err) {
            console.error(err)
            alert('Generation failed. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleRefine = async (feedback: string) => {
        if (!scriptData || !feedback) return
        setIsGenerating(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'refine-script',
                    script: scriptData.content,
                    feedback,
                    platform: config.platform,
                    contentType: config.contentType
                })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setScriptData({
                ...scriptData,
                content: data.refined.refined_script,
                score: data.refined.viral_score || scriptData.score
            })
        } catch (err) {
            console.error(err)
            alert('Refinement failed')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                        Content Studio
                    </h1>
                    <p className="text-text-muted mt-1">From raw idea to production-ready script.</p>
                </div>
                <div className="flex bg-surface border border-border rounded-lg p-1">
                    <button
                        onClick={() => setMode('vault')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'vault' ? 'bg-surface-2 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                        Idea Vault
                    </button>
                    <button
                        onClick={() => setMode('studio')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'studio' ? 'bg-surface-2 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                        Script Editor
                    </button>
                </div>
            </div>

            {mode === 'studio' ? (
                <div className="grid lg:grid-cols-[400px_1fr] gap-6 min-h-[600px]">
                    {/* Left: Input Config */}
                    <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col shadow-lg shadow-purple-900/5">
                        <ScriptConfig
                            config={config}
                            setConfig={setConfig}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                        />
                    </div>

                    {/* Right: Output */}
                    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-lg shadow-purple-900/5 min-h-[600px]">
                        <ScriptEditor
                            scriptData={scriptData}
                            onRegenerate={handleGenerate}
                            onRefine={handleRefine}
                            isGenerating={isGenerating}
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-xl p-12 text-center text-text-muted">
                    <p>Idea Vault integration coming in next update...</p>
                    <button onClick={() => setMode('studio')} className="mt-4 text-accent hover:underline">
                        Go to Script Editor
                    </button>
                </div>
            )}
        </div>
    )
}
