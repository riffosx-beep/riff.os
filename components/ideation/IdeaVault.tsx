'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Search,
    Filter,
    Plus,
    Sparkles,
    Loader2,
    MoreVertical,
    Copy,
    Check,
    Tag,
    Clock,
    ArrowRight,
    Maximize2
} from 'lucide-react'
import { motion } from 'framer-motion'
import VaultItemModal from '@/components/VaultItemModal'

interface VaultItem {
    id: string
    title: string
    content: string
    type: string
    platform?: string
    status: string
    created_at: string
}

export default function IdeaVault({ onSelect }: { onSelect?: (item: VaultItem) => void }) {
    const [items, setItems] = useState<VaultItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState('all')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null)

    useEffect(() => {
        fetchItems()
    }, [])

    async function fetchItems() {
        setLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase
            .from('vault')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setItems(data)
        setLoading(false)
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filter === 'all' || item.type === filter
        return matchesSearch && matchesFilter
    })

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="flex flex-col h-full bg-surface-2/30 rounded-xl border border-border overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-border bg-surface/50 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search your vault..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-xs focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-surface border border-border rounded-lg px-3 py-2 text-[10px] font-bold tracking-wider uppercase text-text-muted outline-none focus:border-accent"
                    >
                        <option value="all">ALL TYPES</option>
                        <option value="script">SCRIPTS</option>
                        <option value="hook">HOOKS</option>
                        <option value="idea">IDEAS</option>
                    </select>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-50">
                        <Loader2 size={24} className="animate-spin text-accent mb-2" />
                        <p className="text-xs">Loading vault...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-50 text-center px-6">
                        <p className="text-sm font-medium mb-1">No items found</p>
                        <p className="text-[10px]">Try adjusting your search or start creating something new.</p>
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface border border-border/50 rounded-xl p-4 hover:border-accent/50 transition-all group relative"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${item.type === 'script' ? 'bg-blue-500/10 text-blue-400' :
                                            item.type === 'hook' ? 'bg-pink-500/10 text-pink-400' :
                                                'bg-accent/10 text-accent'
                                            }`}>
                                            {item.type}
                                        </span>
                                        <span className="text-[10px] text-text-muted flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                                        {item.title}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setSelectedItem(item)}
                                        className="p-1.5 hover:bg-surface-2 rounded-md text-text-muted transition-colors"
                                        title="Expand & Edit"
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleCopy(item.content, item.id)}
                                        className="p-1.5 hover:bg-surface-2 rounded-md text-text-muted transition-colors"
                                    >
                                        {copiedId === item.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                                {item.content}
                            </p>

                            <button
                                onClick={() => onSelect?.(item)}
                                className="mt-4 w-full py-2 bg-surface-2 hover:bg-accent hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                            >
                                Send to Studio <ArrowRight size={12} />
                            </button>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Footer / Quick Actions */}
            <div className="p-4 bg-surface/50 border-t border-border flex items-center justify-between">
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">
                    {filteredItems.length} ITEMS STORED
                </p>
                <div className="flex items-center gap-2">
                    <button className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1">
                        <Sparkles size={10} /> AI RECOMMEND
                    </button>
                </div>
            </div>

            <VaultItemModal
                item={selectedItem}
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                onUpdate={fetchItems}
            />
        </div>
    )
}
