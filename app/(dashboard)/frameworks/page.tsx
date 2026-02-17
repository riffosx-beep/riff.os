'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ArrowRight, Star, Play, Layers, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

const FRAMEWORKS = [
    {
        id: 'hormozi',
        name: 'The Hormozi Hook',
        category: 'Viral Growth',
        description: 'A high-converting structure for educational content that creates immediate curiosity.',
        structure: ['Bold Claim', 'Proof of Competence', 'Curiosity/Mechanism'],
        example: "How I made $1M in 30 days (without spending a dollar on ads)...",
        difficulty: 'Beginner'
    },
    {
        id: 'story',
        name: 'The Founder Story Arc',
        category: 'Brand Building',
        description: 'Classic storytelling adapted for social feeds. Perfect for building trust and authority.',
        structure: ['The Before State', 'The Catalyst', 'The Transformation', 'The Lesson'],
        example: "I was $50k in debt and sleeping on a floor. Then I made one decision that changed everything.",
        difficulty: 'Intermediate'
    },
    {
        id: 'contrarian',
        name: 'The Contrarian Take',
        category: 'Engagement',
        description: 'Challenge a commonly held belief to spark debate and drive massive engagement.',
        structure: ['Common Belief', 'Why It\'s Wrong', 'The Truth', 'Evidence'],
        example: "Stop trying to find your niche. It's the worst advice for new creators. Do this instead...",
        difficulty: 'Advanced'
    },
    {
        id: 'listicle',
        name: 'Actionable Listicle',
        category: 'Education',
        description: 'Dense value delivery in a scannable format. High save rates.',
        structure: ['Hook', 'Context', 'List Items (3-7)', 'CTA'],
        example: "7 tools that will replace your marketing agency in 2024:",
        difficulty: 'Beginner'
    },
    {
        id: 'breakdown',
        name: 'The Deconstruction',
        category: 'Analysis',
        description: 'Analyze a successful entity or event to teach a principle.',
        structure: ['The Subject', 'The Result', 'The "How" (3 Steps)', 'The Takeaway'],
        example: "How MrBeast gets 100M views per video (The Psychology of Thumbnails):",
        difficulty: 'Intermediate'
    }
]

export default function FrameworksPage() {
    const router = useRouter()
    const [selected, setSelected] = useState<string | null>(null)

    const handleUse = (id: string) => {
        router.push(`/scripts?framework=${id}`)
    }

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <div className="flex items-end justify-between border-b border-border pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
                        <Layers className="text-accent" size={24} />
                        Framework Library
                    </h1>
                    <p className="text-sm text-text-muted">Proven viral structures. Select a framework to deconstruct it.</p>
                </div>
                <div className="text-[10px] font-mono text-text-muted bg-surface-2 px-2 py-1 rounded border border-border">
                    {FRAMEWORKS.length} TEMPLATES AVAILABLE
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List */}
                <div className="lg:col-span-7 grid gap-4 content-start">
                    {FRAMEWORKS.map((fw, i) => (
                        <motion.button
                            key={fw.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelected(fw.id)}
                            className={`
                                group relative w-full text-left p-5 rounded-xl border transition-all duration-300
                                ${selected === fw.id
                                    ? 'bg-gradient-to-br from-surface to-surface-2 border-accent shadow-lg shadow-accent/5 ring-1 ring-accent/20'
                                    : 'bg-surface border-border hover:border-text-secondary hover:bg-surface-hover'
                                }
                            `}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`
                                        px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border
                                        ${selected === fw.id ? 'bg-accent/10 text-accent border-accent/20' : 'bg-surface-2 text-text-muted border-border'}
                                    `}>
                                        {fw.category}
                                    </span>
                                    {i < 2 && (
                                        <span className="flex items-center gap-1 text-[9px] text-yellow-500 font-bold ml-1">
                                            <Star size={8} fill="currentColor" /> POPULAR
                                        </span>
                                    )}
                                </div>
                                <ArrowRight size={14} className={`transition-all duration-300 ${selected === fw.id ? 'text-accent translate-x-0 opacity-100' : 'text-text-muted -translate-x-2 opacity-0 group-hover:opacity-50'}`} />
                            </div>

                            <h3 className={`text-base font-bold mb-1 transition-colors ${selected === fw.id ? 'text-accent' : 'text-text-primary'}`}>
                                {fw.name}
                            </h3>
                            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed opacity-80">
                                {fw.description}
                            </p>
                        </motion.button>
                    ))}
                </div>

                {/* Details Panel - Sticky */}
                <div className="lg:col-span-5">
                    <div className="sticky top-6">
                        <AnimatePresence mode='wait'>
                            {selected ? (
                                FRAMEWORKS.filter(f => f.id === selected).map(fw => (
                                    <motion.div
                                        key={fw.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="bg-surface border border-border rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5"
                                    >
                                        {/* Header */}
                                        <div className="p-6 border-b border-border bg-gradient-to-br from-surface-2 to-surface">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Sparkles size={14} className="text-accent" />
                                                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">FRAMEWORK ANALYSIS</span>
                                            </div>
                                            <h2 className="text-xl font-bold text-text-primary mb-2">{fw.name}</h2>
                                            <p className="text-sm text-text-secondary leading-relaxed">{fw.description}</p>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            {/* Structure */}
                                            <div className="space-y-3">
                                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                                                    <Layers size={12} />
                                                    Sequence Structure
                                                </h3>
                                                <div className="space-y-2 relative">
                                                    {/* Connecting Line */}
                                                    <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border z-0" />

                                                    {fw.structure.map((step, idx) => (
                                                        <div key={idx} className="relative z-10 flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-bold text-text-muted shadow-sm group-hover:border-accent transition-colors">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="px-3 py-2 rounded-lg bg-surface-2/50 border border-border w-full text-xs font-medium text-text-secondary">
                                                                {step}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Example */}
                                            <div className="space-y-3">
                                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                                                    <BookOpen size={12} />
                                                    Live Example
                                                </h3>
                                                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 text-accent text-sm italic font-medium leading-relaxed">
                                                    "{fw.example}"
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleUse(fw.id)}
                                                className="btn-primary w-full py-3 shadow-lg shadow-accent/20 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                                <span className="flex items-center gap-2 justify-center relative z-10">
                                                    Initialize Framework <Play size={14} fill="currentColor" />
                                                </span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-96 flex flex-col items-center justify-center text-center text-text-muted space-y-4 border border-border border-dashed rounded-xl bg-surface/30">
                                    <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center animate-pulse">
                                        <Layers size={24} className="opacity-50" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-secondary">No framework selected</p>
                                        <p className="text-xs mt-1">Select a framework from the left to view blueprints.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
