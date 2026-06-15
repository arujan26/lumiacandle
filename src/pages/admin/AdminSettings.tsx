import { useEffect, useState } from 'react'
import { adminLoadSettings, adminSaveSettings, type Settings } from '../../lib/settings'
import { uploadProductImage } from '../../lib/productsApi'
import ImageFramePicker from '../../components/ImageFramePicker'

interface HeroCfg { key: string; label: string; desktop: string; mobile: string; recD: string; recM: string }
const HEROES: HeroCfg[] = [
  { key: 'hero_home', label: 'Home — full-screen hero', desktop: '16 / 9', mobile: '9 / 16', recD: 'Landscape — ideal 2000 × 1300 px.', recM: 'Portrait — ideal 1080 × 1920 px (tall, for phones).' },
  { key: 'hero_shop_candles', label: 'Shop Candles — top banner', desktop: '16 / 6', mobile: '4 / 3', recD: 'Wide — ideal 1600 × 1100 px.', recM: 'Ideal 1200 × 900 px.' },
  { key: 'hero_shop_stickers', label: 'Shop Stickers — top banner', desktop: '16 / 6', mobile: '4 / 3', recD: 'Wide — ideal 1600 × 1100 px.', recM: 'Ideal 1200 × 900 px.' },
  { key: 'hero_about', label: 'About — image (optional)', desktop: '16 / 7', mobile: '4 / 3', recD: 'Wide — ideal 1600 × 900 px.', recM: 'Ideal 1200 × 900 px.' },
  { key: 'hero_contact', label: 'Contact — image (optional)', desktop: '16 / 7', mobile: '4 / 3', recD: 'Wide — ideal 1600 × 900 px.', recM: 'Ideal 1200 × 900 px.' },
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
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Upload a photo, then drag the <strong>Horizontal / Vertical</strong> sliders to frame it. The previews show <strong>exactly</strong> how it crops on desktop and mobile — what you see is what goes live.
        </p>
        {HEROES.map(h => (
          <div key={h.key} style={{ marginBottom: 26, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>{h.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <ImageFramePicker
                label="💻 Desktop"
                url={s[h.key] || ''}
                position={s[`${h.key}_pos`] || '50% 50%'}
                onPosition={pos => set(`${h.key}_pos`, pos)}
                onUpload={f => upload(h.key, f)}
                onRemove={() => { set(h.key, ''); set(`${h.key}_pos`, '50% 50%') }}
                uploading={uploading === h.key}
                recommend={h.recD}
                desktopAspect={h.desktop}
              />
              <ImageFramePicker
                label="📱 Mobile (optional)"
                url={s[`${h.key}_mobile`] || ''}
                position={s[`${h.key}_mobile_pos`] || '50% 50%'}
                onPosition={pos => set(`${h.key}_mobile_pos`, pos)}
                onUpload={f => upload(`${h.key}_mobile`, f)}
                onRemove={() => { set(`${h.key}_mobile`, ''); set(`${h.key}_mobile_pos`, '50% 50%') }}
                uploading={uploading === `${h.key}_mobile`}
                recommend={`${h.recM} Leave empty to reuse the desktop photo.`}
                desktopAspect={h.mobile}
              />
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
