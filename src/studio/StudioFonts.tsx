import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './icons'
import {
  adminListFonts, uploadFontFile, insertFont, updateFont, deleteFont,
  validateFontFile, fontFaceCss, fallbackFor, sanitizeFamily, HEAVY_BYTES,
  type FontRow, type FontRole, type FontStatus,
} from '../lib/fonts'

const card: CSSProperties = { background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 'var(--st-r-md)', padding: 20 }
const CATS = ['serif', 'sans-serif', 'display', 'script', 'mono']
const WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900']
const ROLES: { v: FontRole; l: string }[] = [
  { v: 'none', l: 'Available only' }, { v: 'global', l: 'Whole site' },
  { v: 'headings', l: 'Headings' }, { v: 'body', l: 'Paragraphs' }, { v: 'buttons', l: 'Buttons' },
]
const kb = (n: number | null) => n ? `${(n / 1024).toFixed(0)} KB` : '—'

export default function StudioFonts() {
  const [fonts, setFonts] = useState<FontRow[]>([])
  const [loading, setLoading] = useState(true)
  const load = () => { adminListFonts().then(f => { setFonts(f); setLoading(false) }).catch(() => setLoading(false)) }
  useEffect(load, [])

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = fonts.map(fontFaceCss).join('\n')
    document.head.appendChild(el)
    return () => el.remove()
  }, [fonts])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: '26px 30px', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, margin: 0 }}>Fonts</h1>
        <p style={{ color: 'var(--st-text-3)', fontSize: 13, margin: '4px 0 0' }}>Upload your own fonts (.woff, .woff2, .ttf, .otf) — no Google Fonts needed.</p>
      </div>

      <UploadCard onAdded={load} />

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 13, color: 'var(--st-text-2)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="audit" size={15} /> Font library {fonts.length > 0 && <span style={{ color: 'var(--st-text-3)' }}>({fonts.length})</span>}
        </div>
        {loading ? <div className="st-skel" style={{ height: 80 }} />
          : fonts.length === 0 ? <div style={{ ...card, textAlign: 'center', color: 'var(--st-text-3)', fontSize: 13, padding: 36 }}>No fonts yet. Upload your first above.</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{fonts.map(f => <FontCard key={f.id} f={f} onChanged={load} />)}</div>}
      </div>
    </motion.div>
  )
}

function UploadCard({ onAdded }: { onAdded: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<'idle' | 'uploading' | 'form'>('idle')
  const [err, setErr] = useState('')
  const [up, setUp] = useState<{ url: string; size: number; format: string } | null>(null)
  const [form, setForm] = useState({ name: '', family_name: '', category: 'sans-serif', weight: '400', style: 'normal', license_type: '', role: 'none' as FontRole })
  const [size, setSize] = useState(38)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!up) return
    const el = document.createElement('style')
    el.textContent = `@font-face{font-family:'__lumia_preview';src:url('${up.url}') format('${up.format}');font-display:swap;}`
    document.head.appendChild(el)
    return () => el.remove()
  }, [up])

  const pick = (file?: File) => {
    if (!file) return
    const v = validateFontFile(file)
    if (!v.ok) { setErr(v.error || 'Invalid file'); return }
    setErr(''); setStage('uploading')
    const base = file.name.replace(/\.[^.]+$/, '')
    uploadFontFile(file)
      .then(r => { setUp(r); setForm(f => ({ ...f, name: f.name || base, family_name: f.family_name || base })); setStage('form') })
      .catch(e => { setErr(e instanceof Error ? e.message : 'Upload failed'); setStage('idle') })
  }

  const save = async (status: FontStatus) => {
    if (!up) return
    if (!form.name.trim() || !form.family_name.trim()) { setErr('Name and family are required.'); return }
    setSaving(true); setErr('')
    const { error } = await insertFont({
      name: form.name.trim(), file_url: up.url, family_name: form.family_name.trim(),
      weight: form.weight, style: form.style, category: form.category, status, role: form.role,
      license_type: form.license_type.trim() || null, file_size: up.size, format: up.format,
    })
    setSaving(false)
    if (error) { setErr(error); return }
    setStage('idle'); setUp(null); setForm({ name: '', family_name: '', category: 'sans-serif', weight: '400', style: 'normal', license_type: '', role: 'none' })
    onAdded()
  }

  const heavy = up && up.size > HEAVY_BYTES

  return (
    <div style={card}>
      {stage !== 'form' && (
        <button onClick={() => fileRef.current?.click()} disabled={stage === 'uploading'}
          style={{ width: '100%', border: '1.5px dashed var(--st-border-2)', borderRadius: 10, padding: '34px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: 'var(--st-bg-1)', color: 'var(--st-text-2)' }}>
          <Icon name={stage === 'uploading' ? 'bolt' : 'media'} size={26} style={{ color: 'var(--st-accent)' }} />
          <span style={{ fontSize: 14, color: 'var(--st-text)' }}>{stage === 'uploading' ? 'Uploading…' : 'Click to upload a font file'}</span>
          <span style={{ fontSize: 11.5, color: 'var(--st-text-3)' }}>.woff · .woff2 · .ttf · .otf — max 2 MB</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept=".woff,.woff2,.ttf,.otf" style={{ display: 'none' }} onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }} />

      {stage === 'form' && up && (
        <div>
          {/* Live preview */}
          <div style={{ background: 'var(--st-bg-1)', border: '1px solid var(--st-border)', borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--st-text-3)' }}>Live preview · {up.format} · {kb(up.size)}</span>
              <input type="range" min={16} max={72} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width: 120, accentColor: 'var(--st-accent)' }} />
            </div>
            <div style={{ fontFamily: '__lumia_preview', fontSize: size, color: 'var(--st-text)', lineHeight: 1.2, fontStyle: form.style as 'normal' | 'italic', fontWeight: Number(form.weight) }}>
              The quick brown fox jumps
            </div>
            <div style={{ fontFamily: '__lumia_preview', fontSize: 14, color: 'var(--st-text-2)', marginTop: 8 }}>ABCDEFG abcdefg 0123456789</div>
            {heavy && <div style={{ marginTop: 12, fontSize: 12, color: 'var(--st-pending)', display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="bolt" size={13} /> Heavy file ({kb(up.size)}). Prefer .woff2 for performance.</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Display name"><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Aktiv Grotesk" /></Field>
            <Field label="CSS family name"><input style={inp} value={form.family_name} onChange={e => setForm(f => ({ ...f, family_name: e.target.value }))} /></Field>
            <Field label="Category"><Select v={form.category} opts={CATS} onV={v => setForm(f => ({ ...f, category: v }))} /></Field>
            <Field label="Weight"><Select v={form.weight} opts={WEIGHTS} onV={v => setForm(f => ({ ...f, weight: v }))} /></Field>
            <Field label="Style"><Select v={form.style} opts={['normal', 'italic']} onV={v => setForm(f => ({ ...f, style: v }))} /></Field>
            <Field label="Apply to"><Select v={form.role} opts={ROLES.map(r => r.v)} labels={ROLES.map(r => r.l)} onV={v => setForm(f => ({ ...f, role: v as FontRole }))} /></Field>
            <Field label="License (optional)"><input style={inp} value={form.license_type} onChange={e => setForm(f => ({ ...f, license_type: e.target.value }))} placeholder="e.g. Personal / Commercial" /></Field>
            <Field label="Fallback (auto)"><div style={{ ...inp, color: 'var(--st-text-3)', display: 'flex', alignItems: 'center' }}>{fallbackFor(form.category)}</div></Field>
          </div>

          {err && <p style={{ color: 'var(--st-danger)', fontSize: 12.5, margin: '10px 0 0' }}>{err}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => save('active')} disabled={saving} style={btnPrimary}>{saving ? 'Saving…' : 'Publish (live now)'}</button>
            <button onClick={() => save('draft')} disabled={saving} style={btnGhost}>Save as draft</button>
            <button onClick={() => { setStage('idle'); setUp(null); setErr('') }} style={{ ...btnGhost, marginLeft: 'auto' }}>Cancel</button>
          </div>
        </div>
      )}
      {err && stage !== 'form' && <p style={{ color: 'var(--st-danger)', fontSize: 12.5, margin: '10px 0 0' }}>{err}</p>}
    </div>
  )
}

function FontCard({ f, onChanged }: { f: FontRow; onChanged: () => void }) {
  const replaceRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const setStatus = async (status: FontStatus) => { setBusy(true); await updateFont(f.id, { status }); setBusy(false); onChanged() }
  const setRole = async (role: FontRole) => { setBusy(true); await updateFont(f.id, { role }); setBusy(false); onChanged() }
  const remove = async () => { if (!confirm(`Remove “${f.name}”?`)) return; setBusy(true); await deleteFont(f); onChanged() }
  const replace = async (file?: File) => {
    if (!file) return
    const v = validateFontFile(file); if (!v.ok) { alert(v.error); return }
    setBusy(true)
    try { const r = await uploadFontFile(file); await updateFont(f.id, { file_url: r.url, file_size: r.size, format: r.format }) } finally { setBusy(false); onChanged() }
  }

  const badge = f.status === 'active' ? ['Live', 'var(--st-live)'] : f.status === 'disabled' ? ['Disabled', 'var(--st-draft)'] : ['Draft', 'var(--st-pending)']

  return (
    <div style={{ ...card, padding: 16, opacity: busy ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{f.name}</span>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, color: badge[1], border: `1px solid ${badge[1]}33`, background: `${badge[1]}1a` }}>{badge[0]}</span>
            {f.role !== 'none' && <span style={{ fontSize: 10, color: 'var(--st-accent)', border: '1px solid var(--st-accent-soft)', borderRadius: 999, padding: '2px 7px' }}>{ROLES.find(r => r.v === f.role)?.l}</span>}
          </div>
          <div style={{ fontFamily: `'${sanitizeFamily(f.family_name)}', ${fallbackFor(f.category)}`, fontSize: 26, color: 'var(--st-text)', lineHeight: 1.1, fontWeight: Number(f.weight), fontStyle: f.style as 'normal' | 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            The quick brown fox
          </div>
          <div style={{ fontSize: 11, color: 'var(--st-text-3)', marginTop: 6 }}>{f.category} · {f.weight} · {f.style} · {f.format} · {kb(f.file_size)}{f.license_type ? ` · ${f.license_type}` : ''}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: 150, flexShrink: 0 }}>
          <Select v={f.role} opts={ROLES.map(r => r.v)} labels={ROLES.map(r => r.l)} onV={v => setRole(v as FontRole)} small />
          <div style={{ display: 'flex', gap: 6 }}>
            {f.status === 'active'
              ? <button onClick={() => setStatus('disabled')} style={miniBtn}>Disable</button>
              : <button onClick={() => setStatus('active')} style={{ ...miniBtn, color: 'var(--st-live)', borderColor: 'rgba(74,222,128,.3)' }}>Publish</button>}
            <button onClick={() => replaceRef.current?.click()} style={miniBtn}>Replace</button>
            <button onClick={remove} style={{ ...miniBtn, color: 'var(--st-danger)', borderColor: 'rgba(240,114,107,.3)', flex: '0 0 30px' }} aria-label="Remove">✕</button>
          </div>
        </div>
      </div>
      <input ref={replaceRef} type="file" accept=".woff,.woff2,.ttf,.otf" style={{ display: 'none' }} onChange={e => { replace(e.target.files?.[0]); e.target.value = '' }} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--st-text-3)', display: 'block', marginBottom: 5 }}>{label}</label>{children}</div>
}
function Select({ v, opts, labels, onV, small }: { v: string; opts: string[]; labels?: string[]; onV: (v: string) => void; small?: boolean }) {
  return (
    <select value={v} onChange={e => onV(e.target.value)} style={{ ...inp, padding: small ? '6px 8px' : '9px 10px', fontSize: small ? 12 : 13, appearance: 'none', cursor: 'pointer' }}>
      {opts.map((o, i) => <option key={o} value={o} style={{ background: '#161619' }}>{labels ? labels[i] : o}</option>)}
    </select>
  )
}

const inp: CSSProperties = { width: '100%', background: 'var(--st-bg-1)', border: '1px solid var(--st-border)', borderRadius: 7, color: 'var(--st-text)', fontSize: 13, padding: '9px 10px', outline: 'none', fontFamily: 'inherit' }
const btnPrimary: CSSProperties = { height: 34, padding: '0 16px', borderRadius: 8, background: 'var(--st-accent)', color: '#1a1410', fontSize: 12.5, fontWeight: 500 }
const btnGhost: CSSProperties = { height: 34, padding: '0 14px', borderRadius: 8, border: '1px solid var(--st-border)', color: 'var(--st-text-2)', fontSize: 12.5, background: 'transparent' }
const miniBtn: CSSProperties = { flex: 1, height: 26, borderRadius: 6, border: '1px solid var(--st-border)', color: 'var(--st-text-2)', fontSize: 10.5, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }
