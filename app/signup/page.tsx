'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import AuthCarousel from '@/components/auth/AuthCarousel'

export default function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            })

            if (error) {
                setError(error.message)
            } else {
                // If email confirmation is off, this logs them in interactively
                // If on, it sends an email. Assuming auto-confirm for dev or handling both.
                if (data.session) {
                    router.push('/onboarding')
                } else {
                    setError('Please check your email to confirm your account.')
                }
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* ─── LEFT: SIGNUP FORM ─── */}
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-surface">
                <div className="w-full max-w-sm space-y-8">
                    {/* Brand Header */}
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-black/20">
                            <span className="text-white font-bold text-xl tracking-tighter">R.</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Create Account</h1>
                        <p className="text-text-muted">Join RiffOS and start building.</p>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="text-xs font-semibold text-text-secondary uppercase mb-1.5 block group-focus-within:text-accent transition-colors">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-text-muted transition-colors group-focus-within:text-accent" size={16} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Jane Founder"
                                        className="input pl-10 h-10 w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-xs font-semibold text-text-secondary uppercase mb-1.5 block group-focus-within:text-accent transition-colors">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-text-muted transition-colors group-focus-within:text-accent" size={16} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="founder@company.com"
                                        className="input pl-10 h-10 w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="text-xs font-semibold text-text-secondary uppercase mb-1.5 block group-focus-within:text-accent transition-colors">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 text-text-muted transition-colors group-focus-within:text-accent" size={16} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input pl-10 h-10 w-full"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full h-11 text-sm font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-surface px-2 text-text-muted">Or sign up with</span>
                        </div>
                    </div>

                    {/* Social Auth */}
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={handleGoogle}
                            className="btn-secondary h-11 text-sm font-medium hover:border-text-primary hover:bg-surface-hover flex items-center justify-center"
                        >
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            Sign up with Google
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-text-muted">
                            Already have an account?{' '}
                            <Link href="/login" className="text-accent font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── RIGHT: PRODUCT SHOWCASE ─── */}
            <div className="hidden lg:block h-full relative">
                <AuthCarousel />
                <div className="absolute bottom-6 right-6 text-[10px] text-white/20 font-mono pointer-events-none">
                    RIFF OS v1.0
                </div>
            </div>
        </div>
    )
}
