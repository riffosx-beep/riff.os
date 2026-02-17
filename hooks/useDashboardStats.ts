'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
    totalIdeas: number
    totalScripts: number
    totalViews: string // Placeholder for now until analytics is real
    scheduledPosts: number
}

export interface ActivityItem {
    id: string
    type: 'idea' | 'script' | 'post'
    title: string
    created_at: string
    status: string
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>({
        totalIdeas: 0,
        totalScripts: 0,
        totalViews: '0',
        scheduledPosts: 0
    })
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Parallel fetching
            const [
                ideasCount,
                scriptsCount,
                recentIdeas,
                recentScripts
            ] = await Promise.all([
                // Count Ideas
                supabase.from('ideas').select('*', { count: 'exact', head: true }),
                // Count Scripts
                supabase.from('scripts').select('*', { count: 'exact', head: true }),
                // Recent Ideas
                supabase.from('ideas').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
                // Recent Scripts
                supabase.from('scripts').select('id, title, created_at').order('created_at', { ascending: false }).limit(3)
            ])

            // Process Stats
            setStats({
                totalIdeas: ideasCount.count || 0,
                totalScripts: scriptsCount.count || 0,
                totalViews: '2.4K', // Mock for now as performance_data might be empty
                scheduledPosts: 0
            })

            // Process Activity
            const ideas = (recentIdeas.data || []).map(i => ({
                id: i.id,
                type: 'idea' as const,
                title: i.title || 'Untitled Idea',
                created_at: i.created_at,
                status: 'Captured'
            }))

            const scripts = (recentScripts.data || []).map(s => ({
                id: s.id,
                type: 'script' as const,
                title: s.title || 'Untitled Script',
                created_at: s.created_at,
                status: 'Draft'
            }))

            // Merge and Sort
            const combined = [...ideas, ...scripts]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)

            setRecentActivity(combined)

        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return { stats, recentActivity, loading, refreshStats: fetchStats }
}
