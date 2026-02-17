'use client'

import React from 'react'
import {
    Files,
    Upload,
    Filter,
    Search
} from 'lucide-react'
import AssetManager from '@/components/AssetManager'

export default function AssetsPage() {
    return (
        <div className="space-y-6 animate-enter pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Files size={20} className="text-blue-500" />
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Assets Library</h1>
                    </div>
                    <p className="text-sm text-text-muted">Manage your images, videos, and documents.</p>
                </div>
            </div>

            {/* Assets Grid */}
            <div className="card p-6 min-h-[500px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-h3 text-text-primary">All Files</h3>
                    <div className="flex gap-2">
                        {/* Future filters can go here */}
                    </div>
                </div>

                <AssetManager />
            </div>
        </div>
    )
}
