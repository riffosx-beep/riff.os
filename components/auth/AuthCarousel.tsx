'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Repeat, Calendar, ShieldCheck } from 'lucide-react'

const SLIDES = [
    {
        id: 1,
        title: "Ideate at Scale",
        subtitle: "The RiffOS Master Engine v3.0 crafts viral scripts in your unique voice.",
        color: "from-purple-600 to-indigo-700",
        icon: Sparkles,
        demo: (
            <div className="relative w-full h-48 bg-black/40 rounded-2xl border border-white/10 p-6 overflow-hidden flex flex-col justify-center">
                <div className="space-y-4">
                    <div className="h-2 w-full bg-accent/20 rounded-full overflow-hidden">
                        <motion.div initial={{ x: "-100%" }} animate={{ x: "0%" }} transition={{ duration: 2, repeat: Infinity }} className="h-full w-1/2 bg-accent" />
                    </div>
                    <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                    <div className="h-2 w-full bg-white/10 rounded-full" />
                </div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 bg-accent px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest"
                >
                    Generating...
                </motion.div>
            </div>
        )
    },
    {
        id: 2,
        title: "The Remix Engine",
        subtitle: "One script. 10+ distributions. LinkedIn, Twitter, and beyond.",
        color: "from-pink-600 to-rose-700",
        icon: Repeat,
        demo: (
            <div className="relative w-full h-48 bg-black/40 rounded-2xl border border-white/10 p-6 flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center">
                    <span className="font-bold text-accent italic">S</span>
                </div>
                <ArrowRight className="text-white/20" />
                <div className="flex flex-col gap-2">
                    <div className="w-24 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center px-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                        <span className="text-[6px] font-bold uppercase">Twitter</span>
                    </div>
                    <div className="w-24 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center px-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
                        <span className="text-[6px] font-bold uppercase">LinkedIn</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: "Command Center",
        subtitle: "The most advanced calendar for founder-led content brands.",
        color: "from-blue-600 to-cyan-700",
        icon: Calendar,
        demo: (
            <div className="relative w-full h-48 bg-black/40 rounded-2xl border border-white/10 p-4 grid grid-cols-4 gap-2">
                {Array(12).fill(0).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`h-8 rounded-lg border ${i === 5 ? 'bg-accent border-accent shadow-lg shadow-accent/20' : 'bg-white/5 border-white/5'}`}
                    />
                ))}
            </div>
        )
    },
    {
        id: 4,
        title: "Enterprise Grade",
        subtitle: "Secure. Private. Professional. Built for serious creators.",
        color: "from-slate-800 to-black",
        icon: ShieldCheck,
        demo: (
            <div className="relative w-full h-48 flex items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-accent blur-3xl opacity-20 scale-150" />
                    <ShieldCheck size={80} className="text-accent relative z-10" />
                </div>
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
        <div className="hidden lg:flex flex-col justify-between h-full w-full bg-[#050505] relative overflow-hidden p-20 text-white">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${SLIDES[index].color} opacity-20 transition-all duration-1000 blur-[100px]`} />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center max-w-md mx-auto w-full">
                <div className="mb-16">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -30 }}
                            transition={{ duration: 0.6, type: "spring" }}
                            className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative group"
                        >
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/40">
                                {React.createElement(SLIDES[index].icon, { size: 24, className: "text-white" })}
                            </div>
                            {SLIDES[index].demo}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-5xl font-black tracking-tighter mb-4 text-white uppercase italic">{SLIDES[index].title}</h2>
                            <p className="text-xl text-gray-400 font-medium leading-relaxed">{SLIDES[index].subtitle}</p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Indicators */}
                    <div className="flex gap-3 pt-4">
                        {SLIDES.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-12 bg-accent' : 'w-4 bg-white/20'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-2 opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Neural Engine v3 Active</span>
            </div>
        </div>
    )
}

import { ArrowRight } from 'lucide-react'
