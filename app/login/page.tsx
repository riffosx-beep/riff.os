'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import AuthCarousel from '@/components/auth/AuthCarousel'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleGoogleLogin = async () => {
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
                        <h1 className="text-4xl font-black tracking-tighter text-white">RE-ENTER RIFFOS</h1>
                        <p className="text-gray-400 text-sm font-medium">Access your content command center.</p>
                    </div>

                    {/* Social Auth - Google Only */}
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full h-14 bg-white text-black hover:bg-accent hover:text-white rounded-2xl font-bold tracking-[0.2em] uppercase text-[10px] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="currentColor" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" /></svg>
                            Continue with Google
                        </button>
                    </div>

                    <div className="text-center pt-8 border-t border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            New to the OS?{' '}
                            <Link href="/signup" className="text-accent hover:underline">
                                Create Account &rarr;
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── RIGHT: VISUAL ─── */}
            <div className="hidden lg:block h-full relative border-l border-white/5">
                <AuthCarousel />
                <div className="absolute top-0 right-0 p-12">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                        <Sparkles size={14} className="text-accent" />
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
