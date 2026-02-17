'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, File, Image as ImageIcon, Trash2, Loader2, Download, Paperclip } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Database } from '@/lib/types'

type Asset = Database['public']['Tables']['assets']['Row']

interface AssetManagerProps {
    parentId?: string // Optional: if provided, assets are linked to this parent (e.g. calendar entry id)
    onAssetsChange?: () => void
}

export default function AssetManager({ parentId, onAssetsChange }: AssetManagerProps) {
    const [assets, setAssets] = useState<Asset[]>([])
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchAssets()
    }, [parentId])

    const fetchAssets = async () => {
        try {
            setLoading(true)
            let query = supabase.from('assets').select('*').order('created_at', { ascending: false })

            if (parentId) {
                query = query.eq('parent_id', parentId)
            } else {
                // If no parent, maybe show recent or all? For now let's just show recent if no parent
                query = query.limit(20)
            }

            const { data, error } = await query
            if (error) throw error
            if (data) setAssets(data)
        } catch (error) {
            console.error('Error fetching assets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${parentId ? parentId + '/' : 'unassigned/'}${fileName}`

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('assets')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('assets')
                .getPublicUrl(filePath)

            // 3. Save to DB
            const { error: dbError } = await supabase.from('assets').insert({
                user_id: user.id,
                name: file.name,
                type: file.type.startsWith('image/') ? 'photo' : 'file',
                url: publicUrl,
                size: file.size,
                mime_type: file.type,
                parent_id: parentId || null,
                metadata: {}
            })

            if (dbError) throw dbError

            fetchAssets()
            if (onAssetsChange) onAssetsChange()

        } catch (error) {
            console.error('Error uploading asset:', error)
            alert('Failed to upload asset. Make sure "assets" bucket exists in Supabase.')
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }

    const deleteAsset = async (id: string, path: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return

        try {
            // 1. Delete from DB
            const { error: dbError } = await supabase.from('assets').delete().eq('id', id)
            if (dbError) throw dbError

            // 2. We should ideally delete from storage too, but path parsing is needed. 
            // For now, let's just delete the DB record to avoid breaking UI if storage delete fails.

            // Extract relative path from URL if possible, or we need to store storage_path in DB.
            // Simplified: won't delete actual file from bucket in this iteration to be safe.

            fetchAssets()
            if (onAssetsChange) onAssetsChange()
        } catch (error) {
            console.error('Error deleting asset:', error)
            alert('Failed to delete asset')
        }
    }

    const formatSize = (bytes: number | null) => {
        if (!bytes) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider">Attached Assets</h4>
                <div className="relative">
                    <input
                        type="file"
                        onChange={handleUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                    <button disabled={uploading} className="btn-secondary text-xs flex items-center gap-2">
                        {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        Upload File
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-text-muted" size={16} />
                </div>
            ) : assets.length > 0 ? (
                <div className="space-y-2">
                    {assets.map(asset => (
                        <div key={asset.id} className="flex items-center gap-3 p-2 bg-surface-2 rounded-lg border border-border group hover:border-blue-500/30 transition-colors">
                            <div className="w-10 h-10 rounded bg-background flex items-center justify-center border border-border overflow-hidden shrink-0">
                                {asset.type === 'photo' ? (
                                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                ) : (
                                    <File size={16} className="text-text-muted" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">{asset.name}</p>
                                <p className="text-[10px] text-text-muted">{formatSize(asset.size)}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={asset.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-text-muted hover:text-blue-400 rounded hover:bg-blue-500/10">
                                    <Download size={14} />
                                </a>
                                <button onClick={() => deleteAsset(asset.id, '')} className="p-1.5 text-text-muted hover:text-red-400 rounded hover:bg-red-500/10">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 border border-dashed border-border rounded-lg bg-surface-2/30">
                    <div className="flex justify-center mb-2">
                        <Paperclip size={20} className="text-text-muted/50" />
                    </div>
                    <p className="text-xs text-text-muted">No assets attached yet.</p>
                </div>
            )}
        </div>
    )
}
