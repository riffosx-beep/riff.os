'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Send, Loader2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FeedbackModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [type, setType] = useState<'feature' | 'bug' | 'general'>('feature')
    const [content, setContent] = useState('')
    const [contact, setContact] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (!content.trim()) return
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            // We use the 'vault' table to store feedback to avoid schema changes
            // type = 'feedback_feature', etc.
            const { error } = await supabase.from('vault').insert({
                user_id: user?.id,
                title: `Feedback: ${type.toUpperCase()}`,
                content: content,
                type: `feedback_${type}`,
                status: 'new', // Using status field
                source: 'user_submission',
                metadata: {
                    contact_email: contact,
                    user_agent: window.navigator.userAgent
                }
            })

            if (error) throw error
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setContent('')
                onClose()
            }, 2000)
        } catch (err) {
            console.error('Feedback error:', err)
            alert('Failed to submit feedback. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <div className="absolute inset-0" onClick={onClose} />
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Help Build RiffOS</h3>
                                <p className="text-xs text-gray-400">We are in Beta. Your ideas shape our future.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {success ? (
                            <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                                    <Send size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Feedback Received!</h4>
                                <p className="text-gray-400 text-sm">Thank you for helping us improve RiffOS.</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Feedback Type</label>
                                    <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                                        {['feature', 'bug', 'general'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setType(t as any)}
                                                className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${type === t ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Your Suggestions</label>
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-accent focus:outline-none transition-all placeholder:text-gray-600 resize-none"
                                        placeholder="I think it would be great if..."
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !content.trim()}
                                    className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                                    Submit Feedback
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
