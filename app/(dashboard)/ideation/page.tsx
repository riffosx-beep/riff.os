'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, PenTool, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import ScriptConfig from '@/components/scripts/ScriptConfig'
import ScriptEditor from '@/components/scripts/ScriptEditor'
import IdeaVault from '@/components/ideation/IdeaVault'

export default function IdeationPage() {
    const [mode, setMode] = useState<'vault' | 'studio'>('studio')

    // Config State
    const [config, setConfig] = useState({
        topic: '',
        platform: 'youtube',
        framework: 'hormozi',
        contentType: 'educational',
        tone: 50,
        duration: '10min',
        styles: [] as string[],
        ideaId: null as string | null
    })

    const [scriptData, setScriptData] = useState<any>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const searchParams = useSearchParams()

    useEffect(() => {
        const topic = searchParams.get('topic')
        const content = searchParams.get('content')
        const ideaId = searchParams.get('ideaId')

        if (topic || content) {
            setConfig(prev => ({
                ...prev,
                topic: topic || content || '',
                ideaId: ideaId || null
            }))
            setMode('studio')
        }
    }, [searchParams])

    // Handle selecting from vault
    const handleVaultSelect = (item: any) => {
        setConfig({
            ...config,
            topic: item.content || item.title,
            ideaId: item.id
        })
        setMode('studio')
    }

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
                : [result.hook || 'High Impact Hook Concept']

            setScriptData({
                hooks: hooks,
                content: formattedContent,
                score: result.impact_score || 85,
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
                score: data.refined.impact_score || scriptData.score
            })
        } catch (err) {
            console.error(err)
            alert('Refinement failed')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                        Content Studio
                    </h1>
                    <p className="text-text-muted mt-1 text-sm">Convert raw ideas into high-impact production-ready scripts.</p>
                </div>
                <div className="flex gap-4 border-b border-border/50">
                    <button
                        onClick={() => setMode('vault')}
                        className={`pb-2 text-xs font-bold uppercase tracking-widest transition-colors ${mode === 'vault' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                        Idea Vault
                    </button>
                    <button
                        onClick={() => setMode('studio')}
                        className={`pb-2 text-xs font-bold uppercase tracking-widest transition-colors ${mode === 'studio' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                        Script Editor
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'studio' ? (
                    <motion.div
                        key="studio"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid lg:grid-cols-[420px_1fr] gap-6"
                    >
                        {/* Left: Input Config */}
                        <div className="bg-surface/40 backdrop-blur-sm border border-border rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                            <ScriptConfig
                                config={config}
                                setConfig={setConfig}
                                onGenerate={handleGenerate}
                                isGenerating={isGenerating}
                            />
                        </div>

                        {/* Right: Output */}
                        <div className="bg-surface/40 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-2xl min-h-[700px]">
                            <ScriptEditor
                                scriptData={scriptData}
                                onRegenerate={handleGenerate}
                                onRefine={handleRefine}
                                isGenerating={isGenerating}
                                onSave={async (data) => {
                                    const supabase = createClient()
                                    const { data: { user } } = await supabase.auth.getUser()
                                    if (!user) return

                                    // 1. Save Script
                                    const { data: savedScript, error } = await supabase.from('vault').insert({
                                        user_id: user.id,
                                        title: config.topic,
                                        content: data.content,
                                        type: 'script',
                                        status: 'active',
                                        source: 'ai',
                                        metadata: {
                                            platform: config.platform,
                                            framework: config.framework,
                                            hooks: data.hooks,
                                            settings: config,
                                            origin_idea_id: config.ideaId
                                        }
                                    }).select().single()

                                    if (error) {
                                        console.error(error)
                                        return
                                    }

                                    // 2. If generated from an Idea, Link it!
                                    if (config.ideaId) {
                                        // Update idea to point to this script? or just mark as 'processed'
                                        // Ideally we want to show it moved in the pipeline
                                        // But since both are in 'vault', we typically change the type OR keep both linked
                                        // Let's keep both linked for now so we don't lose the original idea
                                        await supabase.from('vault').update({
                                            status: 'processed',
                                            metadata: { linked_script_id: savedScript.id } // Append to metadata? requires fetching first.
                                            // simpler: just update status
                                        }).eq('id', config.ideaId)
                                    }
                                }}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="vault"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-[calc(100vh-250px)]"
                    >
                        <IdeaVault onSelect={handleVaultSelect} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
