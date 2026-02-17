'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Lightbulb,
    FileText,
    Zap,
    BarChart3,
    Settings,
    Calendar,
    Layers,
    Archive,
    BookOpen,
} from 'lucide-react'

const items = [
    { href: '/home', label: 'Home', icon: LayoutDashboard },
    { href: '/ideas', label: 'Idea Vault', icon: Lightbulb },
    { href: '/scripts', label: 'Script Builder', icon: FileText },
    { href: '/frameworks', label: 'Frameworks', icon: BookOpen },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/performance', label: 'Performance', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export default function CommandPalette() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const filtered = query.trim()
        ? items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
        : items

    const select = useCallback((href: string) => {
        setOpen(false)
        setQuery('')
        router.push(href)
    }, [router])

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setOpen(p => !p)
                setQuery('')
                setActiveIndex(0)
            }
            if (e.key === 'Escape' && open) setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 30)
    }, [open])

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && filtered[activeIndex]) {
            e.preventDefault()
            select(filtered[activeIndex].href)
        }
    }

    useEffect(() => { setActiveIndex(0) }, [query])

    if (!open) return null

    return (
        <div className="command-overlay" onClick={() => setOpen(false)}>
            <div className="command-box" onClick={e => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Go to..."
                    className="command-input"
                />
                <div className="command-results">
                    {filtered.map((item, i) => {
                        const Icon = item.icon
                        return (
                            <div
                                key={item.href}
                                className={`command-item ${i === activeIndex ? 'active' : ''}`}
                                onClick={() => select(item.href)}
                                onMouseEnter={() => setActiveIndex(i)}
                            >
                                <Icon size={14} className="text-text-muted" />
                                <span>{item.label}</span>
                            </div>
                        )
                    })}
                    {filtered.length === 0 && (
                        <p className="text-caption text-center py-6">No results</p>
                    )}
                </div>
            </div>
        </div>
    )
}
