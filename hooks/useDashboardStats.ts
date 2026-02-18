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
                recentItems
            ] = await Promise.all([
                // Count Ideas
                supabase.from('vault').select('*', { count: 'exact', head: true }).eq('type', 'idea'),
                // Count Scripts
                supabase.from('vault').select('*', { count: 'exact', head: true }).eq('type', 'script'),
                // Recent Activity
                supabase.from('vault').select('id, title, created_at, type, status').order('created_at', { ascending: false }).limit(5)
            ])

            // Process Stats
            setStats({
                totalIdeas: ideasCount.count || 0,
                totalScripts: scriptsCount.count || 0,
                totalViews: '2.4K',
                scheduledPosts: 0
            })

            // Process Activity
            const activity = (recentItems.data || []).map(item => ({
                id: item.id,
                type: item.type as any,
                title: item.title || 'Untitled',
                created_at: item.created_at,
                status: item.status || 'Active'
            }))

            setRecentActivity(activity)

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
