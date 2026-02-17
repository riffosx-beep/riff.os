'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutGrid,
    Sparkles,
    Layers,
    Calendar,
    Settings,
    LogOut,
    ChevronDown,
    Zap,
    Repeat
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
    {
        id: 'ideation',
        label: 'IDEATION',
        href: '/ideation',
        icon: Sparkles,
        desc: 'Create & Script'
    },
    {
        id: 'repurposing',
        label: 'REPURPOSING',
        href: '/repurposing',
        icon: Repeat,
        desc: 'Remix & Adapt'
    },
    {
        id: 'scheduling',
        label: 'SCHEDULING',
        href: '/scheduling',
        icon: Calendar,
        desc: 'Plan & Publish'
    },
]

export default function PremiumNav({ userName }: { userName?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <nav className="w-full bg-surface/50 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo Area */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                        <span className="font-bold text-white text-lg">R</span>
                    </div>
                    <span className="font-bold text-lg tracking-tight hidden md:block text-text-primary">
                        RiffOS.
                    </span>
                </div>

                {/* Centered Pillars */}
                <div className="flex items-center gap-1 bg-surface-2/50 p-1 rounded-full border border-border">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`
                                    relative px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300
                                    ${isActive ? 'text-white' : 'text-text-secondary hover:text-text-primary'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-accent rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2 text-xs font-bold tracking-wider">
                                    <item.icon size={14} />
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {/* User & Settings */}
                <div className="flex items-center gap-4">
                    <button className="text-text-muted hover:text-text-primary transition-colors">
                        <Settings size={18} />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-border bg-surface hover:bg-surface-hover transition-all"
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent to-pink-500 flex items-center justify-center text-[10px] text-white font-bold">
                                {userName?.[0] || 'U'}
                            </div>
                            <ChevronDown size={14} className="text-text-muted" />
                        </button>

                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl overflow-hidden py-1"
                                >
                                    <div className="px-4 py-3 border-b border-border">
                                        <p className="text-xs font-bold text-text-primary">{userName}</p>
                                        <p className="text-[10px] text-text-muted">Pro Plan</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-xs text-danger hover:bg-danger-bg flex items-center gap-2"
                                    >
                                        <LogOut size={12} /> Log Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    )
}
