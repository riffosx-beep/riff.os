'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight,
    X,
    Sparkles,
    Zap,
    Target,
    Layout,
    Calendar,
    GitPullRequest,
    CheckCircle2,
    ArrowRight
} from 'lucide-react'

interface TourStep {
    targetId: string
    title: string
    content: string
    icon: any
    position?: 'bottom' | 'top' | 'left' | 'right' | 'center'
}

const TOUR_STEPS: TourStep[] = [
    {
        targetId: 'welcome',
        title: 'Welcome to RiffOS',
        content: 'Your content command center is now online. Let us take you through the core engine.',
        icon: Sparkles,
        position: 'center'
    },
    {
        targetId: 'nav-pipeline',
        title: 'The Pipeline',
        content: 'Channel your content flow. Move ideas to scripts and scripts to distribution seamlessly.',
        icon: GitPullRequest,
        position: 'bottom'
    },
    {
        targetId: 'nav-ideation',
        title: 'Content Studio',
        content: 'Where raw ideas become viral scripts using the RiffOS Master Brain.',
        icon: Sparkles,
        position: 'bottom'
    },
    {
        targetId: 'nav-scheduling',
        title: 'Master Calendar',
        content: 'Plan and automate your distributions across LinkedIn, X, and beyond.',
        icon: Calendar,
        position: 'bottom'
    },
    {
        targetId: 'dashboard-streak',
        title: 'Consistency Engine',
        content: 'Your day streak and heatmap. Post daily to keep the fire burning.',
        icon: Zap,
        position: 'bottom'
    },
    {
        targetId: 'dashboard-stats',
        title: 'Live Intelligence',
        content: 'Real-time analytics of your content bank and scheduled distributions.',
        icon: Target,
        position: 'top'
    }
]

export default function ProductTour() {
    const [active, setActive] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 })
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        // Check if first time
        const completed = localStorage.getItem('riffos_tour_completed')
        if (!completed) {
            setTimeout(() => setActive(true), 1500)
        }

        // Listen for restart event
        const handleStart = () => {
            setCurrentStep(0)
            setActive(true)
        }
        window.addEventListener('start-product-tour', handleStart)

        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        window.addEventListener('resize', handleResize)
        handleResize()

        return () => {
            window.removeEventListener('start-product-tour', handleStart)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        if (!active) return

        const step = TOUR_STEPS[currentStep]
        if (step.position === 'center') {
            setCoords({ top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0 })
            return
        }

        const el = document.getElementById(step.targetId)
        if (el) {
            const rect = el.getBoundingClientRect()
            setCoords({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            })
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else {
            // Target not found on this page? Skip it
            if (currentStep < TOUR_STEPS.length - 1) {
                setCurrentStep(currentStep + 1)
            } else {
                handleEndTour()
            }
        }
    }, [active, currentStep, windowSize])

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleEndTour()
        }
    }

    const handleEndTour = () => {
        setActive(false)
        localStorage.setItem('riffos_tour_completed', 'true')
    }

    if (!active) return null

    const step = TOUR_STEPS[currentStep]
    const isCenter = step.position === 'center'

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Dark Overlay with Hole */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
                onClick={handleEndTour}
                style={{
                    clipPath: isCenter ? 'none' : `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
                }}
            />

            {/* Step Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        top: isCenter ? '50%' : step.position === 'bottom' ? coords.top + coords.height + 20 : coords.top - 20,
                        left: isCenter ? '50%' : coords.left + (coords.width / 2),
                        translateX: '-50%',
                        translateY: isCenter ? '-50%' : step.position === 'top' ? '-100%' : '0'
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="absolute bg-surface border border-border rounded-[2rem] p-8 shadow-3xl w-full max-w-sm pointer-events-auto"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            {React.createElement(step.icon, { size: 24 })}
                        </div>
                        <button onClick={handleEndTour} className="p-2 hover:bg-surface-2 rounded-full transition-colors text-text-muted">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-2 mb-8">
                        <h3 className="text-xl font-bold text-text-primary tracking-tight">{step.title}</h3>
                        <p className="text-sm text-text-secondary leading-relaxed">{step.content}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                            {TOUR_STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-6 bg-accent' : 'w-2 bg-border'}`}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleEndTour}
                                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleNext}
                                className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-accent/20 transition-all active:scale-95"
                            >
                                {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Target Highlight Ring */}
            {!isCenter && (
                <motion.div
                    animate={{
                        top: coords.top - 4,
                        left: coords.left - 4,
                        width: coords.width + 8,
                        height: coords.height + 8,
                        opacity: 1
                    }}
                    className="absolute rounded-lg border-2 border-accent/50 shadow-[0_0_20px_rgba(124,58,237,0.3)] pointer-events-none"
                    transition={{ type: "spring", damping: 15 }}
                />
            )}
        </div>
    )
}
