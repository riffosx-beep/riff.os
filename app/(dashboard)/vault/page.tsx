'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Archive,
    Sparkles,
    Loader2,
    Copy,
    Check,
    Plus,
    X,
    Search,
    Filter,
    Trash2,
    Tag,
    Clock,
    Eye,
    Star,
    ChevronDown,
    Brain,
    ArrowRight,
    Upload,
    File,
    Image as ImageIcon,
    Film,
    Paperclip,
} from 'lucide-react'

interface VaultAsset {
    url: string
    path: string
    name: string
    type: string
    size: number
}

interface VaultItem {
    id?: string
    title: string
    content: string
    type: string
    platform?: string
    tags?: string[]
    status: string
    assets?: VaultAsset[]
    ai_tags?: string[]
    ai_score?: number
    ai_notes?: string
    created_at?: string
    user_id?: string
}

const STATUS_OPTIONS = ['draft', 'scheduled', 'posted', 'archived', 'top-performer']
const TYPE_OPTIONS = ['script', 'post', 'hook', 'idea', 'caption', 'email', 'dm', 'thread', 'carousel', 'other']

export default function VaultPage() {
    const [items, setItems] = useState<VaultItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [filterTag, setFilterTag] = useState('all')

    // Add content modal
    const [showAddModal, setShowAddModal] = useState(false)
    const [newItem, setNewItem] = useState<Partial<VaultItem>>({ title: '', content: '', type: 'post', platform: 'LinkedIn', status: 'draft', tags: [], assets: [] })
    const [newTag, setNewTag] = useState('')
    const [saving, setSaving] = useState(false)

    // Upload state
    const [uploading, setUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    // AI tagging
    const [taggingId, setTaggingId] = useState<string | null>(null)

    // AI search
    const [aiSearchQuery, setAiSearchQuery] = useState('')
    const [aiSearchLoading, setAiSearchLoading] = useState(false)
    const [aiSearchResults, setAiSearchResults] = useState<{ results: string[]; summary: string } | null>(null)

    const [copied, setCopied] = useState('')
    const [viewItem, setViewItem] = useState<VaultItem | null>(null)

    useEffect(() => { fetchItems() }, [])

    async function fetchItems() {
        setLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase.from('vault').select('*').order('created_at', { ascending: false })
        if (error) {
            console.error('Error fetching vault:', error)
            // Optional: alert('Failed to load vault items')
        }
        if (data) setItems(data)
        setLoading(false)
    }

    async function handleFileUpload(files: FileList | null) {
        if (!files || files.length === 0) return
        setUploading(true)

        try {
            const uploadedAssets: VaultAsset[] = []

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const formData = new FormData()
                formData.append('file', file)
                formData.append('folder', 'vault')

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })

                if (!res.ok) throw new Error('Upload failed')
                const data = await res.json()
                uploadedAssets.push({
                    url: data.url,
                    path: data.path,
                    name: data.name,
                    type: data.type,
                    size: data.size
                })
            }

            setNewItem(prev => ({
                ...prev,
                assets: [...(prev.assets || []), ...uploadedAssets]
            }))
        } catch (err) {
            alert('Failed to upload file')
        } finally {
            setUploading(false)
            setIsDragging(false)
        }
    }

    // Drag and drop handlers
    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFileUpload(e.dataTransfer.files)
    }, [])


    async function saveItem() {
        if (!newItem.title?.trim() || !newItem.content?.trim()) return
        setSaving(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            // Note: Ensure your Supabase 'vault' table has an 'assets' JSONB column
            await supabase.from('vault').insert({ ...newItem, user_id: user.id })

            setShowAddModal(false)
            setNewItem({ title: '', content: '', type: 'post', platform: 'LinkedIn', status: 'draft', tags: [], assets: [] })
            fetchItems()
        } catch (err) {
            console.error('Vault save error:', err)
            if (err instanceof Error) {
                alert(`Failed to save: ${err.message}`)
            } else if (typeof err === 'object' && err !== null && 'message' in err) {
                alert(`Failed to save: ${(err as any).message}`)
            } else {
                alert('Failed to save. Check console for details.')
            }
        } finally {
            setSaving(false)
        }
    }

    async function aiTagItem(item: VaultItem) {
        if (!item.id) return
        setTaggingId(item.id)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'vault-tag', content: item.content, title: item.title }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            const supabase = createClient()
            await supabase.from('vault').update({
                ai_tags: data.tags?.tags || data.tags?.ai_tags || [],
                ai_score: data.tags?.quality_score,
                ai_notes: data.tags?.improvement_note || data.tags?.suggested_improvement,
            }).eq('id', item.id)
            fetchItems()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to tag')
        } finally {
            setTaggingId(null)
        }
    }

    async function aiSearch() {
        if (!aiSearchQuery.trim()) return
        setAiSearchLoading(true)
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'vault-search',
                    query: aiSearchQuery,
                    items: items.slice(0, 30).map(i => ({ id: i.id, title: i.title, content: i.content?.substring(0, 200), tags: i.tags, ai_tags: i.ai_tags })),
                }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setAiSearchResults(data.searchResults)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Search failed')
        } finally {
            setAiSearchLoading(false)
        }
    }

    async function deleteItem(id: string) {
        if (!confirm('Delete this item?')) return
        const supabase = createClient()
        await supabase.from('vault').delete().eq('id', id)
        fetchItems()
    }

    function updateStatus(id: string, status: string) {
        const supabase = createClient()
        supabase.from('vault').update({ status }).eq('id', id).then(() => fetchItems())
    }

    const copyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(''), 2000)
    }

    const allTags = Array.from(new Set(items.flatMap(i => [...(i.tags || []), ...(i.ai_tags || [])])))

    const filteredItems = items.filter(i => {
        if (filterStatus !== 'all' && i.status !== filterStatus) return false
        if (filterType !== 'all' && i.type !== filterType) return false
        if (filterTag !== 'all' && !i.tags?.includes(filterTag) && !i.ai_tags?.includes(filterTag)) return false
        if (searchQuery && !i.title?.toLowerCase().includes(searchQuery.toLowerCase()) && !i.content?.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    const getFileIcon = (type: string) => {
        if (!type || typeof type !== 'string') return <File size={14} className="text-gray-400" />
        if (type.startsWith('image/')) return <ImageIcon size={14} className="text-purple-400" />
        if (type.startsWith('video/')) return <Film size={14} className="text-pink-400" />
        return <File size={14} className="text-blue-400" />
    }

    return (
        <div className="space-y-6 animate-enter pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Archive size={20} className="text-indigo-500" />
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Content Vault</h1>
                    </div>
                    <p className="text-sm text-text-muted">Your content library with AI tagging, smart search, and status tracking.</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary bg-indigo-600 hover:bg-indigo-700">
                    <Plus size={14} /> Add Content
                </button>
            </div>

            {/* Search & Filters */}
            <div className="card p-4 space-y-3">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input pl-9" placeholder="Search vault..." />
                    </div>
                    <div className="flex gap-2">
                        <input type="text" value={aiSearchQuery} onChange={e => setAiSearchQuery(e.target.value)} className="input w-48" placeholder="AI smart search..." onKeyDown={e => e.key === 'Enter' && aiSearch()} />
                        <button onClick={aiSearch} disabled={aiSearchLoading || !aiSearchQuery.trim()} className="btn-secondary">
                            {aiSearchLoading ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                    <span className="text-caption">Status:</span>
                    {['all', ...STATUS_OPTIONS].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium ${filterStatus === s ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-surface-2 text-text-muted border border-border'}`}>
                            {s}
                        </button>
                    ))}
                    <span className="text-caption ml-2">Type:</span>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input text-xs py-1 w-auto">
                        <option value="all">All</option>
                        {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {allTags.length > 0 && (
                        <>
                            <span className="text-caption ml-2">Tag:</span>
                            <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="input text-xs py-1 w-auto">
                                <option value="all">All</option>
                                {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </>
                    )}
                </div>
            </div>

            {/* AI Search Results */}
            {aiSearchResults && (
                <div className="card p-5 bg-indigo-500/5 border-indigo-500/20">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-h3 text-text-primary flex items-center gap-2"><Brain size={16} className="text-indigo-500" /> Smart Search Results</h3>
                        <button onClick={() => setAiSearchResults(null)} className="btn-icon"><X size={14} /></button>
                    </div>
                    <p className="text-body-sm text-text-secondary mb-3">{aiSearchResults.summary}</p>
                    {aiSearchResults.results?.length > 0 && (
                        <div className="space-y-1">
                            {aiSearchResults.results.map((r, i) => (
                                <p key={i} className="text-body-sm text-text-secondary pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-indigo-500/30">{r}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {STATUS_OPTIONS.map(status => (
                    <div key={status} className="card p-3 text-center cursor-pointer hover:border-indigo-500/30 transition-colors" onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}>
                        <span className="text-lg font-bold text-text-primary">{items.filter(i => i.status === status).length}</span>
                        <p className="text-caption capitalize">{status.replace(/-/g, ' ')}</p>
                    </div>
                ))}
            </div>

            {/* Items */}
            {loading ? (
                <div className="card p-12 text-center"><Loader2 size={24} className="animate-spin mx-auto text-text-muted" /></div>
            ) : filteredItems.length === 0 ? (
                <div className="card p-12 text-center">
                    <Archive size={32} className="text-text-muted mx-auto mb-3" />
                    <h3 className="text-h3 text-text-primary mb-1">{items.length === 0 ? 'Vault is empty' : 'No matching items'}</h3>
                    <p className="text-body-sm text-text-muted mb-4">
                        {items.length === 0 ? 'Start saving your best content here.' : 'Try adjusting your filters.'}
                    </p>
                    {items.length === 0 && <button onClick={() => setShowAddModal(true)} className="btn-primary bg-indigo-600">Add Your First Item</button>}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredItems.map((item, i) => (
                        <div key={item.id || i} className="card p-4 hover:border-indigo-500/20 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 mr-4 cursor-pointer" onClick={() => setViewItem(item)}>
                                    <h4 className="text-body font-medium text-text-primary flex items-center gap-2">
                                        {item.title}
                                        {item.assets && item.assets.length > 0 && <Paperclip size={12} className="text-text-muted" />}
                                    </h4>
                                    <p className="text-body-sm text-text-muted line-clamp-2 mt-0.5">{item.content}</p>

                                    {/* Assets Preview (Mini) */}
                                    {item.assets && item.assets.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {item.assets.slice(0, 3).map((asset, idx) => (
                                                <div key={idx} className="flex items-center gap-1 bg-surface-2 px-2 py-0.5 rounded text-[10px] text-text-muted">
                                                    {getFileIcon(asset.type)}
                                                    <span className="truncate max-w-[80px]">{asset.name}</span>
                                                </div>
                                            ))}
                                            {item.assets.length > 3 && <span className="text-[10px] text-text-muted self-center">+{item.assets.length - 3} more</span>}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${item.status === 'top-performer' ? 'bg-green-500/10 text-green-400 border-green-500/20' : item.status === 'posted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : item.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-surface-2 text-text-muted border-border'}`}>{item.status}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">{item.type}</span>
                                        {item.platform && <span className="text-[10px] text-text-muted">{item.platform}</span>}
                                        {item.ai_score && <span className="text-[10px] font-bold text-indigo-400">{item.ai_score}/10</span>}
                                        {item.tags?.map(t => (
                                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <select value={item.status} onChange={e => item.id && updateStatus(item.id, e.target.value)} className="input text-[10px] py-0.5 w-auto">
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button onClick={() => aiTagItem(item)} disabled={taggingId === item.id} className="btn-icon text-xs" title="AI Tag">
                                        {taggingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Tag size={12} />}
                                    </button>
                                    <button onClick={() => copyText(item.content, `v-${i}`)} className="btn-icon text-xs">
                                        {copied === `v-${i}` ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                                    </button>
                                    <button onClick={() => item.id && deleteItem(item.id)} className="btn-icon text-xs text-red-400 hover:text-red-300">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            {item.ai_notes && <p className="text-caption mt-2 text-indigo-400/80 italic">{item.ai_notes}</p>}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAddModal(false)}>
                    <div className="bg-surface border border-border rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-h3 text-text-primary">Add to Vault</h3>
                            <button onClick={() => setShowAddModal(false)} className="btn-icon"><X size={14} /></button>
                        </div>
                        <div className="space-y-4">
                            <input type="text" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} className="input" placeholder="Title" />
                            <textarea value={newItem.content} onChange={e => setNewItem({ ...newItem, content: e.target.value })} rows={5} className="input resize-none" placeholder="Content..." />

                            {/* File Upload Zone */}
                            <div>
                                <label className="text-caption mb-1 block">Attachments</label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-border hover:border-text-secondary'}`}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <input type="file" id="file-upload" multiple className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                                    {uploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={24} className="animate-spin text-indigo-500" />
                                            <span className="text-xs text-text-muted">Uploading...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload size={20} className="text-text-muted" />
                                            <span className="text-xs text-text-muted">Drag & drop files or click to browse</span>
                                        </div>
                                    )}
                                </div>

                                {/* Attached Files List */}
                                {newItem.assets && newItem.assets.length > 0 && (
                                    <div className="space-y-2 mt-3">
                                        {newItem.assets.map((asset, i) => (
                                            <div key={i} className="flex items-center justify-between bg-surface-2 p-2 rounded-lg border border-border">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    {getFileIcon(asset.type)}
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-medium text-text-primary truncate">{asset.name}</p>
                                                        <p className="text-[10px] text-text-muted">{(asset.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setNewItem(prev => ({ ...prev, assets: prev.assets?.filter((_, idx) => idx !== i) }))}
                                                    className="btn-icon text-text-muted hover:text-red-400"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} className="input">
                                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <select value={newItem.platform} onChange={e => setNewItem({ ...newItem, platform: e.target.value })} className="input">
                                    {['LinkedIn', 'Twitter/X', 'Instagram', 'YouTube', 'TikTok', 'Email'].map(p => <option key={p}>{p}</option>)}
                                </select>
                                <select value={newItem.status} onChange={e => setNewItem({ ...newItem, status: e.target.value })} className="input">
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-caption mb-1 block">Tags</label>
                                <div className="flex gap-2">
                                    <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} className="input flex-1" placeholder="Add tag..." onKeyDown={e => { if (e.key === 'Enter' && newTag.trim()) { setNewItem({ ...newItem, tags: [...(newItem.tags || []), newTag.trim()] }); setNewTag('') } }} />
                                    <button onClick={() => { if (newTag.trim()) { setNewItem({ ...newItem, tags: [...(newItem.tags || []), newTag.trim()] }); setNewTag('') } }} className="btn-secondary">Add</button>
                                </div>
                                {newItem.tags && newItem.tags.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap mt-2">
                                        {newItem.tags.map((t, i) => (
                                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                                                {t} <button onClick={() => setNewItem({ ...newItem, tags: newItem.tags?.filter((_, idx) => idx !== i) })} className="hover:text-white"><X size={10} /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={saveItem} disabled={saving || !newItem.title?.trim()} className="btn-primary bg-indigo-600 w-full">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                {saving ? 'Saving...' : 'Save to Vault'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewItem(null)}>
                    <div className="bg-surface border border-border rounded-xl w-full max-w-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-h3 text-text-primary">{viewItem.title}</h3>
                            <button onClick={() => setViewItem(null)} className="btn-icon"><X size={14} /></button>
                        </div>

                        <p className="text-body text-text-secondary whitespace-pre-wrap mb-6">{viewItem.content}</p>

                        {/* Attachments in View Modal */}
                        {viewItem.assets && viewItem.assets.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-caption mb-2 font-bold uppercase tracking-wider text-text-primary">Attachments ({viewItem.assets.length})</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {viewItem.assets.map((asset, i) => (
                                        <a key={i} href={asset.url} target="_blank" rel="noopener noreferrer" className="group block bg-surface-2 rounded-lg overflow-hidden border border-border hover:border-indigo-500 transition-colors">
                                            {asset.type.startsWith('image/') ? (
                                                <div className="aspect-video relative overflow-hidden bg-black/20">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={asset.url} alt={asset.name} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            ) : (
                                                <div className="aspect-video flex items-center justify-center bg-surface-hover">
                                                    {getFileIcon(asset.type)}
                                                </div>
                                            )}
                                            <div className="p-2">
                                                <p className="text-xs font-medium text-text-primary truncate">{asset.name}</p>
                                                <p className="text-[10px] text-text-muted">{(asset.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">{viewItem.type}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">{viewItem.status}</span>
                            {viewItem.platform && <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">{viewItem.platform}</span>}
                        </div>
                        <button onClick={() => { copyText(viewItem.content, 'view-copy'); }} className="btn-secondary mt-4 w-full">
                            {copied === 'view-copy' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                            Copy Content
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
