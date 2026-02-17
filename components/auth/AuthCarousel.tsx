'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Edit, BarChart3, Users } from 'lucide-react'

const SLIDES = [
    {
        id: 1,
        title: "Never lose an idea again",
        subtitle: "Capture thoughts instantly. AI organizes automatically.",
        color: "from-purple-500 to-indigo-500",
        icon: Lightbulb,
        demo: (
            <div className="relative w-full h-48 bg-surface/50 rounded-xl border border-white/10 p-4 overflow-hidden">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-4 left-4 right-12 h-8 bg-white/10 rounded-lg"
                />
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute top-16 left-4 right-24 h-8 bg-white/10 rounded-lg"
                />
                <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="absolute bottom-4 right-4 bg-accent text-white p-2 rounded-lg text-xs font-bold shadow-lg"
                >
                    Sorted!
                </motion.div>
            </div>
        )
    },
    {
        id: 2,
        title: "Viral scripts in 60 seconds",
        subtitle: "AI writes in YOUR voice. Not generic ChatGPT.",
        color: "from-blue-500 to-cyan-500",
        icon: Edit,
        demo: (
            <div className="relative w-full h-48 bg-surface/50 rounded-xl border border-white/10 p-6 flex flex-col gap-3 font-mono text-[10px] text-text-muted">
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    className="h-2 bg-text-primary/20 rounded truncate overflow-hidden"
                />
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "80%" }}
                    transition={{ duration: 1.2, delay: 1.5, ease: "linear" }}
                    className="h-2 bg-text-primary/20 rounded truncate overflow-hidden"
                />
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 1.4, delay: 2.7, ease: "linear" }}
                    className="h-2 bg-text-primary/20 rounded truncate overflow-hidden"
                />
            </div>
        )
    },
    {
        id: 3,
        title: "Know what works",
        subtitle: "Track every post. Double down on winners.",
        color: "from-emerald-500 to-teal-500",
        icon: BarChart3,
        demo: (
            <div className="relative w-full h-48 bg-surface/50 rounded-xl border border-white/10 p-4 flex items-end gap-2">
                {[40, 65, 30, 85, 50].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className={`flex-1 rounded-t-lg ${i === 3 ? 'bg-accent' : 'bg-white/10'}`}
                    />
                ))}
            </div>
        )
    },
    {
        id: 4,
        title: "Join 500+ founders",
        subtitle: "The OS of choice for high-growth creators.",
        color: "from-orange-500 to-red-500",
        icon: Users,
        demo: (
            <div className="relative w-full h-48 flex flex-col justify-center gap-3">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-surface/80 backdrop-blur p-3 rounded-lg border border-white/10 text-xs"
                >
                    "Changed my writing workflow forever."
                </motion.div>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface/80 backdrop-blur p-3 rounded-lg border border-white/10 text-xs self-end"
                >
                    "10k followers in 3 months."
                </motion.div>
            </div>
        )
    }
]

export default function AuthCarousel() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % SLIDES.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="hidden lg:flex flex-col justify-between h-full w-full bg-surface-2 relative overflow-hidden p-12 text-white">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${SLIDES[index].color} opacity-10 transition-colors duration-1000`} />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center max-w-md mx-auto">
                <div className="mb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
                        >
                            {SLIDES[index].demo}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="flex items-center gap-3 mb-2 text-white/80">
                                {React.createElement(SLIDES[index].icon, { size: 20 })}
                                <span className="text-sm font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-white/10">Feature {index + 1}</span>
                            </div>
                            <h2 className="text-4xl font-bold tracking-tight mb-2 text-white shadow-black/50 drop-shadow-sm">{SLIDES[index].title}</h2>
                            <p className="text-lg text-white/70">{SLIDES[index].subtitle}</p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Indicators */}
            <div className="relative z-10 flex gap-2 justify-center">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                    />
                ))}
            </div>
        </div>
    )
}
