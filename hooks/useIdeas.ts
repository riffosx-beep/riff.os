'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '@/lib/types'

// Define the shape of an Idea based on Vault
export interface Idea {
    id: string
    title: string
    content: string
    tags: string[]
    source: 'voice' | 'text' | 'web' | 'ai'
    is_favorite: boolean
    created_at: string
    user_id?: string
    type?: string
}

export function useIdeas() {
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Fetch ideas from Vault
    const fetchIdeas = useCallback(async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('vault')
                .select('*')
                .eq('type', 'idea') // Filter strictly for ideas
                .neq('status', 'trash') // Don't show trashed items
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                // Map vault data to Idea interface
                const mappedIdeas: Idea[] = data.map(item => ({
                    id: item.id,
                    title: item.title,
                    content: item.content || '',
                    tags: item.tags || [],
                    source: (item.source as any) || 'text',
                    is_favorite: item.is_favorite || false,
                    created_at: item.created_at,
                    user_id: item.user_id,
                    type: item.type
                }))
                setIdeas(mappedIdeas)
            }
        } catch (err: any) {
            console.error('Error fetching ideas:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Add a new idea
    const addIdea = async (
        title: string,
        content: string,
        tags: string[],
        source: 'voice' | 'text' | 'web' | 'ai'
    ) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('User not authenticated')

            const newIdea = {
                user_id: user.id,
                title,
                content,
                tags,
                source,
                type: 'idea',
                status: 'active',
                is_favorite: false
            }

            // Optimistic update
            const tempId = uuidv4()
            const optimisticIdea: Idea = {
                ...newIdea,
                id: tempId,
                created_at: new Date().toISOString()
            }

            setIdeas(prev => [optimisticIdea, ...prev])

            const { data, error } = await supabase
                .from('vault')
                .insert(newIdea)
                .select()
                .single()

            if (error) throw error

            // Replace optimistic idea with real data
            if (data) {
                const realIdea: Idea = {
                    id: data.id,
                    title: data.title,
                    content: data.content || '',
                    tags: data.tags || [],
                    source: (data.source as any) || 'text',
                    is_favorite: data.is_favorite || false,
                    created_at: data.created_at,
                    user_id: data.user_id,
                    type: data.type
                }
                setIdeas(prev => prev.map(i => i.id === tempId ? realIdea : i))
            }

            return data
        } catch (err: any) {
            console.error('Error adding idea:', err)
            // Revert optimistic update on error
            fetchIdeas()
            throw err
        }
    }

    // Toggle favorite status
    const toggleFavorite = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setIdeas(prev => prev.map(i =>
                i.id === id ? { ...i, is_favorite: !currentStatus } : i
            ))

            const { error } = await supabase
                .from('vault')
                .update({ is_favorite: !currentStatus })
                .eq('id', id)

            if (error) throw error
        } catch (err: any) {
            console.error('Error toggling favorite:', err)
            // Revert on error
            setIdeas(prev => prev.map(i =>
                i.id === id ? { ...i, is_favorite: currentStatus } : i
            ))
        }
    }

    // Delete idea (actually move to trash)
    const deleteIdea = async (id: string) => {
        try {
            // Optimistic update
            setIdeas(prev => prev.filter(i => i.id !== id))

            // Soft delete
            const { error } = await supabase
                .from('vault')
                .update({ status: 'trash' })
                .eq('id', id)

            if (error) throw error
        } catch (err: any) {
            console.error('Error deleting idea:', err)
            fetchIdeas() // Revert
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchIdeas()
    }, [fetchIdeas])

    return {
        ideas,
        loading,
        error,
        addIdea,
        toggleFavorite,
        deleteIdea,
        refreshIdeas: fetchIdeas
    }
}
