'use client'

import React from 'react'
import { Flame, Shield, TrendingUp } from 'lucide-react'

interface StreakDisplayProps {
    currentStreak: number
    bestStreak: number
    heatmapData: ('posted' | 'missed' | 'today' | 'future' | 'empty')[]
    hasStreakFreeze?: boolean
}

export default function StreakDisplay({ currentStreak, bestStreak, heatmapData, hasStreakFreeze = false }: StreakDisplayProps) {
    const streakLevel = currentStreak >= 30 ? 'Legendary' : currentStreak >= 14 ? 'On Fire' : currentStreak >= 7 ? 'Building' : currentStreak >= 1 ? 'Started' : 'Dead'
    const streakLevelColor = currentStreak >= 30 ? 'text-amber-500' : currentStreak >= 14 ? 'text-orange-500' : currentStreak >= 7 ? 'text-blue-500' : 'text-text-muted'

    return (
        <div className="glass-card overflow-hidden">
            {/* Top section: Streak Counter */}
            <div className="p-6 flex items-center gap-6">
                {/* Flame + Number */}
                <div className="flex items-center gap-4">
                    <div className="streak-flame">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-500 flex items-center justify-center shadow-lg relative">
                            <Flame size={26} className="text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <div className="streak-counter">{currentStreak}</div>
                        <p className="text-xs text-text-muted font-medium -mt-0.5">day streak</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-12 bg-border" />

                {/* Stats */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-0.5">Best Streak</p>
                        <p className="text-lg font-bold text-text-primary flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-accent" />
                            {bestStreak} days
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-0.5">Status</p>
                        <p className={`text-lg font-bold ${streakLevelColor} flex items-center gap-1.5`}>
                            {hasStreakFreeze && <Shield size={14} className="text-accent" />}
                            {streakLevel}
                        </p>
                    </div>
                </div>

                {/* Streak Freeze Badge */}
                {hasStreakFreeze && (
                    <div className="badge badge-purple text-xs py-1 px-3 flex items-center gap-1.5">
                        <Shield size={12} />
                        Freeze Available
                    </div>
                )}
            </div>

            {/* Heatmap Row */}
            <div className="px-6 pb-5">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Last 30 Days</p>
                <div className="grid grid-cols-30 gap-[3px]" style={{ gridTemplateColumns: 'repeat(30, 1fr)' }}>
                    {heatmapData.map((status, i) => (
                        <div
                            key={i}
                            className={`streak-heatmap-cell ${status}`}
                            title={`Day ${i + 1}: ${status}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
