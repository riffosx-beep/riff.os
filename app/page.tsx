// app/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Repeat,
  Calendar,
  Check,
  MessageSquare,
  Construction,
  Users
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.replace('/dashboard')
    }
    checkAuth()

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [router])

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent selection:text-white overflow-x-hidden font-sans">
      {/* ───── MOUSE SPOTLIGHT ───── */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.08), transparent 80%)`
        }}
      />

      {/* ───── NAV ───── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border-b border-white/5" />
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-bold text-xl tracking-tighter text-white">
              RiffOS <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full border border-accent/20 align-top ml-1">BETA</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-white transition-colors uppercase">Features</a>
            <a href="#showcase" className="text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-white transition-colors uppercase">Showcase</a>
            <a href="#beta-vision" className="text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-white transition-colors uppercase">Vision</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-white transition-colors uppercase">Login</Link>
            <Link href="/login" className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-accent hover:text-white transition-all shadow-lg hover:shadow-accent/40">
              Join Beta
            </Link>
          </div>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative pt-24 md:pt-32 pb-16 px-6 overflow-visible">
        {/* Background Grid & Aura */}
        <div className="absolute inset-0 bg-grid-white bg-[center_top_-1px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md hover:bg-white/10 transition-all cursor-default group"
          >
            <Zap size={12} className="text-accent fill-accent animate-pulse" />
            <span className="text-[9px] md:text-[10px] font-bold tracking-[0.15em] uppercase text-gray-300">v0.92 Experimental Engine Active</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] md:leading-[0.9] mb-6"
          >
            The Operating System <br />
            <span className="text-gradient-purple">for Modern Creators.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed px-4"
          >
            Ideate, Script, and Distribute in one unified workspace.
            <br className="hidden md:block" />Automate the friction so you can focus on the Riff.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center px-4 md:px-0">
              <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-accent hover:bg-accent-hover text-white rounded-xl font-bold tracking-wider uppercase text-xs shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 group">
                Start Free Trial <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#showcase" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold tracking-wider uppercase text-xs transition-all backdrop-blur-sm">
                Watch Demo
              </a>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
              * No Credit Card Required
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───── PRODUCT SHOWCASE ───── */}
      <section id="showcase" className="py-16 px-4 md:px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            onClick={() => router.push('/login')}
            className="relative group cursor-pointer"
          >
            {/* Ambient Glows */}
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-pink-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="browser-mockup relative z-10 glass-morphism border-white/10 shadow-2xl">
              <div className="browser-mockup-bar flex justify-between items-center pr-4">
                <div className="flex gap-1.5 items-center">
                  <div className="flex gap-1.5 ">
                    <div className="browser-dot red" />
                    <div className="browser-dot yellow" />
                    <div className="browser-dot green" />
                  </div>
                  <div className="browser-url ml-4 text-[10px] md:text-xs">riffos.beta/workspace</div>
                </div>
                <Sparkles size={14} className="text-accent/50" />
              </div>
              <div className="min-h-[400px] md:min-h-0 md:aspect-video bg-[#050505] p-0 flex flex-col overflow-hidden relative">
                {/* Simulated App UI */}
                <div className="flex h-full font-sans text-xs">
                  {/* SIDEBAR */}
                  <div className="w-16 md:w-56 border-r border-white/5 bg-[#09090B] p-3 flex flex-col gap-6 hidden md:flex">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-accent to-purple-600 shadow-lg shadow-accent/20"></div>
                      <div className="font-bold text-gray-200 tracking-tight">RiffOS</div>
                    </div>
                    <div className="space-y-1 mt-2">
                      <div className="h-8 w-full bg-white/5 rounded-lg border border-white/5 flex items-center px-3 gap-3 text-white">
                        <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>
                        <span className="font-medium hidden md:block">Dashboard</span>
                      </div>
                      <div className="h-8 w-full hover:bg-white/5 rounded-lg flex items-center px-3 gap-3 transition-colors text-gray-500 hover:text-gray-300 cursor-pointer">
                        <Calendar size={14} />
                        <span className="hidden md:block">Schedule</span>
                      </div>
                      <div className="h-8 w-full hover:bg-white/5 rounded-lg flex items-center px-3 gap-3 transition-colors text-gray-500 hover:text-gray-300 cursor-pointer">
                        <Users size={14} />
                        <span className="hidden md:block">Team</span>
                      </div>
                      <div className="h-8 w-full hover:bg-white/5 rounded-lg flex items-center px-3 gap-3 transition-colors text-gray-500 hover:text-gray-300 cursor-pointer">
                        <MessageSquare size={14} />
                        <span className="hidden md:block">Scripts</span>
                      </div>
                    </div>

                    <div className="mt-4 hidden md:block">
                      <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2 px-2">Recent Projects</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-md cursor-pointer group/item">
                          <div className="w-2 h-2 rounded-full bg-blue-500/50 group-hover/item:bg-blue-500 transition-colors" />
                          <span className="text-gray-400 group-hover/item:text-gray-200 transition-colors">Launch Video</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-md cursor-pointer group/item">
                          <div className="w-2 h-2 rounded-full bg-pink-500/50 group-hover/item:bg-pink-500 transition-colors" />
                          <span className="text-gray-400 group-hover/item:text-gray-200 transition-colors">Social Clips</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3 hidden md:block">
                      <div className="w-full bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-white/5 p-4 relative overflow-hidden group/card cursor-pointer">
                        <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Storage</div>
                          <div className="text-[10px] font-bold text-accent">78%</div>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                          <div className="h-full w-[78%] bg-gradient-to-r from-accent to-purple-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"></div>
                        </div>
                        <div className="mt-2 text-[9px] text-gray-500 relative z-10">2.4GB / 3GB Used</div>
                      </div>

                      <div className="flex items-center gap-3 px-1 py-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-[10px] font-bold">W</div>
                        <div>
                          <div className="text-xs font-bold text-gray-300">Workspace</div>
                          <div className="text-[10px] text-gray-500">Free Plan</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MAIN CONTENT */}
                  <div className="flex-1 bg-[#050505] p-4 md:p-6 lg:p-8 overflow-hidden relative flex flex-col">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 shrink-0 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-10 md:mb-1">
                          <span>Projects</span>
                          <span className="text-gray-700">/</span>
                          <span className="text-gray-300">Q1 Marketing</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Main Campaign Script</h3>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-8 px-3 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Live Sync</span>
                        </div>
                        <div className="h-8 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-accent/20 transition-all">
                          <Zap size={12} fill="currentColor" />
                          Deploy
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-full min-h-0 overflow-y-auto lg:overflow-visible pb-4 md:pb-0">
                      {/* EDITOR AREA */}
                      <div className="col-span-1 lg:col-span-2 space-y-4 flex flex-col h-[300px] lg:h-full">
                        <div className="flex-1 p-4 md:p-6 rounded-2xl border border-white/5 bg-[#0A0A0A] relative overflow-hidden group/editor">
                          {/* Editor Line Numbers */}
                          <div className="absolute left-4 top-6 bottom-6 w-6 flex flex-col gap-1 text-[10px] text-gray-700 font-mono text-right select-none">
                            <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div>
                          </div>

                          <div className="ml-8 space-y-1 font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-pink-500"># Scene 1: Intro</span>
                              <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-500 text-[9px] border border-white/5">00:00</span>
                            </div>
                            <div className="text-gray-300 pl-4 py-1">
                              The camera pans across a futuristic workspace...
                            </div>
                            <div className="h-4" /> {/* Spacer */}
                            <div className="flex items-center gap-2">
                              <span className="text-blue-500">@ Narrator</span>
                              <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-500 text-[9px] border border-white/5">Voice: Onyx</span>
                            </div>
                            <div className="text-gray-300 pl-4 py-1 relative">
                              <span className="opacity-90">Creativity isn't just about ideas. It's about</span>
                              <span className="relative"> execution
                                <span className="absolute -right-0.5 -top-0.5 bottom-0.5 w-[2px] bg-accent animate-pulse" />
                              </span>
                            </div>

                            {/* AI Autocomplete suggestion */}
                            <div className="pl-4 py-1 text-gray-600 opacity-0 group-hover/editor:opacity-100 transition-opacity duration-500 delay-1000">
                              <span className="italic">...and removing the friction between thought and reality.</span>
                              <span className="ml-2 text-[9px] text-accent bg-accent/10 px-1 py-0.5 rounded border border-accent/20">TAB to complete</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* WIDGETS COLUMN */}
                      <div className="space-y-4 flex flex-col">
                        {/* Analytics Widget */}
                        <div className="p-5 rounded-2xl border border-white/5 bg-[#0A0A0A] hover:border-white/10 transition-colors group/graph">
                          <div className="flex justify-between items-center mb-6">
                            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Engagement</div>
                            <div className="text-green-500 text-[10px] font-bold flex items-center gap-1">
                              <ArrowRight size={10} className="-rotate-45" /> +12.5%
                            </div>
                          </div>
                          <div className="flex items-end gap-2 h-24 w-full">
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                              <div key={i} className="flex-1 bg-white/5 rounded-t-sm relative group-hover/graph:bg-white/10 transition-colors overflow-hidden">
                                <motion.div
                                  initial={{ height: 0 }}
                                  whileInView={{ height: `${h}%` }}
                                  transition={{ duration: 1, delay: i * 0.1 }}
                                  className={`w-full absolute bottom-0 ${i === 5 ? 'bg-accent shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-white/20'}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tasks Widget */}
                        <div className="flex-1 p-5 rounded-2xl border border-white/5 bg-[#0A0A0A] hover:border-white/10 transition-colors">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Queue</div>
                            <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">+</div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex gap-3 items-center group/task cursor-pointer">
                              <div className="w-4 h-4 rounded border border-accent bg-accent/20 flex items-center justify-center text-accent">
                                <Check size={10} />
                              </div>
                              <span className="text-gray-400 line-through decoration-gray-600 text-xs">Script Draft v1</span>
                            </div>
                            <div className="flex gap-3 items-center group/task cursor-pointer">
                              <div className="w-4 h-4 rounded border border-white/20 group-hover/task:border-accent transition-colors" />
                              <span className="text-gray-300 text-xs">Voice Synthesis</span>
                              <div className="ml-auto flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                            <div className="flex gap-3 items-center group/task cursor-pointer opacity-50">
                              <div className="w-4 h-4 rounded border border-white/20" />
                              <span className="text-gray-500 text-xs">Video Rendering</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay UI Badge - Moved to Right for balance */}
            <div className="absolute -bottom-6 -right-6 bg-[#0A0A0A] border border-white/10 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-float hidden md:flex z-20">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 relative">
                <Sparkles size={18} className="text-accent" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0A0A0A]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white mb-0.5">AI Copilot Active</div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Optimizing workflow...
                </div>
              </div>
            </div>


          </motion.div>
        </div>
      </section>

      {/* ───── MARQUEE ───── */}
      <div className="py-6 bg-accent/5 border-y border-white/5 overflow-hidden whitespace-nowrap relative">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 items-center"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex gap-16 items-center opacity-70">
              <span className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-500">Public Beta v0.9.2</span>
              <span className="text-[9px] font-black tracking-[0.3em] uppercase text-accent">Founding Member slots: 142</span>
              <span className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-500">Global Analytics Engine</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ───── BENTO FEATURES ───── */}
      <section id="features" className="py-24 px-6 bg-black relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Core Modules.</h2>
            <p className="text-gray-400 max-w-lg text-base">Foundational tools for the modern creator stack.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Ideation */}
            <motion.div
              whileHover={{ y: -2 }}
              className="md:col-span-2 group relative bg-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] overflow-hidden hover:border-accent/40 transition-all shadow-lg"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                  <Sparkles size={24} className="text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Ideation Studio</h3>
                <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                  The fastest way to go from raw static to clear concepts. Infinite canvas, zero friction.
                </p>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />
            </motion.div>

            {/* Repurposing */}
            <motion.div
              whileHover={{ y: -2 }}
              className="group relative bg-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] overflow-hidden hover:border-pink-500/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6 border border-pink-500/20">
                <Repeat size={24} className="text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Remix Engine</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Adapt one idea for every platform instantly.
              </p>
            </motion.div>

            {/* Scheduling */}
            <motion.div
              whileHover={{ y: -2 }}
              className="group relative bg-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] overflow-hidden hover:border-blue-500/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                <Calendar size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Pipeline</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Visual workflow management. Know what's next.
              </p>
            </motion.div>

            {/* AI Scripting */}
            <motion.div
              whileHover={{ y: -2 }}
              className="md:col-span-2 group relative bg-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] overflow-hidden hover:border-green-500/40 transition-all"
            >
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shrink-0">
                  <Check size={24} className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1 tracking-tight">Script Architect</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    AI-powered structures tailored to your voice. Not generic, not boring.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Community Vision */}
            <motion.div
              whileHover={{ y: -2 }}
              className="md:col-span-2 group relative bg-black border border-white/10 p-8 rounded-[2rem] overflow-hidden flex flex-col justify-center border-dashed"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                  <Users className="text-white fill-white/10" /> Co-Created with You
                </h3>
                <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                  We don't build in a vacuum. Every feature in the beta was requested by users like you. Join the inner circle.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── ECOSYSTEM / CONNECTIVITY ───── */}
      <section className="py-16 px-6 border-y border-white/5 bg-black/50">
        <div className="max-w-6xl mx-auto text-center">
          <h4 className="text-[9px] font-black tracking-[0.4em] uppercase text-gray-600 mb-10">Universal Distribution Active</h4>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-red-500/50 group-hover:text-red-500 transition-all">
                <Zap size={20} />
              </div>
              <span className="text-[8px] font-bold tracking-widest uppercase">YouTube</span>
            </div>
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-400/50 group-hover:text-blue-400 transition-all">
                <MessageSquare size={20} />
              </div>
              <span className="text-[8px] font-bold tracking-widest uppercase">Twitter / X</span>
            </div>
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-pink-500/50 group-hover:text-pink-500 transition-all">
                <Sparkles size={20} />
              </div>
              <span className="text-[8px] font-bold tracking-widest uppercase">Instagram</span>
            </div>
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-green-500/50 group-hover:text-green-500 transition-all">
                <Repeat size={20} />
              </div>
              <span className="text-[8px] font-bold tracking-widest uppercase">LinkedIn</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───── ROADMAP & FEEDBACK ───── */}
      <section id="beta-vision" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 [mask-image:radial-gradient(circle_at_50%_50%,rgba(0,0,0,1),transparent)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-black border border-white/10 mb-6 shadow-2xl animate-float">
            <MessageSquare size={28} className="text-accent" />
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">Shape the <br />Future OS.</h2>
          <p className="text-lg text-gray-400 mb-12 leading-relaxed max-w-xl mx-auto">
            We're stripping away everything that doesn't help you create. Tell us what's missing, and watch it appear in the next sprint.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto mb-16">
            <div className="glass-morphism p-6 rounded-[2rem] border-white/5 group hover:border-white/10 transition-all">
              <h4 className="font-bold text-accent mb-4 uppercase text-[10px] tracking-[0.2em]">Current Sprint</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center gap-2 text-gray-400">
                  <div className="w-1 h-1 rounded-full bg-accent shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                  Advanced Analytics Dashboard
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <div className="w-1 h-1 rounded-full bg-accent shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                  Collaborative Brainstorming
                </li>
              </ul>
            </div>
            <div className="glass-morphism p-6 rounded-[2rem] border-white/5 group hover:border-white/10 transition-all">
              <h4 className="font-bold text-blue-500 mb-4 uppercase text-[10px] tracking-[0.2em]">Help Needed</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center gap-2 text-gray-400">
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                  UI/UX Stress Testing
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                  Creator Feature Wishlist
                </li>
              </ul>
            </div>
          </div>

          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black rounded-xl hover:scale-105 hover:bg-accent hover:text-white transition-all shadow-xl text-sm">
            Join the inner circle <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="py-20 px-6 border-t border-white/5 bg-[#050505] text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="space-y-3">
            <span className="text-xl font-black tracking-tighter text-white">RiffOS</span>
            <p className="text-gray-500 max-w-xs leading-relaxed uppercase tracking-wider font-bold text-[10px]">
              Building the infrastructure for the next generation of digital creators.
            </p>
          </div>
          <div className="flex gap-16">
            <ul className="space-y-2 text-gray-500">
              <li className="uppercase tracking-widest text-[9px] font-bold text-gray-700 mb-2">Platform</li>
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
            <ul className="space-y-2 text-gray-500">
              <li className="uppercase tracking-widest text-[9px] font-bold text-gray-700 mb-2">Company</li>
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
          <div>&copy; {new Date().getFullYear()} RiffOS.</div>
          <Zap size={12} className="text-gray-700" />
        </div>
      </footer>
    </div>
  )
}
