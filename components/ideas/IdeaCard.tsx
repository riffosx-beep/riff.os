'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MoreHorizontal, Star, Calendar } from 'lucide-react'

export interface IdeaItem {
    id: string
    title: string
    content: string
    tags: string[]
    createdAt: string
    source: 'voice' | 'text' | 'web'
    isFavorite: boolean
}

interface IdeaCardProps {
    idea: IdeaItem
    onClick: () => void
}

export default function IdeaCard({ idea, onClick }: IdeaCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' }}
            onClick={onClick}
            className="group relative bg-surface border border-border hover:border-text-muted rounded-xl p-5 cursor-pointer flex flex-col gap-3 transition-all break-inside-avoid mb-4"
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-text-primary text-sm leading-tight line-clamp-2 pr-6">
                    {idea.title}
                </h3>
                <button className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary transition-opacity absolute top-4 right-4">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed mb-4">
                {idea.content}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
                {idea.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-surface-2 px-1.5 py-0.5 rounded text-text-muted border border-border">
                        #{tag}
                    </span>
                ))}
            </div>

            <div className="flex justify-between items-center text-[10px] text-text-muted mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>{idea.createdAt}</span>
                </div>
                {idea.isFavorite && <Star size={10} className="text-yellow-500 fill-yellow-500" />}
            </div>
        </motion.div>
    )
}
