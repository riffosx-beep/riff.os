'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

// Define the shape of an Idea
export interface Idea {
    id: string
    title: string
    content: string
    tags: string[]
    source: 'voice' | 'text' | 'web'
    is_favorite: boolean
    created_at: string
    user_id?: string
}

export function useIdeas() {
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Fetch ideas from Supabase
    const fetchIdeas = useCallback(async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('ideas')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                setIdeas(data as Idea[])
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
        source: 'voice' | 'text' | 'web'
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
                .from('ideas')
                .insert(newIdea)
                .select()
                .single()

            if (error) throw error

            // Replace optimistic idea with real data
            if (data) {
                setIdeas(prev => prev.map(i => i.id === tempId ? (data as Idea) : i))
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
                .from('ideas')
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

    // Delete idea
    const deleteIdea = async (id: string) => {
        try {
            // Optimistic update
            setIdeas(prev => prev.filter(i => i.id !== id))

            const { error } = await supabase
                .from('ideas')
                .delete()
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
