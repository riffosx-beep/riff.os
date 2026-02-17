'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Search, Bell, User } from 'lucide-react'

export default function TopBar({ userName }: { userName?: string }) {
    return (
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-sm z-30 px-6 flex items-center justify-between shrink-0">
            {/* Search Trigger */}
            <button
                onClick={() => {
                    window.dispatchEvent(new KeyboardEvent('keydown', {
                        key: 'k',
                        ctrlKey: true,
                        bubbles: true,
                    }))
                }}
                className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text-primary hover:border-text-muted transition-all w-64 group shadow-sm"
            >
                <Search size={14} className="group-hover:text-text-primary transition-colors" />
                <span className="text-xs font-medium">Search ideas, scripts...</span>
                <kbd className="ml-auto text-[10px] bg-surface-2 px-1.5 py-0.5 rounded border border-border font-mono text-text-muted">⌘K</kbd>
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
                <button className="relative p-2 text-text-muted hover:text-text-primary transition-colors hover:bg-surface-hover rounded-full">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                </button>

                <div className="h-6 w-px bg-border mx-1" />

                <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface-hover transition-colors border border-transparent hover:border-border">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                        {userName?.[0] || 'A'}
                    </div>
                </button>
            </div>
        </header>
    )
}
