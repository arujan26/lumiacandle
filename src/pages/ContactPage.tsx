import { useState } from 'react'
import { sendMessage } from '../lib/messages'
import { useSettings } from '../lib/settings'

export default function ContactPage() {
  const settings = useSettings()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    const { error: err } = await sendMessage(name.trim(), email.trim(), message.trim())
    setBusy(false)
    if (err) { setError('Something went wrong. Please try again.'); return }
    setSent(true)
  }

  const igHandle = (settings.instagram || '').split('/').filter(Boolean).pop() || 'lumiacandles'
  const ttHandle = (settings.tiktok || '').split('/').filter(Boolean).pop() || '@lumiacandles'

  return (
    <>
      <section style={{ background: 'var(--cream)', padding: '120px 0 72px', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>Get in Touch</span>
          <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: .95 }}>Contact</h1>
          <p className="lead" style={{ margin: '24px auto 0' }}>We'd love to hear from you. We reply within 24–48 hours.</p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="wrap" style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'start' }}>
            {/* Form */}
            <div>
              <h2 style={{ fontSize: 'clamp(26px,3vw,38px)', marginBottom: 8 }}>Send us a message</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>Order questions, wholesale, or just to say hi.</p>
              {sent ? (
                <div style={{ background: 'var(--ivory)', border: '1px solid var(--line)', padding: '40px 28px', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 44, color: 'var(--champagne)', display: 'block', marginBottom: 14 }}>✦</span>
                  <h3 style={{ fontSize: 24, marginBottom: 8 }}>Message sent!</h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)' }}>Thank you — we'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <Field label="Your name"><input style={inp} value={name} onChange={e => setName(e.target.value)} required /></Field>
                  <Field label="Email"><input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} required /></Field>
                  <Field label="Message"><textarea style={{ ...inp, minHeight: 120, resize: 'vertical' }} value={message} onChange={e => setMessage(e.target.value)} required /></Field>
                  {error && <p style={{ color: '#c04a3a', fontSize: 13, marginBottom: 10 }}>{error}</p>}
                  <button className="btn btn-dark" type="submit" style={{ width: '100%' }} disabled={busy}>
                    {busy ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              )}
            </div>

            {/* Channels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Email', value: settings.contact_email || 'contact@lumiacandle.com', href: `mailto:${settings.contact_email || 'contact@lumiacandle.com'}` },
                { label: 'Instagram', value: `@${igHandle}`, href: settings.instagram || 'https://instagram.com/lumiacandles' },
                { label: 'TikTok', value: ttHandle.startsWith('@') ? ttHandle : `@${ttHandle}`, href: settings.tiktok || 'https://tiktok.com/@lumiacandles' },
              ].map(c => (
                <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  style={{ display: 'block', background: 'var(--ivory)', border: '1px solid var(--line)', padding: '20px 24px', textDecoration: 'none', transition: 'border-color .3s' }}>
                  <span style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, display: 'block', marginBottom: 6 }}>{c.label}</span>
                  <span style={{ fontSize: 15, color: 'var(--ink)' }}>{c.value}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid var(--line)',
  background: 'var(--ivory)', fontSize: 14, color: 'var(--ink)', outline: 'none',
  borderRadius: 0, fontFamily: 'var(--sans)',
}
