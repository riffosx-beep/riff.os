
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                    ai_persona: string | null
                    settings: Json
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    ai_persona?: string | null
                    settings?: Json
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    ai_persona?: string | null
                    settings?: Json
                    updated_at?: string
                    created_at?: string
                }
            }
            vault: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    content: string | null
                    type: 'idea' | 'strategy_monthly' | 'hook' | 'snippet' | 'script' | string
                    status: 'active' | 'archived' | 'trash' | string
                    tags: string[] | null
                    source: 'voice' | 'text' | 'web' | 'ai' | string | null
                    is_favorite: boolean
                    ai_notes: string | null
                    metadata: Json
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    content?: string | null
                    type: string
                    status?: string
                    tags?: string[] | null
                    source?: string | null
                    is_favorite?: boolean
                    ai_notes?: string | null
                    metadata?: Json
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    content?: string | null
                    type?: string
                    status?: string
                    tags?: string[] | null
                    source?: string | null
                    is_favorite?: boolean
                    ai_notes?: string | null
                    metadata?: Json
                    updated_at?: string
                    created_at?: string
                }
            }
            scripts: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    content: string | null
                    platform: string | null
                    framework: string | null
                    hooks: Json
                    status: string
                    settings: Json
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    content?: string | null
                    platform?: string | null
                    framework?: string | null
                    hooks?: Json
                    status?: string
                    settings?: Json
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    content?: string | null
                    platform?: string | null
                    framework?: string | null
                    hooks?: Json
                    status?: string
                    settings?: Json
                    updated_at?: string
                    created_at?: string
                }
            }
            calendar: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    time_slot: string | null
                    title: string
                    platform: string
                    content_type: string
                    status: string
                    notes: string | null
                    script_id: string | null
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    time_slot?: string | null
                    title: string
                    platform: string
                    content_type: string
                    status?: string
                    notes?: string | null
                    script_id?: string | null
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    time_slot?: string | null
                    title?: string
                    platform?: string
                    content_type?: string
                    status?: string
                    notes?: string | null
                    script_id?: string | null
                    updated_at?: string
                    created_at?: string
                }
            }
            assets: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    type: 'photo' | 'thumbnail' | 'file' | 'video' | string
                    url: string
                    size: number | null
                    mime_type: string | null
                    parent_id: string | null
                    metadata: Json
                    updated_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    type: string
                    url: string
                    size?: number | null
                    mime_type?: string | null
                    parent_id?: string | null
                    metadata?: Json
                    updated_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    type?: string
                    url?: string
                    size?: number | null
                    mime_type?: string | null
                    parent_id?: string | null
                    metadata?: Json
                    updated_at?: string
                    created_at?: string
                }
            }
        }
    }
}
