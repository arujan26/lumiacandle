import { useEffect, useState } from 'react'
import { adminLoadSettings, adminSaveSettings, type Settings } from '../../lib/settings'
import { uploadProductImage } from '../../lib/productsApi'

const HEROES: { key: string; label: string }[] = [
  { key: 'hero_home', label: 'Home — hero background' },
  { key: 'hero_shop_candles', label: 'Shop Candles — banner' },
  { key: 'hero_shop_stickers', label: 'Shop Stickers — banner' },
  { key: 'hero_about', label: 'About — image (optional)' },
  { key: 'hero_contact', label: 'Contact — image (optional)' },
]

export default function AdminSettings() {
  const [s, setS] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { adminLoadSettings().then(v => { setS(v); setLoading(false) }) }, [])

  const set = (k: string, v: string) => setS(p => ({ ...p, [k]: v }))

  const upload = async (key: string, file?: File) => {
    if (!file) return
    setUploading(key); setMsg('')
    try { set(key, await uploadProductImage(file)) }
    catch (e) { setMsg(e instanceof Error ? e.message : 'Upload failed') }
    finally { setUploading('') }
  }

  const save = async () => {
    setSaving(true); setMsg('')
    const { error } = await adminSaveSettings(s)
    setSaving(false)
    setMsg(error ? error : '✓ Saved — changes are live on the site')
  }

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading…</p>

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(28px,3.5vw,40px)', marginBottom: 4 }}>Site Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Change hero photos, the top bar, brand color and contact info — no code needed.</p>
      </div>

      {/* Hero images */}
      <Section title="Hero photos">
        {HEROES.map(h => (
          <div key={h.key} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ width: 96, height: 60, flexShrink: 0, background: 'var(--cream)', border: '1px solid var(--line)', backgroundImage: s[h.key] ? `url(${s[h.key]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 6, fontWeight: 500 }}>{h.label}</div>
              <label style={{ ...pill, display: 'inline-block' }}>
                {uploading === h.key ? 'Uploading…' : 'Upload photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={!!uploading} onChange={e => upload(h.key, e.target.files?.[0])} />
              </label>
              {s[h.key] && <button onClick={() => set(h.key, '')} style={{ ...pill, marginLeft: 8, color: '#c04a3a' }}>Remove</button>}
            </div>
          </div>
        ))}
      </Section>

      {/* Top bar + brand */}
      <Section title="Top bar & brand">
        <Field label="Announcement bar text"><input style={inp} value={s.announcement || ''} onChange={e => set('announcement', e.target.value)} /></Field>
        <Field label="Brand accent color">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="color" value={s.accent || '#b8945a'} onChange={e => set('accent', e.target.value)} style={{ width: 48, height: 38, border: '1px solid var(--line)', padding: 2, background: 'none', cursor: 'pointer' }} />
            <input style={{ ...inp, maxWidth: 140 }} value={s.accent || ''} onChange={e => set('accent', e.target.value)} />
          </div>
        </Field>
      </Section>

      {/* Contact */}
      <Section title="Contact & social">
        <Field label="Contact email (receives leads)"><input style={inp} value={s.contact_email || ''} onChange={e => set('contact_email', e.target.value)} /></Field>
        <Field label="Instagram URL"><input style={inp} value={s.instagram || ''} onChange={e => set('instagram', e.target.value)} /></Field>
        <Field label="TikTok URL"><input style={inp} value={s.tiktok || ''} onChange={e => set('tiktok', e.target.value)} /></Field>
      </Section>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24, position: 'sticky', bottom: 0, background: 'var(--ivory)', padding: '14px 0' }}>
        <button className="btn btn-dark" onClick={save} disabled={saving || !!uploading}>{saving ? 'Saving…' : 'Save changes'}</button>
        {msg && <span style={{ fontSize: 13, color: msg.startsWith('✓') ? '#3a7a4a' : '#c04a3a' }}>{msg}</span>}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 20, marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>{title}</h2>
      {children}
    </section>
  )
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 5, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  )
}
const inp: React.CSSProperties = {
  width: '100%', padding: '11px 13px', border: '1px solid var(--line)',
  background: 'var(--ivory)', fontSize: 14, color: 'var(--ink)', outline: 'none', borderRadius: 0, fontFamily: 'var(--sans)',
}
const pill: React.CSSProperties = {
  fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', padding: '7px 12px',
  border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--ink)',
}
