'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    LayoutGrid,
    Lightbulb,
    PenTool,
    Layers,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    Database,
    Zap,
    GitPullRequest,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

const MAIN_NAV = [
    { href: '/dashboard', label: 'Command Center', icon: LayoutGrid },
    { href: '/ideas', label: 'Idea Vault', icon: Lightbulb, badge: 12 },
    { href: '/scripts', label: 'Script Builder', icon: PenTool },
    { href: '/hooks', label: 'Hook Optimizer', icon: Zap },
    { href: '/calendar', label: 'Planner', icon: Calendar, badge: 3 },
    { href: '/publish', label: 'Pipeline', icon: GitPullRequest },
    { href: '/vault', label: 'Content Vault', icon: Database },
    { href: '/performance', label: 'Performance', icon: BarChart3 },
]

interface SidebarProps {
    userName?: string
    userEmail?: string
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Handle logout
    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <>
            {/* Mobile Header trigger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-text-muted hover:text-text-primary">
                        <Menu size={20} />
                    </button>
                    <span className="font-bold tracking-tight">RiffOS.</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center">
                    <span className="text-xs font-bold">{userName?.[0]}</span>
                </div>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                initial={false}
                animate={{
                    width: collapsed ? 80 : 260,
                    x: mobileOpen ? 0 : '0%' // On desktop (lg), always 0 check CSS
                }}
                // On mobile it uses fixed positioning + transform. On desktop it should be static/relative in flex.
                style={{ position: undefined }} // Let class classes handle position
                className={`
                    fixed inset-y-0 left-0 z-50
                    lg:static lg:block
                    h-full
                    bg-surface border-r border-border
                    flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Area */}
                <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-6'} border-b border-border`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 bg-text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-surface font-bold text-lg">R.</span>
                        </div>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-bold tracking-tight text-lg truncate"
                            >
                                RiffOS
                            </motion.span>
                        )}
                    </div>
                    {!collapsed && (
                        <div className="flex items-center gap-1">
                            <ThemeToggle />
                            <button onClick={() => setCollapsed(true)} className="text-text-muted hover:text-text-primary lg:block hidden p-2">
                                <ChevronLeft size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Collapsed Expand Button */}
                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="w-full py-4 flex justify-center text-text-muted hover:text-text-primary hidden lg:flex"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {MAIN_NAV.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-text-primary text-text-inverse shadow-lg shadow-black/10'
                                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                            >
                                <item.icon
                                    size={20}
                                    className={`shrink-0 ${isActive ? 'text-text-inverse' : 'text-text-muted group-hover:text-text-primary'}`}
                                />

                                {!collapsed && (
                                    <span className="text-sm font-medium truncate flex-1">
                                        {item.label}
                                    </span>
                                )}

                                {/* Badge */}
                                {item.badge && (
                                    <div className={`
                                        ${collapsed ? 'absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-surface' : 'px-1.5 py-0.5 rounded text-[10px] font-bold'}
                                        ${isActive ? 'bg-white/20 text-white' : 'bg-surface-2 text-text-muted'}
                                    `}>
                                        {!collapsed && item.badge}
                                    </div>
                                )}

                                {collapsed && item.badge && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent ring-2 ring-surface" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-3 border-t border-border space-y-1">
                    <Link
                        href="/settings"
                        className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg
                            text-text-secondary hover:bg-surface-hover hover:text-text-primary
                            transition-colors
                            ${collapsed ? 'justify-center' : ''}
                        `}
                    >
                        <Settings size={20} className="text-text-muted" />
                        {!collapsed && <span className="text-sm font-medium">Settings</span>}
                    </Link>

                    {/* User Profile */}
                    <div className={`mt-4 pt-4 border-t border-border flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2'}`}>
                        <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0">
                            {userName ? userName[0].toUpperCase() : 'U'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{userName || 'User'}</p>
                                <p className="text-[10px] text-text-muted truncate">{userEmail}</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button onClick={handleLogout} className="text-text-muted hover:text-danger p-1">
                                <LogOut size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>
        </>
    )
}
