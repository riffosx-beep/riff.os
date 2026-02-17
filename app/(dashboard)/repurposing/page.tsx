'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Repeat, Zap, Share2 } from 'lucide-react'

export default function RepurposingPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                        Content Repurposing
                    </h1>
                    <p className="text-text-muted mt-1">Transform one piece of content into many.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center text-center hover:border-accent transition-colors group cursor-pointer">
                    <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap size={32} className="text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Hook Optimizer</h3>
                    <p className="text-text-secondary text-sm">Generate 10 viral hook variations for any script.</p>
                </div>

                <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center text-center hover:border-accent transition-colors group cursor-pointer opacity-50">
                    <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
                        <Repeat size={32} className="text-text-muted" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Video to Text</h3>
                    <p className="text-text-secondary text-sm">Turn YouTube videos into Twitter threads & LinkedIn posts.</p>
                    <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-text-muted border border-border px-2 py-1 rounded">Coming Soon</span>
                </div>

                <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center text-center hover:border-accent transition-colors group cursor-pointer opacity-50">
                    <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
                        <Share2 size={32} className="text-text-muted" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Platform Resizer</h3>
                    <p className="text-text-secondary text-sm">Automatically crop and format video for all platforms.</p>
                    <span className="mt-4 text-[10px] font-bold uppercase tracking-widest text-text-muted border border-border px-2 py-1 rounded">Coming Soon</span>
                </div>
            </div>
        </div>
    )
}
