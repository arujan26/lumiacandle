import { useEffect, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './icons'
import { adminLoadSettings, adminSaveSettings, type Settings } from '../lib/settings'
import { uploadProductImage } from '../lib/productsApi'

const SITE = (typeof location !== 'undefined' && /localhost|127\.0\.0\.1/.test(location.hostname)) ? location.origin : 'https://lumiacandle.com'

type Field = { k: string; label: string; type: 'text' | 'textarea' | 'image' }
interface PageCfg { id: string; label: string; path: string; fields: Field[] }

const PAGES: PageCfg[] = [
  { id: 'home', label: 'Home', path: '/', fields: [
    { k: 'home_hero_eyebrow', label: 'Hero eyebrow', type: 'text' },
    { k: 'home_hero_title', label: 'Hero title (empty = styled default)', type: 'textarea' },
    { k: 'hero_home', label: 'Hero image (desktop)', type: 'image' },
    { k: 'hero_home_mobile', label: 'Hero image (mobile)', type: 'image' },
  ] },
  { id: 'candles', label: 'Shop Candles', path: '/shop/candles', fields: [
    { k: 'candles_title', label: 'Title', type: 'text' },
    { k: 'candles_sub', label: 'Subtitle', type: 'textarea' },
    { k: 'hero_shop_candles', label: 'Banner image', type: 'image' },
  ] },
  { id: 'stickers', label: 'Shop Stickers', path: '/shop/stickers', fields: [
    { k: 'stickers_title', label: 'Title', type: 'text' },
    { k: 'stickers_sub', label: 'Subtitle', type: 'textarea' },
    { k: 'hero_shop_stickers', label: 'Banner image', type: 'image' },
  ] },
]

export default function StudioBuilder({ device, zoom }: { device: 'desktop' | 'mobile'; zoom: number }) {
  const [s, setS] = useState<Settings | null>(null)
  const [pageId, setPageId] = useState('home')
  const [bust, setBust] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { adminLoadSettings().then(v => setS(v)) }, [])

  const page = PAGES.find(p => p.id === pageId)!
  const set = (k: string, v: string) => { setS(p => ({ ...(p || {}), [k]: v })); setDirty(true) }

  const upload = async (k: string, file?: File) => {
    if (!file) return
    setUploading(k)
    try { set(k, await uploadProductImage(file)) } catch (e) { setMsg(e instanceof Error ? e.message : 'Upload failed') } finally { setUploading('') }
  }

  const save = async () => {
    if (!s) return
    setSaving(true); setMsg('')
    const { error } = await adminSaveSettings(s)
    setSaving(false)
    if (error) { setMsg(error); return }
    setDirty(false); setMsg('✓ Saved — live on the site'); setBust(b => b + 1)
    setTimeout(() => setMsg(''), 2500)
  }

  const frameW = device === 'mobile' ? 390 : 1280
  const scale = zoom / 100

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      {/* Pages */}
      <div style={{ width: 188, flexShrink: 0, background: 'var(--st-bg-1)', borderRight: '1px solid var(--st-border)', padding: 10 }}>
        <div style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--st-text-3)', padding: '6px 8px 10px' }}>Pages</div>
        {PAGES.map(p => (
          <button key={p.id} onClick={() => { setPageId(p.id); setBust(b => b + 1) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 7, marginBottom: 2, textAlign: 'left', background: pageId === p.id ? 'var(--st-accent-soft)' : 'transparent', color: pageId === p.id ? 'var(--st-text)' : 'var(--st-text-2)', cursor: 'pointer' }}>
            <Icon name="pages" size={14} style={{ color: pageId === p.id ? 'var(--st-accent)' : 'var(--st-text-3)' }} />
            <span style={{ fontSize: 12.5 }}>{p.label}</span>
          </button>
        ))}
        <a href={`${SITE}${page.path}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', marginTop: 10, fontSize: 11.5, color: 'var(--st-text-3)', borderTop: '1px solid var(--st-border)' }}>
          <Icon name="external" size={13} /> Open live page
        </a>
      </div>

      {/* Live preview */}
      <div style={{ flex: 1, minWidth: 0, background: 'var(--st-bg)', position: 'relative', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '34px 24px', transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform .18s ease' }}>
          <div style={{ width: frameW, height: 760, background: '#fff', borderRadius: device === 'mobile' ? 22 : 10, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,.5)', border: '1px solid var(--st-border)' }}>
            <iframe key={`${pageId}-${bust}`} title="preview" src={`${SITE}${page.path}?preview=${bust}`} style={{ width: '100%', height: '100%', border: 0, display: 'block' }} />
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'var(--st-text-3)', background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 999, padding: '4px 12px' }}>
          {device === 'mobile' ? 'Mobile · 390px' : 'Desktop · 1280px'} · {zoom}% · live preview
        </div>
      </div>

      {/* Editor */}
      <div style={{ width: 296, flexShrink: 0, background: 'var(--st-bg-1)', borderLeft: '1px solid var(--st-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 42, flexShrink: 0, borderBottom: '1px solid var(--st-border)', display: 'flex', alignItems: 'center', padding: '0 14px', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Edit · {page.label}</span>
          {dirty && <span style={{ fontSize: 10, color: 'var(--st-pending)' }}>● unsaved</span>}
        </div>
        {!s ? <div style={{ padding: 16 }}><div className="st-skel" style={{ height: 80 }} /></div> : (
          <motion.div key={pageId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ overflowY: 'auto', padding: 14, flex: 1 }}>
            {page.fields.map(f => (
              <div key={f.k} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--st-text-3)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                {f.type === 'image' ? (
                  <div>
                    <div style={{ width: '100%', height: 76, borderRadius: 8, background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', backgroundImage: s[f.k] ? `url(${s[f.k]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 8 }} />
                    <label style={pill}>
                      {uploading === f.k ? 'Uploading…' : s[f.k] ? 'Replace image' : 'Upload image'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={!!uploading} onChange={e => upload(f.k, e.target.files?.[0])} />
                    </label>
                    {s[f.k] && <button onClick={() => set(f.k, '')} style={{ ...pill, marginLeft: 6, color: 'var(--st-danger)' }}>Remove</button>}
                  </div>
                ) : f.type === 'textarea' ? (
                  <textarea value={s[f.k] || ''} onChange={e => set(f.k, e.target.value)} style={{ ...inp, minHeight: 64, resize: 'vertical' }} />
                ) : (
                  <input value={s[f.k] || ''} onChange={e => set(f.k, e.target.value)} style={inp} />
                )}
              </div>
            ))}

            <div style={{ marginTop: 4, paddingTop: 14, borderTop: '1px solid var(--st-border)' }}>
              <label style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--st-text-3)', display: 'block', marginBottom: 6 }}>Brand accent (whole site)</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={s.accent || '#b8945a'} onChange={e => set('accent', e.target.value)} style={{ width: 38, height: 32, border: '1px solid var(--st-border)', background: 'none', padding: 2, cursor: 'pointer', borderRadius: 6 }} />
                <input value={s.accent || ''} onChange={e => set('accent', e.target.value)} style={{ ...inp, flex: 1 }} />
              </div>
            </div>
          </motion.div>
        )}
        <div style={{ padding: 14, borderTop: '1px solid var(--st-border)' }}>
          <button onClick={save} disabled={saving || !dirty} style={{ width: '100%', height: 36, borderRadius: 8, background: dirty ? 'var(--st-accent)' : 'var(--st-bg-3)', color: dirty ? '#1a1410' : 'var(--st-text-3)', fontSize: 12.5, fontWeight: 500, cursor: dirty ? 'pointer' : 'default' }}>
            {saving ? 'Publishing…' : 'Publish changes'}
          </button>
          {msg && <p style={{ fontSize: 11.5, marginTop: 8, textAlign: 'center', color: msg.startsWith('✓') ? 'var(--st-live)' : 'var(--st-danger)' }}>{msg}</p>}
        </div>
      </div>
    </div>
  )
}

const inp: CSSProperties = { width: '100%', background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 7, color: 'var(--st-text)', fontSize: 12.5, padding: '8px 10px', outline: 'none', fontFamily: 'inherit' }
const pill: CSSProperties = { display: 'inline-block', fontSize: 10.5, letterSpacing: '.05em', padding: '7px 11px', border: '1px solid var(--st-border)', borderRadius: 7, background: 'transparent', color: 'var(--st-text-2)', cursor: 'pointer' }
