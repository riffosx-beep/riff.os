'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MoreHorizontal,
    Image as ImageIcon,
    ExternalLink,
    ArrowRight,
    CheckCircle2,
    Calendar,
    Paperclip,
    Plus,
    X,
    FileText
} from 'lucide-react'

interface PipelineCardProps {
    item: any
    onMove: (targetStage: string) => void
    onAddAsset: (link: string) => void
}

export default function PipelineCard({ item, onMove, onAddAsset }: PipelineCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showAssetInput, setShowAssetInput] = useState(false)
    const [assetUrl, setAssetUrl] = useState('')

    const STAGES = [
        { id: 'idea', label: 'Idea' },
        { id: 'drafting', label: 'Drafting' },
        { id: 'ready', label: 'Ready' },
        { id: 'scheduled', label: 'Scheduled' },
        { id: 'published', label: 'Published' },
    ]

    return (
        <motion.div
            layout
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={() => {
                // To implement full DND across columns would require a parent provider, 
                // but this provides the "feel" and the progress button handles logic.
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-surface border border-border hover:border-text-muted rounded-xl p-4 shadow-sm transition-all cursor-grab active:cursor-grabbing"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${item.stage === 'ready' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    item.stage === 'drafting' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        'bg-surface-2 text-text-muted border-border'
                    }`}>
                    {item.platform || 'General'}
                </span>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-surface-2 transition-colors"
                >
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Title */}
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-tight leading-snug mb-4 line-clamp-2">
                {item.title}
            </h4>

            {/* Assets / Labels */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {item.meta?.thumbnail_url && (
                    <div className="w-full h-20 rounded-lg overflow-hidden bg-surface-2 mb-2 relative group/img border border-border">
                        <img src={item.meta.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                        <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <ImageIcon size={20} className="text-white" />
                        </button>
                    </div>
                )}
                {item.meta?.assets?.map((asset: string, i: number) => (
                    <a key={i} href={asset} target="_blank" rel="noopener noreferrer" className="p-1 px-2 rounded bg-surface-2 border border-border hover:bg-surface-hover transition-colors flex items-center gap-1.5">
                        <Paperclip size={10} className="text-text-muted" />
                        <span className="text-[9px] font-mono text-text-muted truncate max-w-[60px]">asset_{i + 1}</span>
                    </a>
                ))}
                <button
                    onClick={() => setShowAssetInput(true)}
                    className="p-1 px-2 rounded border border-dashed border-border text-text-muted hover:text-text-primary hover:border-text-muted transition-all flex items-center gap-1"
                >
                    <Plus size={10} />
                    <span className="text-[9px] font-bold">LINK</span>
                </button>
            </div>

            {/* Footer / Context */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-3">
                    {item.date && (
                        <div className="flex items-center gap-1 text-[9px] text-text-muted font-mono">
                            <Calendar size={10} />
                            <span>{item.date}</span>
                        </div>
                    )}
                    {item.stage === 'drafting' && (
                        <div className="flex items-center gap-1 text-[9px] text-blue-500 font-bold">
                            <FileText size={10} />
                            <span>WRITING</span>
                        </div>
                    )}
                </div>

                {/* Stage Progresser */}
                <button
                    onClick={() => {
                        const nextIdx = STAGES.findIndex(s => s.id === item.stage) + 1
                        if (nextIdx < STAGES.length) onMove(STAGES[nextIdx].id)
                    }}
                    className="p-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all transform group-hover:scale-110"
                    title="Next Stage"
                >
                    <ArrowRight size={12} />
                </button>
            </div>

            {/* Asset Input Modal-ish Overlay */}
            <AnimatePresence>
                {showAssetInput && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 bg-surface z-20 p-4 border border-accent rounded-xl flex flex-col justify-center gap-3"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold uppercase text-accent">Attach Asset Link</span>
                            <button onClick={() => setShowAssetInput(false)}><X size={12} /></button>
                        </div>
                        <input
                            value={assetUrl}
                            onChange={(e) => setAssetUrl(e.target.value)}
                            className="bg-surface-2 border border-border p-2 rounded text-[10px] outline-none"
                            placeholder="https://..."
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                onAddAsset(assetUrl)
                                setAssetUrl('')
                                setShowAssetInput(false)
                            }}
                            className="btn-primary py-1 h-auto text-[10px]"
                        >
                            ATTACH
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expanded Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-12 right-4 w-40 bg-surface border border-border rounded-lg shadow-xl z-30 overflow-hidden"
                    >
                        {STAGES.map(s => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    onMove(s.id)
                                    setIsMenuOpen(false)
                                }}
                                className={`w-full text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-surface-2 transition-colors ${item.stage === s.id ? 'text-accent' : 'text-text-muted'}`}
                            >
                                Move to {s.label}
                            </button>
                        ))}
                        <div className="h-px bg-border" />
                        <button className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase text-red-500 hover:bg-red-500/10">Delete Card</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
