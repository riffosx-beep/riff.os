'use client'

import React, { useState, useEffect } from 'react'
import ScriptConfig from '@/components/scripts/ScriptConfig'
import ScriptEditor from '@/components/scripts/ScriptEditor'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, Check } from 'lucide-react'

export default function ScriptsPage() {
    const [config, setConfig] = useState({
        topic: '',
        platform: 'twitter',
        framework: 'hormozi',
        contentType: 'short_form',
        tone: 50,
        duration: '60s',
        styles: [] as string[],
        ideaId: null as string | null
    })

    const [scriptData, setScriptData] = useState<any>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    // Load initial data or idea if present (query params not implemented yet but good for future)

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
                    length: config.duration // Use selected duration
                })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            const result = data.script
            const formattedContent = result.full_script || result.body || ''

            // Handle hooks which might be an array of objects or strings in api/ai response
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
            alert('Failed to generate script')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        if (!scriptData || !config.topic) return
        setIsSaving(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Unauthorized')

            const { error } = await supabase.from('vault').insert({
                user_id: user.id,
                title: config.topic,
                content: scriptData.content,
                type: 'script',
                status: 'active',
                source: 'ai',
                metadata: {
                    platform: config.platform,
                    framework: config.framework,
                    hooks: scriptData.hooks,
                    settings: config
                }
            })

            if (error) {
                console.error('Script save error:', error)
                throw error
            }

            setLastSaved(new Date())
        } catch (err) {
            console.error('Save failed', err)
            alert('Failed to save script')
        } finally {
            setIsSaving(false)
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
            alert('Failed to refine script')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 lg:gap-0 bg-surface border border-border rounded-xl overflow-hidden shadow-2xl relative">
            {/* Left Panel: Configuration */}
            <div className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-border bg-surface relative z-10 flex flex-col">
                <div className="p-4 border-b border-border bg-surface-2/50 backdrop-blur-sm">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                        Script Engine
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ScriptConfig
                        config={config}
                        setConfig={setConfig}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                    />
                </div>
            </div>

            {/* Right Panel: Editor & Output */}
            <div className="flex-1 bg-surface-2 relative flex flex-col">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                />

                <div className="p-4 border-b border-border bg-surface/50 backdrop-blur-sm flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 uppercase border border-blue-500/20">Draft Mode</span>
                        <span className="text-xs text-text-muted">
                            {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Unsaved'}
                        </span>
                    </div>
                    {scriptData && (
                        <button onClick={handleSave} disabled={isSaving} className="btn-secondary text-xs flex items-center gap-2">
                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            Save Draft
                        </button>
                    )}
                </div>

                <div className="flex-1 relative overflow-hidden">
                    <ScriptEditor
                        scriptData={scriptData}
                        onRegenerate={handleGenerate}
                        onRefine={handleRefine}
                        isGenerating={isGenerating}
                    />
                </div>
            </div>
        </div>
    )
}
