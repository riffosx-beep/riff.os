'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutGrid,
    Sparkles,
    Calendar,
    Settings,
    LogOut,
    ChevronDown,
    Repeat,
    Sun,
    Moon,
    Search,
    Bell,
    GitPullRequest,
    Database,
    Target,
    BookOpen
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import FeedbackModal from './FeedbackModal'

const NAV_ITEMS = [
    {
        id: 'dashboard',
        label: 'HOME',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        id: 'pipeline',
        label: 'PIPELINE',
        href: '/pipeline',
        icon: GitPullRequest,
    },
    {
        id: 'ideation',
        label: 'IDEATION',
        href: '/ideation',
        icon: Sparkles,
    },
    {
        id: 'repurposing',
        label: 'REPURPOSING',
        href: '/repurposing',
        icon: Repeat,
    },
    {
        id: 'scheduling',
        label: 'SCHEDULING',
        href: '/scheduling',
        icon: Calendar,
    },
    {
        id: 'playbook',
        label: 'PERSONALIZATION',
        href: '/playbook',
        icon: Zap
    }
]

export default function PremiumNav({ userName }: { userName?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')

    React.useEffect(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark'
        if (saved) {
            setTheme(saved)
            document.documentElement.setAttribute('data-theme', saved)
        } else {
            const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            setTheme(system)
            document.documentElement.setAttribute('data-theme', system)
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('theme', newTheme)
    }

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    const [showFeedback, setShowFeedback] = useState(false)

    return (
        <>
            <nav className="w-full bg-surface border-b border-border sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">

                    {/* Left: Brand & Mobile Title */}
                    <div className="flex items-center gap-6 flex-1">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <span className="font-bold text-lg tracking-tight text-text-primary">
                                RiffOS <span className="ml-1 text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded border border-accent/20 align-top uppercase tracking-widest hidden xs:inline-block">Beta</span>
                            </span>
                        </Link>

                        <div className="max-w-[240px] w-full hidden lg:block">
                            <div className="relative group/search">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within/search:text-accent" />
                                <input
                                    type="text"
                                    placeholder="Search RiffOS..."
                                    className="w-full bg-surface-2/50 border border-border rounded-lg pl-9 pr-12 py-2 text-[11px] text-text-primary focus:outline-none focus:border-accent transition-all placeholder:text-text-muted/50"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <span className="text-[9px] font-bold text-text-muted bg-surface border border-border rounded px-1.5 py-0.5 tracking-tighter opacity-60">⌘K</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center: Main Navigation (Desktop Only) */}
                    <div className="hidden min-[1100px]:flex items-center gap-1 h-full">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    id={`nav-${item.id}`}
                                    className={`
                                        relative px-4 h-16 flex items-center gap-2 transition-all duration-300 border-b-2
                                        ${isActive ? 'text-accent border-accent' : 'text-text-muted border-transparent hover:text-text-primary'}
                                    `}
                                >
                                    <span className="text-[10px] font-bold tracking-[0.1em] uppercase flex items-center gap-2">
                                        <item.icon size={14} />
                                        {item.label}
                                        {item.id === 'playbook' && (
                                            <span className="ml-1 text-[8px] bg-accent text-white px-1.5 py-0.5 rounded-full font-black animate-pulse">CORE</span>
                                        )}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right side: Tools & Profile */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <button
                            onClick={() => setShowFeedback(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-border hover:border-accent/50 rounded-lg text-[10px] font-bold text-text-muted hover:text-text-primary transition-all mr-1 md:mr-2"
                        >
                            <Sparkles size={12} className="text-accent" />
                            FEEDBACK
                        </button>

                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('start-product-tour'))}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-accent hover:bg-accent/5 border border-transparent hover:border-accent/20 transition-all"
                            title="Restart System Tour"
                        >
                            <Target size={18} />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-all"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <div className="relative ml-1 md:ml-2">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-accent/20 hover:scale-105 transition-transform"
                            >
                                {userName?.[0] || 'T'}
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-full mt-4 w-56 bg-surface border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden py-1 z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-border bg-surface-2/30">
                                            <p className="text-xs font-bold text-text-primary">{userName || 'Taufiq'}</p>
                                            <p className="text-[10px] text-text-muted font-medium">RIFFOS MEMBER</p>
                                        </div>
                                        <div className="p-1">
                                            <button className="w-full text-left px-3 py-2 text-[11px] font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary rounded-lg flex items-center gap-2 transition-colors">
                                                <Settings size={14} /> Account Settings
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-500/5 rounded-lg flex items-center gap-2 transition-colors"
                                            >
                                                <LogOut size={14} /> Log Out System
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <nav className="min-[1100px]:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border z-50 px-2 flex items-center justify-around safe-bottom">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                                flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all duration-300
                                ${isActive ? 'text-accent bg-accent/5' : 'text-text-muted hover:text-text-primary'}
                            `}
                        >
                            <item.icon size={18} />
                            <span className="text-[9px] font-bold tracking-tight uppercase">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
            <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />
            <style jsx global>{`
                @media (max-width: 1100px) {
                    main {
                        padding-bottom: 80px !important;
                    }
                }
            `}</style>
        </>
    )
}
