'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import AuthCarousel from '@/components/auth/AuthCarousel'

export default function SignupPage() {
    const [loading, setLoading] = useState(false)

    const handleGoogleSignup = async () => {
        setLoading(true)
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#050505]">
            {/* ─── LEFT: AUTH PANEL ─── */}
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="w-full max-w-sm space-y-10 relative z-10">
                    {/* Brand Header */}
                    <div className="space-y-4 text-center md:text-left">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0 shadow-2xl shadow-accent/20">
                            <span className="text-white font-bold text-3xl italic">R</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Initialize Account</h1>
                        <p className="text-gray-400 text-sm font-medium">Join the next generation of content production.</p>
                    </div>

                    {/* Social Auth - Google Only */}
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            className="w-full h-14 bg-white text-black hover:bg-accent hover:text-white rounded-2xl font-bold tracking-[0.2em] uppercase text-[10px] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="currentColor" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" /></svg>
                            Sign up with Google
                        </button>
                    </div>

                    {/* Features Mini List */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Master Engine v3', icon: Sparkles },
                            { icon: ArrowRight, label: 'Cross-Remixing' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-[8px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 p-2 rounded-lg border border-white/5">
                                <item.icon size={10} className="text-accent" />
                                {item.label}
                            </div>
                        ))}
                    </div>

                    <div className="text-center pt-8 border-t border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            Already registered?{' '}
                            <Link href="/login" className="text-accent hover:underline">
                                Sign In &rarr;
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── RIGHT: VISUAL ─── */}
            <div className="hidden lg:block h-full relative border-l border-white/5">
                <AuthCarousel />
                <div className="absolute bottom-12 left-12 right-12">
                    <div className="p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                        <p className="text-xl font-bold text-white mb-2 leading-tight">"RiffOS turned my 4-hour writing sessions into 15-minute reviews."</p>
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">— Alex, Content Director</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
