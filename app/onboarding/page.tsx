'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Target,
    Zap,
    Send,
    CheckCircle2,
    ArrowRight,
    Loader2,
    MessageSquare,
    Users,
    Globe,
    Search
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STEPS = [
    {
        id: 'bottleneck',
        title: 'The Mission Control',
        subtitle: 'What is your #1 content bottleneck right now?',
        options: [
            { id: 'ideas', label: 'Generating high-impact ideas', icon: Zap },
            { id: 'scripts', label: 'Writing high-quality scripts', icon: Sparkles },
            { id: 'consistency', label: 'Maintaining a daily posting habit', icon: Target },
            { id: 'distribution', label: 'Repurposing across platforms', icon: Users }
        ]
    },
    {
        id: 'source',
        title: 'The Connection',
        subtitle: 'How did you hear about the RiffOS signal?',
        options: [
            { id: 'linkedin', label: 'LinkedIn Feed', icon: MessageSquare },
            { id: 'twitter', label: 'Twitter / X', icon: Globe },
            { id: 'referral', label: 'A fellow creator', icon: Users },
            { id: 'search', label: 'Organic search / Article', icon: Search },
            { id: 'other', label: 'Other source', icon: ChevronRight }
        ]
    },
    {
        id: 'expectation',
        title: 'The Vision',
        subtitle: 'What do you expect RiffOS to solve for you in the next 30 days?',
        type: 'textarea'
    }
]

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0)
    const [responses, setResponses] = useState<any>({
        bottleneck: '',
        source: '',
        expectation: ''
    })
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleOptionSelect = (optionId: string) => {
        const step = STEPS[currentStep]
        setResponses({ ...responses, [step.id]: optionId })
        if (currentStep < STEPS.length - 1) {
            setTimeout(() => setCurrentStep(currentStep + 1), 300)
        }
    }

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleSubmit()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            // Update user settings in profiles
            const { error } = await supabase
                .from('profiles')
                .update({
                    settings: {
                        onboarding_completed: true,
                        onboarding_responses: responses,
                        onboarded_at: new Date().toISOString()
                    }
                })
                .eq('id', user.id)

            if (error) throw error

            // Final transition
            setCurrentStep(STEPS.length) // Special state for completion
            setTimeout(() => {
                router.push('/dashboard')
            }, 2500)

        } catch (err) {
            console.error('Onboarding update failed:', err)
            alert('Something went wrong. Redirecting to dashboard...')
            router.push('/dashboard')
        } finally {
            setSubmitting(false)
        }
    }

    const step = STEPS[currentStep]
    const progress = (currentStep / STEPS.length) * 100

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-accent overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 blur-[150px] rounded-full opacity-40" />
                <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full opacity-30" />
            </div>

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-accent shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    {currentStep < STEPS.length ? (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="w-full space-y-12"
                        >
                            <div className="space-y-4 text-center">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-4"
                                >
                                    <span className="w-8 h-[1px] bg-accent/30" />
                                    Phase 0{currentStep + 1}
                                    <span className="w-8 h-[1px] bg-accent/30" />
                                </motion.div>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">{step.title}</h1>
                                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto italic">{step.subtitle}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
                                {step.type === 'textarea' ? (
                                    <div className="col-span-full space-y-6">
                                        <textarea
                                            value={responses.expectation}
                                            onChange={(e) => setResponses({ ...responses, expectation: e.target.value })}
                                            placeholder="Tell us what success looks like..."
                                            className="w-full h-48 bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-lg focus:outline-none focus:border-accent focus:bg-white/[0.05] transition-all resize-none italic"
                                        />
                                        <button
                                            onClick={handleNext}
                                            disabled={!responses.expectation.trim() || submitting}
                                            className="w-full h-16 bg-white text-black hover:bg-accent hover:text-white rounded-2xl font-black tracking-[0.2em] uppercase text-xs transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] disabled:opacity-30 group"
                                        >
                                            {submitting ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : (
                                                <>
                                                    Initialize System <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    step.options?.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleOptionSelect(opt.id)}
                                            className={`
                                                p-6 rounded-2xl border flex items-center gap-5 transition-all duration-300 text-left group
                                                ${responses[step.id] === opt.id
                                                    ? 'bg-accent border-accent shadow-xl shadow-accent/20'
                                                    : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'}
                                            `}
                                        >
                                            <div className={`
                                                w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                                                ${responses[step.id] === opt.id ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 group-hover:text-accent'}
                                            `}>
                                                <opt.icon size={24} />
                                            </div>
                                            <span className={`font-bold transition-colors ${responses[step.id] === opt.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                {opt.label}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Footer Nav */}
                            <div className="flex items-center justify-between max-w-2xl mx-auto w-full pt-8">
                                <button
                                    onClick={handleBack}
                                    className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                                >
                                    <ChevronLeft size={14} /> Back
                                </button>
                                {step.type !== 'textarea' && responses[step.id] && (
                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent hover:underline transition-all"
                                    >
                                        Next Phase <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="completion"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8"
                        >
                            <div className="relative inline-block">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12 }}
                                    className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-accent/40"
                                >
                                    <CheckCircle2 size={48} className="text-white" />
                                </motion.div>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.2, 0.5]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-accent rounded-full -z-10 blur-xl"
                                />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-white">System Synchronized</h2>
                                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-md mx-auto italic">Booting your creator command center. Stand by...</p>
                            </div>
                            <div className="flex justify-center pt-8">
                                <Loader2 size={32} className="animate-spin text-accent/50" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Global Branding */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-20 hover:opacity-100 transition-opacity duration-700">
                <span className="w-10 h-[1px] bg-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">RiffOS Master Brain</span>
                <span className="w-10 h-[1px] bg-white" />
            </div>
        </div>
    )
}
