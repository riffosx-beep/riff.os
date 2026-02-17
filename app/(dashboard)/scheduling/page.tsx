'use client'

import React from 'react'
import { Calendar as CalendarIcon, GitPullRequest, BarChart3 } from 'lucide-react'

export default function SchedulingPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                        Scheduling Command Center
                    </h1>
                    <p className="text-text-muted mt-1">Plan, visualize, and distribute your content.</p>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="bg-surface border border-border rounded-xl p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <CalendarIcon size={48} className="mx-auto text-accent mb-6" />
                        <h2 className="text-2xl font-bold mb-4">Master Calendar</h2>
                        <p className="text-text-secondary mb-8">
                            Your centralized view for all content across all platforms. Drag and drop to reschedule.
                        </p>
                        <button className="btn-primary w-full py-3">
                            Open Calendar View
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-surface border border-border rounded-xl p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <GitPullRequest className="text-accent" />
                            <h3 className="font-bold">Pipeline Status</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Drafts</span>
                                <span className="font-bold">12</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">In Review</span>
                                <span className="font-bold">3</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Scheduled</span>
                                <span className="font-bold text-green-500">8</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <BarChart3 className="text-accent" />
                            <h3 className="font-bold">Quick Stats</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Posts this week</span>
                                <span className="font-bold">5</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Streak</span>
                                <span className="font-bold text-orange-500">🔥 12 Days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
