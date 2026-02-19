'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mic, Type, Link as LinkIcon, SlidersHorizontal, Search, X, Sparkles, Loader2, Save, Wand2 } from 'lucide-react'
import IdeaCard, { IdeaItem } from '@/components/ideas/IdeaCard'
import CaptureModal from '@/components/ideas/CaptureModal'
import ExpandedIdea from '@/components/ideas/ExpandedIdea'
import { useIdeas } from '@/hooks/useIdeas'

type GeneratorInput = {
    platform: string
    goal: string
    pillar: string
    format: string
}

type GeneratedIdea = {
    hook: string
    angle: string
    why_it_works: string
    suggested_cta: string
    emotional_trigger: string
    category: string
    impact_score?: number
}

export default function IdeasPage() {
    const { ideas, loading, addIdea, refreshIdeas } = useIdeas()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'vault' | 'generator'>('vault')

    // Capture State
    const [isCaptureOpen, setIsCaptureOpen] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [activeFilter, setActiveFilter] = useState<'all' | 'voice' | 'text' | 'web' | 'ai'>('all')
    const [selectedIdea, setSelectedIdea] = useState<any | null>(null)

    // Generator State
    const [genInput, setGenInput] = useState<GeneratorInput>({ platform: 'LinkedIn', goal: 'Authority', pillar: '', format: 'Observation' })
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([])

    const filteredIdeas = ideas.filter(idea => {
        const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            idea.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (idea.tags && idea.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))

        const matchesFilter = activeFilter === 'all' || idea.source === activeFilter
        return matchesSearch && matchesFilter
    })

    const handleGenerate = async () => {
        if (!genInput.pillar) return
        setIsGenerating(true)
        setGeneratedIdeas([])
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'ideas',
                    platform: genInput.platform,
                    goal: genInput.goal,
                    contentPillars: [genInput.pillar],
                    specificAngle: genInput.format, // Mapping format to specificAngle for now
                    count: 6 // Generate 6 high quality ones
                })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            // Map API response to UI model
            const mappedIdeas = (data.ideas || []).map((idea: any) => ({
                hook: idea.hook,
                angle: idea.angle,
                why_it_works: idea.why_it_works,
                suggested_cta: idea.cta || '',
                emotional_trigger: idea.target_audience_segment || 'General', // Fallback
                category: idea.category,
                impact_score: idea.impact_score
            }))

            setGeneratedIdeas(mappedIdeas)
        } catch (err) {
            console.error(err)
            alert('Failed to generate ideas')
        } finally {
            setIsGenerating(false)
        }
    }

    const saveGeneratedIdea = async (idea: GeneratedIdea) => {
        const content = `
Angle: ${idea.angle}
Why it works: ${idea.why_it_works}
CTA: ${idea.suggested_cta}
Trigger: ${idea.emotional_trigger}
Category: ${idea.category}
        `.trim()

        await addIdea(idea.hook, content, [idea.category, 'AI Generated'], 'text') // Using 'text' as source for now or update hook to accept 'ai'
        alert('Saved to Vault!')
    }

    return (
        <div className="space-y-6 relative min-h-screen pb-20">
            <CaptureModal
                isOpen={isCaptureOpen}
                onClose={() => setIsCaptureOpen(false)}
                onSave={async (newIdea) => {
                    await addIdea(newIdea.title, newIdea.content, newIdea.tags, newIdea.type)
                }}
            />

            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur py-4 border-b border-border/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight mb-1">Ideation Engine</h1>
                        <p className="text-xs text-text-muted">Generate high-impact concepts or capture fleeting thoughts.</p>
                    </div>
                </div>

                <div className="flex gap-4 border-b border-border">
                    <button
                        onClick={() => setActiveTab('vault')}
                        className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === 'vault' ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        Idea Vault
                        {activeTab === 'vault' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('generator')}
                        className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === 'generator' ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        AI Generator
                        {activeTab === 'generator' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {selectedIdea && (
                    <ExpandedIdea
                        idea={selectedIdea}
                        onClose={() => setSelectedIdea(null)}
                        onUpdate={() => refreshIdeas()}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {activeTab === 'vault' ? (
                    <motion.div
                        key="vault"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Vault Controls */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsCaptureOpen(true)} className="btn-primary flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                                <Plus size={16} /> <span className="hidden sm:inline">Capture New</span>
                            </button>
                            <button onClick={() => setIsCaptureOpen(true)} className="p-2 ml-2 hover:bg-surface-hover rounded-md text-text-muted hover:text-text-primary border border-border bg-surface">
                                <Type size={16} />
                            </button>
                            <div className="flex-1" />
                            <div className="relative w-full max-w-xs">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search vault..." className="input pl-9 h-9 text-sm" />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-text-muted" />
                            </div>
                        ) : filteredIdeas.length > 0 ? (
                            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                                <AnimatePresence mode='popLayout'>
                                    {filteredIdeas.map(idea => <IdeaCard key={idea.id} idea={idea as any} onClick={() => setSelectedIdea(idea)} />)}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-20 border border-dashed border-border rounded-xl">
                                <p className="text-text-muted">No ideas found.</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="generator"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
                    >
                        {/* Config Panel */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="card p-5 space-y-4 sticky top-24">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                                    <Wand2 size={14} /> Configuration
                                </h3>

                                <div>
                                    <label className="text-caption mb-1 block">Platform</label>
                                    <select value={genInput.platform} onChange={e => setGenInput({ ...genInput, platform: e.target.value })} className="input">
                                        {['LinkedIn', 'Twitter/X', 'Instagram', 'YouTube', 'TikTok', 'Blog'].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-caption mb-1 block">Goal</label>
                                    <select value={genInput.goal} onChange={e => setGenInput({ ...genInput, goal: e.target.value })} className="input">
                                        {['Authority / Trust', 'Leads / Sales', 'Education', 'Personal Story', 'Objection Handling'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-caption mb-1 block">Content Pillar / Topic</label>
                                    <input
                                        type="text"
                                        value={genInput.pillar}
                                        onChange={e => setGenInput({ ...genInput, pillar: e.target.value })}
                                        className="input"
                                        placeholder="e.g. AI Automation"
                                    />
                                </div>

                                <div>
                                    <label className="text-caption mb-1 block">Format</label>
                                    <select value={genInput.format} onChange={e => setGenInput({ ...genInput, format: e.target.value })} className="input">
                                        {['Listicle', 'Story / Anecdote', 'Contrarian Take', 'How-to Guide', 'Observation', 'Case Study'].map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !genInput.pillar}
                                    className="btn-primary w-full justify-center mt-4"
                                >
                                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {isGenerating ? 'Analyzing...' : 'Generate 15 Ideas'}
                                </button>
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="lg:col-span-3">
                            {generatedIdeas.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {generatedIdeas.map((idea, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="card p-5 group hover:border-indigo-500/50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">{idea.category}</span>
                                                <button onClick={() => saveGeneratedIdea(idea)} className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 hover:bg-indigo-400/10">
                                                    <Save size={16} />
                                                </button>
                                            </div>
                                            <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-3 leading-tight">{idea.hook}</h3>
                                            <p className="text-sm text-text-secondary mb-3 line-clamp-3">{idea.angle}</p>

                                            <div className="space-y-2 pt-3 border-t border-border/50">
                                                <div className="flex gap-2 text-xs">
                                                    <span className="text-text-muted w-16 uppercase text-[9px] font-bold mt-0.5">Why:</span>
                                                    <span className="text-text-secondary flex-1">{idea.why_it_works}</span>
                                                </div>
                                                <div className="flex gap-2 text-xs">
                                                    <span className="text-text-muted w-16 uppercase text-[9px] font-bold mt-0.5">Trigger:</span>
                                                    <span className="text-text-secondary flex-1">{idea.emotional_trigger}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-xl opacity-50">
                                    <Sparkles size={48} className="text-text-muted mb-4" />
                                    <h3 className="text-lg font-medium text-text-primary">Ready to Ideate</h3>
                                    <p className="text-sm text-text-muted max-w-sm mt-2">Configure your parameters on the left and let the AI generate high-impact ideas for you.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
