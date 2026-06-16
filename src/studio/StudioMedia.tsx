import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './icons'
import { supabase } from '../lib/supabase'

const BUCKET = 'lumia-products'
const card: CSSProperties = { background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 'var(--st-r-md)' }
const IMG_EXT = /\.(webp|jpg|jpeg|png|gif|avif|svg)$/i

interface Asset { name: string; url: string; size: number }

export default function StudioMedia() {
  const [assets, setAssets] = useState<Asset[] | null>(null)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const { data } = await supabase.storage.from(BUCKET).list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })
    const items = (data || []).filter(f => IMG_EXT.test(f.name)).map(f => ({
      name: f.name,
      url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      size: (f.metadata?.size as number) || 0,
    }))
    setAssets(items)
  }
  useEffect(() => { load() }, [])

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '31536000', upsert: false })
    }
    setUploading(false)
    load()
  }

  const copy = (url: string) => { navigator.clipboard?.writeText(url); setCopied(url); setTimeout(() => setCopied(c => (c === url ? '' : c)), 1500) }
  const del = async (a: Asset) => { if (!confirm(`Delete ${a.name}?`)) return; await supabase.storage.from(BUCKET).remove([a.name]); load() }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: '26px 30px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 600, margin: 0 }}>Media Studio</h1>
          <p style={{ color: 'var(--st-text-3)', fontSize: 13, margin: '4px 0 0' }}>{assets ? `${assets.length} images` : 'Loading…'} · stored in {BUCKET}</p>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 14px', borderRadius: 8, background: 'var(--st-accent)', color: '#1a1410', fontSize: 12.5, fontWeight: 500 }}>
          <Icon name="plus" size={15} /> {uploading ? 'Uploading…' : 'Upload images'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { upload(e.target.files); e.target.value = '' }} />
      </div>

      {!assets ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>{[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="st-skel" style={{ aspectRatio: '1', borderRadius: 10 }} />)}</div>
        : assets.length === 0 ? <div style={{ ...card, padding: 48, textAlign: 'center', color: 'var(--st-text-3)', fontSize: 13 }}>No images yet — upload your first above.</div>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
              {assets.map(a => (
                <div key={a.name} style={{ ...card, overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '1', background: 'var(--st-bg-1)', position: 'relative' }}>
                    <img src={a.url} alt={a.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: 'var(--st-text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 7 }} title={a.name}>{a.name}{a.size ? ` · ${(a.size / 1024).toFixed(0)}KB` : ''}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => copy(a.url)} style={mini}>{copied === a.url ? '✓ Copied' : 'Copy URL'}</button>
                      <button onClick={() => del(a)} style={{ ...mini, flex: '0 0 30px', color: 'var(--st-danger)', borderColor: 'rgba(240,114,107,.3)' }} aria-label="Delete">✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
    </motion.div>
  )
}

const mini: CSSProperties = { flex: 1, height: 26, borderRadius: 6, border: '1px solid var(--st-border)', color: 'var(--st-text-2)', fontSize: 10.5, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }
