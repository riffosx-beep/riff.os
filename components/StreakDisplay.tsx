'use client'

import React from 'react'
import { Flame, Shield, TrendingUp, Calendar } from 'lucide-react'

interface StreakDisplayProps {
    currentStreak: number
    bestStreak: number
    heatmapData: ('posted' | 'missed' | 'today' | 'future' | 'empty')[]
    hasStreakFreeze?: boolean
}

export default function StreakDisplay({ currentStreak, bestStreak, heatmapData, hasStreakFreeze = false }: StreakDisplayProps) {
    return (
        <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Flame + Counter */}
            <div className="flex items-center gap-5 shrink-0">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 ${currentStreak > 0
                        ? 'bg-gradient-to-br from-orange-400 to-red-600 shadow-orange-500/40 animate-pulse'
                        : 'bg-surface-2 border border-border grayscale'
                    }`}>
                    <Flame size={32} className={`text-white ${currentStreak > 0 ? 'fill-white' : ''}`} />
                </div>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-text-primary tracking-tighter leading-none">
                            {currentStreak}
                        </span>
                    </div>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1">day streak</p>
                </div>
            </div>

            {/* Stats Column */}
            <div className="flex items-center gap-8 pl-8 border-l border-border/50 shrink-0">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <TrendingUp size={10} /> Personal Best
                    </span>
                    <span className="text-lg font-bold text-text-primary tabular-nums">{bestStreak} days</span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Calendar size={10} /> Status
                    </span>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full border-2 ${currentStreak > 0 ? 'bg-orange-500 border-orange-200' : 'border-text-muted'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${currentStreak > 0 ? 'text-orange-500' : 'text-text-muted'}`}>
                            {currentStreak > 0 ? 'ON FIRE' : 'INACTIVE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Heatmap Section */}
            <div className="flex-1 flex flex-col pl-4 w-full">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Consistency Heatmap</span>
                    <span className="text-[8px] font-medium text-text-muted uppercase tracking-widest">Last 14 Days</span>
                </div>
                <div className="flex gap-2 w-full justify-between">
                    {heatmapData.map((status, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div
                                className={`w-full aspect-square rounded-lg border transition-all duration-300 ${status === 'posted'
                                        ? 'bg-accent border-accent shadow-lg shadow-accent/20'
                                        : 'bg-surface-2 border-border opacity-30 shadow-inner'
                                    }`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
