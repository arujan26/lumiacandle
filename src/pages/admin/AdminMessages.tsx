import { useEffect, useState } from 'react'
import { adminListMessages, adminUpdateMessage, type Message } from '../../lib/messages'

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminListMessages().then(m => { setMessages(m); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  const newCount = messages.filter(m => m.status === 'new').length

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(28px,3.5vw,40px)', marginBottom: 4 }}>
          Messages {newCount > 0 && <span style={{ fontSize: 13, color: 'var(--white)', background: 'var(--gold)', borderRadius: 20, padding: '2px 10px', verticalAlign: 'middle', fontFamily: 'var(--sans)' }}>{newCount} new</span>}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Leads & contact messages from the website.</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : messages.length === 0 ? (
        <div style={{ border: '1px solid var(--line)', padding: '48px 24px', textAlign: 'center', background: 'var(--white)' }}>
          <p style={{ color: 'var(--muted)' }}>No messages yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(m => <Row key={m.id} m={m} onChanged={load} />)}
        </div>
      )}
    </div>
  )
}

function Row({ m, onChanged }: { m: Message; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const date = m.created_at ? new Date(m.created_at).toLocaleString() : ''
  const isNew = m.status === 'new'

  const setStatus = async (status: string) => {
    setBusy(true)
    await adminUpdateMessage(m.id, status)
    setBusy(false); onChanged()
  }

  return (
    <div style={{ border: '1px solid var(--line)', background: m.status === 'archived' ? 'var(--cream)' : 'var(--white)', padding: 20, opacity: m.status === 'archived' ? 0.7 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>{m.name || 'Anonymous'}</span>
          {isNew && <span style={{ marginLeft: 10, fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', background: 'var(--gold)', color: 'white', padding: '3px 8px', fontWeight: 600 }}>New</span>}
          <div><a href={`mailto:${m.email}`} style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none' }}>{m.email}</a></div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted-light)' }}>{date}</span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.65, whiteSpace: 'pre-wrap', marginBottom: 14 }}>{m.message}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a href={`mailto:${m.email}?subject=Re: your message to Lumia`} style={btn}>Reply by email</a>
        {isNew && <button onClick={() => setStatus('read')} disabled={busy} style={{ ...btn, background: 'transparent', color: 'var(--ink)' }}>Mark read</button>}
        {m.status !== 'archived'
          ? <button onClick={() => setStatus('archived')} disabled={busy} style={{ ...btn, background: 'transparent', color: 'var(--muted)' }}>Archive</button>
          : <button onClick={() => setStatus('read')} disabled={busy} style={{ ...btn, background: 'transparent', color: 'var(--ink)' }}>Unarchive</button>}
      </div>
    </div>
  )
}

const btn: React.CSSProperties = {
  padding: '8px 14px', border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--white)',
  fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, textDecoration: 'none', display: 'inline-block',
}
