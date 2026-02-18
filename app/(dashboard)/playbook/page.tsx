'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Zap,
    Target,
    BookOpen,
    MessageSquare,
    Twitter,
    Linkedin,
    ArrowRight,
    Sparkles,
    Shield,
    TrendingUp,
    ChevronRight,
    Play
} from 'lucide-react'

const PLAYBOOK_MODULES = [
    {
        id: 'hook',
        title: 'The Viral Hook Memory',
        description: 'Your system for stopping the scroll.',
        icon: Zap,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        content: [
            { title: 'The "Shock & Awe"', body: 'Start with a contrarian truth. "Most founders are doing X, but the winners do Y."' },
            { title: 'The "Curiosity Gap"', body: 'Open a loop that can only be closed by reading the full post.' },
            { title: 'The "Outcome First"', body: 'State the result immediately. "How I gained 10k followers in 30 days."' }
        ]
    },
    {
        id: 'linkedin',
        title: 'LinkedIn Authority System',
        description: 'Building deep trust with founders.',
        icon: Linkedin,
        color: 'text-blue-600',
        bg: 'bg-blue-600/10',
        content: [
            { title: 'The "Hard Lessons" Format', body: 'Share a failure from last week. Use the "Mistake -> Insight -> Action" structure.' },
            { title: 'The "System Breakdown"', body: 'A step-by-step guide to how you solve a specific problem.' },
            { title: 'The "Personal Belief"', body: 'A post about why you do what you do. High emotional resonance.' }
        ]
    },
    {
        id: 'twitter',
        title: 'X/Twitter Velocity Engine',
        description: 'Maximum distribution and reach.',
        icon: Twitter,
        color: 'text-sky-500',
        bg: 'bg-sky-500/10',
        content: [
            { title: 'The Thread Starter', body: 'A 10-tweet breakdown of a complex topic. Use high-impact headers.' },
            { title: 'The Visual Teaser', body: 'Screenshot of your dashboard or result with a single line of text.' },
            { title: 'The Punchy Insight', body: 'Less than 100 characters. Pure value, highly shareable.' }
        ]
    }
]

export default function PlaybookPage() {
    const [activeModule, setActiveModule] = useState(PLAYBOOK_MODULES[0].id)

    return (
        <div className="max-w-[1200px] mx-auto space-y-12 pb-20 p-6">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-accent">
                    <BookOpen size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">CREATOR PLAYBOOK v1.0</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">Institutional Memory.</h1>
                <p className="text-xl text-text-secondary max-w-2xl font-medium leading-relaxed italic">
                    This is your personalized execution system. Not a chat prompt — but a hard-coded structure for your unique voice and market.
                </p>
            </div>

            <div className="grid lg:grid-cols-[350px_1fr] gap-12 items-start">
                {/* Sidebar Nav */}
                <div className="space-y-4 sticky top-8">
                    {PLAYBOOK_MODULES.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setActiveModule(m.id)}
                            className={`
                                w-full p-6 rounded-3xl border text-left transition-all duration-300 group
                                ${activeModule === m.id
                                    ? 'bg-surface border-accent shadow-xl shadow-accent/10'
                                    : 'bg-surface/40 border-border hover:border-text-muted'}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center ${m.color}`}>
                                    <m.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-text-primary uppercase tracking-tight">{m.title}</h3>
                                    <p className="text-[10px] text-text-muted font-medium mt-0.5">{m.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}

                    <div className="p-8 bg-gradient-to-br from-accent to-purple-600 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-accent/20">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg leading-tight uppercase italic tracking-tighter">Growth Breakdown</h4>
                            <p className="text-[11px] opacity-80 leading-relaxed font-bold uppercase tracking-widest">Available every Sunday at 08:00 AM</p>
                        </div>
                        <button className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                            <Play size={14} className="fill-black" /> WATCH VIDEO SUMMARY
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeModule}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {PLAYBOOK_MODULES.find(m => m.id === activeModule)?.content.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-surface border border-border rounded-[2.5rem] p-10 space-y-6 hover:border-accent transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                                            0{idx + 1}
                                        </div>
                                        <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">{item.title}</h3>
                                    </div>
                                    <Sparkles size={20} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-8 bg-surface-2/50 rounded-3xl border border-dashed border-border group-hover:border-accent/20 transition-colors">
                                    <p className="text-lg text-text-secondary leading-relaxed font-medium italic">
                                        "{item.body}"
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.2em] pt-4">
                                    <Shield size={14} /> SYSTEM LOCKED FOR YOUR VOICE
                                </div>
                            </div>
                        ))}

                        <div className="p-12 border border-dashed border-border rounded-[3rem] text-center space-y-6">
                            <p className="text-text-muted text-sm font-medium">Want to evolve this structure?</p>
                            <h4 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">Feedback Engine</h4>
                            <div className="flex justify-center gap-4">
                                <button className="px-8 py-3 bg-surface border border-border hover:border-accent rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                                    REVISE TONE
                                </button>
                                <button className="px-8 py-3 bg-surface border border-border hover:border-accent rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                                    ADD PLATFORM
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
