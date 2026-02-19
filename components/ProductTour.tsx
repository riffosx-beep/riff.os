'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight,
    X,
    Sparkles,
    Zap,
    Layout,
    Calendar,
    GitPullRequest,
    CheckCircle2,
    ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TourStep {
    targetId: string
    title: string
    content: string
    icon: any
    position?: 'bottom' | 'top' | 'left' | 'right' | 'center'
    path?: string
}

const TOUR_STEPS: TourStep[] = [
    {
        targetId: 'welcome',
        title: 'Welcome to RiffOS',
        content: 'Your AI command center is online. To get results that actually sound like you, we need to set up your core engine first.',
        icon: Sparkles,
        position: 'center',
        path: '/dashboard'
    },
    {
        targetId: 'nav-playbook',
        title: '1. Set Your DNA',
        content: 'The MOST important step. Define your niche, audience, and voice here. This data guides EVERY response the AI gives you.',
        icon: Zap,
        position: 'bottom',
        path: '/playbook'
    },
    {
        targetId: 'nav-ideation',
        title: '2. Generate Ideas',
        content: 'Once your DNA is set, use the Content Studio to generate high-impact ideas perfectly tailored to your goals.',
        icon: Sparkles,
        position: 'bottom',
        path: '/ideation'
    },
    {
        targetId: 'nav-pipeline',
        title: '3. Build Your Script',
        content: 'Take your best ideas and turn them into full, ready-to-record scripts inside the Pipeline.',
        icon: GitPullRequest,
        position: 'bottom',
        path: '/pipeline'
    },
    {
        targetId: 'nav-scheduling',
        title: '4. Plan Distribution',
        content: 'Finally, schedule your content to the Master Calendar to build your consistent presence.',
        icon: Calendar,
        position: 'bottom',
        path: '/scheduling'
    }
]

export default function ProductTour() {
    const router = useRouter()
    const [active, setActive] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 })
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const completed = localStorage.getItem('riffos_tour_completed')
        if (!completed) {
            setTimeout(() => setActive(true), 1500)
        }

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

        // If step has a path and we are not on it, navigate
        if (step.path && window.location.pathname !== step.path) {
            router.push(step.path)
            // Wait for navigation and DOM update
            setTimeout(updateHighlight, 500)
        } else {
            updateHighlight()
        }

        function updateHighlight() {
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
                // el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
                // If target not found yet, try again once
                console.log('Target not found yet:', step.targetId)
            }
        }
    }, [active, currentStep, windowSize, router])

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
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
                onClick={handleEndTour}
                style={{
                    clipPath: isCenter ? 'none' : `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
                }}
            />

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
                                {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next Step'}
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {!isCenter && (
                <motion.div
                    animate={{
                        top: coords.top - 4,
                        left: coords.left - 4,
                        width: coords.width + 8,
                        height: coords.height + 8,
                        opacity: 1
                    }}
                    className="absolute rounded-xl border-2 border-accent/50 shadow-[0_0_20px_rgba(124,58,237,0.3)] pointer-events-none"
                    transition={{ type: "spring", damping: 15 }}
                />
            )}
        </div>
    )
}

