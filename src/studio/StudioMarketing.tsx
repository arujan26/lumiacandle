import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './icons'
import { supabase } from '../lib/supabase'
import { TIERS } from '../lib/members'
import { adminListCustomers, type AdminCustomer } from '../lib/customersAdmin'
import { adminListCoupons, adminUpsertCoupon, adminDeleteCoupon, type Coupon } from '../lib/coupons'

const card: CSSProperties = { background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 'var(--st-r-md)', padding: 22 }
const inp: CSSProperties = { width: '100%', background: 'var(--st-bg-1)', border: '1px solid var(--st-border)', borderRadius: 7, color: 'var(--st-text)', fontSize: 13, padding: '9px 11px', outline: 'none', fontFamily: 'inherit' }
const btnPrimary: CSSProperties = { height: 34, padding: '0 16px', borderRadius: 8, background: 'var(--st-accent)', color: '#1a1410', fontSize: 12.5, fontWeight: 500 }
const chip: CSSProperties = { fontSize: 11.5, padding: '7px 12px', borderRadius: 99, border: '1px solid var(--st-border)', background: 'transparent', color: 'var(--st-text-2)', cursor: 'pointer' }

export default function StudioMarketing() {
  const [tab, setTab] = useState<'coupons' | 'campaigns'>('coupons')
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: '26px 30px', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 'clamp(28px,3.5vw,40px)', marginBottom: 4 }}>Marketing</h1>
        <p style={{ fontSize: 13, color: 'var(--st-text-3)' }}>Coupons, customer segments & targeted campaigns.</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['coupons', 'campaigns'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...chip, textTransform: 'capitalize', borderColor: tab === t ? 'var(--st-accent)' : 'var(--st-border)', background: tab === t ? 'var(--st-accent-soft)' : 'transparent', color: tab === t ? 'var(--st-text)' : 'var(--st-text-3)' }}>{t}</button>
        ))}
      </div>
      {tab === 'coupons' ? <Coupons /> : <Campaigns />}
    </motion.div>
  )
}

function Coupons() {
  const [list, setList] = useState<Coupon[]>([])
  const [f, setF] = useState({ code: '', type: 'percent', value: '10', min_subtotal: '0', max_uses: '', expires_at: '', description: '' })
  const [msg, setMsg] = useState('')
  const load = () => adminListCoupons().then(setList).catch(() => setList([]))
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!f.code.trim()) { setMsg('Code required'); return }
    const { error } = await adminUpsertCoupon({
      code: f.code, type: f.type as 'percent' | 'fixed', value: Number(f.value) || 0, active: true,
      min_subtotal: Number(f.min_subtotal) || 0, max_uses: f.max_uses ? Number(f.max_uses) : null,
      expires_at: f.expires_at ? new Date(f.expires_at).toISOString() : null, description: f.description || null,
    })
    setMsg(error ? error : '✓ Coupon created')
    if (!error) { setF({ code: '', type: 'percent', value: '10', min_subtotal: '0', max_uses: '', expires_at: '', description: '' }); load() }
    setTimeout(() => setMsg(''), 2200)
  }
  const toggle = async (c: Coupon) => { await adminUpsertCoupon({ code: c.code, active: !c.active }); load() }
  const del = async (c: Coupon) => { if (confirm(`Delete ${c.code}?`)) { await adminDeleteCoupon(c.code); load() } }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }} className="club-2col">
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>New coupon</div>
        <Field label="Code"><input style={{ ...inp, textTransform: 'uppercase' }} value={f.code} onChange={e => setF({ ...f, code: e.target.value })} placeholder="WELCOME10" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Type"><select style={inp} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}><option value="percent">% off</option><option value="fixed">$ off</option></select></Field>
          <Field label={f.type === 'percent' ? 'Percent' : 'Amount $'}><input style={inp} type="number" value={f.value} onChange={e => setF({ ...f, value: e.target.value })} /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Min subtotal $"><input style={inp} type="number" value={f.min_subtotal} onChange={e => setF({ ...f, min_subtotal: e.target.value })} /></Field>
          <Field label="Max uses"><input style={inp} type="number" value={f.max_uses} onChange={e => setF({ ...f, max_uses: e.target.value })} placeholder="∞" /></Field>
        </div>
        <Field label="Expires (optional)"><input style={inp} type="date" value={f.expires_at} onChange={e => setF({ ...f, expires_at: e.target.value })} /></Field>
        <button onClick={create} style={{ ...btnPrimary, width: '100%', marginTop: 4 }}>Create coupon</button>
        {msg && <p style={{ fontSize: 12, marginTop: 10, color: msg.startsWith('✓') ? 'var(--st-live)' : 'var(--st-danger)' }}>{msg}</p>}
      </div>

      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Active coupons ({list.length})</div>
        {list.length === 0 ? <p style={{ fontSize: 13, color: 'var(--st-text-3)' }}>No coupons yet.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map(c => (
              <div key={c.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid var(--st-border)', borderRadius: 9, opacity: c.active ? 1 : 0.5 }}>
                <div>
                  <div className="st-mono" style={{ fontSize: 14, letterSpacing: '.05em' }}>{c.code}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--st-text-3)' }}>
                    {c.type === 'percent' ? `${c.value}% off` : `$${c.value} off`}{Number(c.min_subtotal) > 0 ? ` · min $${c.min_subtotal}` : ''} · used {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}{c.expires_at ? ` · exp ${new Date(c.expires_at).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggle(c)} style={chip}>{c.active ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => del(c)} style={{ ...chip, color: 'var(--st-danger)' }}>✕</button>
                </div>
              </div>
            ))}
          </div>}
      </div>
    </div>
  )
}

function Campaigns() {
  const [rows, setRows] = useState<AdminCustomer[]>([])
  const [seg, setSeg] = useState({ tier: 'all', vip: false, minSpent: '', has: 'any', birthdayMonth: '' })
  const [subject, setSubject] = useState('')
  const [heading, setHeading] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => { adminListCustomers().then(setRows).catch(() => setRows([])) }, [])

  const recipients = useMemo(() => {
    const now = Date.now()
    return rows.filter(c => {
      if (!c.email) return false
      if (seg.vip && !c.vip) return false
      if (seg.tier !== 'all' && c.tierName.toLowerCase().replace(/\s/g, '') !== seg.tier) return false
      if (seg.minSpent && c.spent < Number(seg.minSpent)) return false
      if (seg.has === 'orders' && c.orders === 0) return false
      if (seg.has === 'noorders' && c.orders > 0) return false
      if (seg.has === 'winback') { if (c.orders === 0) return false; if (c.lastActive && (now - new Date(c.lastActive).getTime()) < 30 * 86400000) return false }
      if (seg.birthdayMonth && (!c.birthday || (new Date(c.birthday).getMonth() + 1) !== Number(seg.birthdayMonth))) return false
      return true
    })
  }, [rows, seg])

  const send = async () => {
    if (!subject.trim() || !bodyText.trim()) { setMsg('Subject and message required'); return }
    if (recipients.length === 0) { setMsg('No recipients in this segment'); return }
    if (!confirm(`Send to ${recipients.length} customer(s)?`)) return
    setSending(true); setMsg('')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/.netlify/functions/send-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
      body: JSON.stringify({ recipients: recipients.map(r => r.email), subject, heading: heading || subject, bodyText }),
    })
    const d = await res.json().catch(() => ({}))
    setSending(false)
    setMsg(res.ok ? `✓ Sent to ${d.sent}/${d.total}` : (d.error || 'Send failed'))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }} className="club-2col">
      {/* Segment */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Segment</div>
        <Field label="Membership tier"><select style={inp} value={seg.tier} onChange={e => setSeg({ ...seg, tier: e.target.value })}><option value="all">All tiers</option>{TIERS.map(t => <option key={t.id} value={t.name.toLowerCase().replace(/\s/g, '')}>{t.name}</option>)}</select></Field>
        <Field label="Customers"><select style={inp} value={seg.has} onChange={e => setSeg({ ...seg, has: e.target.value })}><option value="any">Everyone</option><option value="orders">Has ordered</option><option value="noorders">Never ordered</option><option value="winback">Win-back (no order 30d)</option></select></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Min spent $"><input style={inp} type="number" value={seg.minSpent} onChange={e => setSeg({ ...seg, minSpent: e.target.value })} placeholder="0" /></Field>
          <Field label="Birthday month"><select style={inp} value={seg.birthdayMonth} onChange={e => setSeg({ ...seg, birthdayMonth: e.target.value })}><option value="">Any</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'short' })}</option>)}</select></Field>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginTop: 6, color: 'var(--st-text-2)' }}>
          <input type="checkbox" checked={seg.vip} onChange={e => setSeg({ ...seg, vip: e.target.checked })} /> VIP only
        </label>
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--st-accent-soft)', borderRadius: 9, textAlign: 'center' }}>
          <span className="st-mono" style={{ fontSize: 24, fontWeight: 500, color: 'var(--st-accent)' }}>{recipients.length}</span>
          <div style={{ fontSize: 11, color: 'var(--st-text-3)' }}>matching customers</div>
        </div>
      </div>

      {/* Compose */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Email campaign</div>
        <Field label="Subject"><input style={inp} value={subject} onChange={e => setSubject(e.target.value)} placeholder="A little something for you ✨" /></Field>
        <Field label="Heading (in email)"><input style={inp} value={heading} onChange={e => setHeading(e.target.value)} placeholder="We miss you" /></Field>
        <Field label="Message"><textarea style={{ ...inp, minHeight: 130, resize: 'vertical' }} value={bodyText} onChange={e => setBodyText(e.target.value)} placeholder={'Hi lovely,\n\nYour next ritual is waiting...'} /></Field>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={send} disabled={sending} style={btnPrimary}>{sending ? 'Sending…' : `Send to ${recipients.length}`}</button>
          {msg && <span style={{ fontSize: 12.5, color: msg.startsWith('✓') ? 'var(--st-live)' : 'var(--st-danger)' }}>{msg}</span>}
        </div>
        <p style={{ fontSize: 11, color: 'var(--st-text-3)', marginTop: 12, lineHeight: 1.5 }}>
          <Icon name="bolt" size={12} style={{ verticalAlign: -2 }} /> Sends via Resend. To send from your own address (orders@lumiacandle.com) instead of the test sender, verify lumiacandle.com in Resend and set RESEND_FROM.
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 12 }}><label style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--st-text-3)', display: 'block', marginBottom: 5 }}>{label}</label>{children}</div>
}
