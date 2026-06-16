import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from './icons'
import { TIERS } from '../lib/members'
import { adminListCustomers, adminUpdateMember, adminCustomerOrders, type AdminCustomer } from '../lib/customersAdmin'

const card: CSSProperties = { background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 'var(--st-r-md)' }
const money = (n: number) => `$${n.toFixed(2)}`

export default function StudioCustomers() {
  const [rows, setRows] = useState<AdminCustomer[] | null>(null)
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('all')
  const [sel, setSel] = useState<AdminCustomer | null>(null)

  const load = () => adminListCustomers().then(setRows).catch(() => setRows([]))
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!rows) return []
    return rows.filter(c => {
      if (tier === 'members' && !c.isMember) return false
      if (tier === 'vip' && !c.vip) return false
      if (tier !== 'all' && tier !== 'members' && tier !== 'vip' && c.tierName.toLowerCase().replace(/\s/g, '') !== tier) return false
      const s = (c.name + c.email).toLowerCase()
      return s.includes(q.toLowerCase())
    })
  }, [rows, q, tier])

  const lifetime = rows ? rows.reduce((a, c) => a + c.spent, 0) : 0
  const onChanged = () => load().then(() => sel && adminListCustomers().then(list => setSel(list.find(c => c.email === sel.email) || null)))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(28px,3.5vw,40px)', marginBottom: 4 }}>Customers</h1>
          <p style={{ fontSize: 13, color: 'var(--st-text-3)' }}>{rows ? `${rows.length} customers · ${money(lifetime)} lifetime value` : 'Loading…'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 8, padding: '0 10px', height: 34 }}>
          <Icon name="search" size={15} style={{ color: 'var(--st-text-3)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email" style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--st-text)', fontSize: 13, width: 190 }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['all', 'All'], ['members', 'Members'], ['vip', 'VIP'], ...TIERS.map(t => [t.name.toLowerCase().replace(/\s/g, ''), t.name] as [string, string])].map(([v, l]) => (
          <button key={v} onClick={() => setTier(v)} style={{ fontSize: 11.5, padding: '6px 12px', borderRadius: 99, border: `1px solid ${tier === v ? 'var(--st-accent)' : 'var(--st-border)'}`, background: tier === v ? 'var(--st-accent-soft)' : 'transparent', color: tier === v ? 'var(--st-text)' : 'var(--st-text-3)', cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {!rows ? <div className="st-skel" style={{ height: 240 }} />
        : filtered.length === 0 ? <div style={{ ...card, padding: 44, textAlign: 'center', color: 'var(--st-text-3)', fontSize: 13 }}>No customers match.</div>
          : (
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 70px 90px 110px', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--st-border)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--st-text-3)' }}>
                <span>Customer</span><span>Tier</span><span style={{ textAlign: 'right' }}>Orders</span><span style={{ textAlign: 'right' }}>Spent</span><span style={{ textAlign: 'right' }}>Last active</span>
              </div>
              {filtered.map((c, i) => (
                <button key={c.email} onClick={() => { setSel(c) }} className="st-hover"
                  style={{ width: '100%', display: 'grid', gridTemplateColumns: '1.5fr 1fr 70px 90px 110px', gap: 12, padding: '12px 18px', borderBottom: i < filtered.length - 1 ? '1px solid var(--st-border)' : 'none', alignItems: 'center', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--st-bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--st-text-2)', flexShrink: 0, textTransform: 'uppercase' }}>{(c.name !== '—' ? c.name : c.email).slice(0, 2)}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>{c.name}{c.vip && <span style={{ fontSize: 9, color: 'var(--st-accent)' }}>★ VIP</span>}{c.disabled && <span style={{ fontSize: 9, color: 'var(--st-danger)' }}>● disabled</span>}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--st-text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: c.isMember ? c.tierAccent : 'var(--st-text-3)' }}>{c.tierName}{c.isMember ? ` · ${c.points}pt` : ''}</span>
                  <span className="st-mono" style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--st-text-2)' }}>{c.orders}</span>
                  <span className="st-mono" style={{ textAlign: 'right', fontSize: 12.5 }}>{money(c.spent)}</span>
                  <span style={{ textAlign: 'right', fontSize: 11.5, color: 'var(--st-text-3)' }}>{c.lastActive ? new Date(c.lastActive).toLocaleDateString() : '—'}</span>
                </button>
              ))}
            </div>
          )}

      <AnimatePresence>
        {sel && <Drawer key={sel.email} c={sel} onClose={() => setSel(null)} onChanged={onChanged} />}
      </AnimatePresence>
    </div>
  )
}

function Drawer({ c, onClose, onChanged }: { c: AdminCustomer; onClose: () => void; onChanged: () => void }) {
  const [orders, setOrders] = useState<{ id: string; created_at: string; status: string | null; amount_total: number | null; subtotal: number | null }[] | null>(null)
  const [notes, setNotes] = useState(c.adminNotes || '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { adminCustomerOrders(c.email).then(d => setOrders(d as never)) }, [c.email])

  const update = async (patch: Parameters<typeof adminUpdateMember>[1], note?: string) => {
    if (!c.userId) return
    setBusy(true); setMsg('')
    const { error } = await adminUpdateMember(c.userId, patch)
    setBusy(false)
    setMsg(error ? error : `✓ ${note || 'Saved'}`)
    onChanged()
    setTimeout(() => setMsg(''), 2200)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,.5)' }} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1501, width: 'min(440px,100vw)', background: 'var(--st-bg-1)', borderLeft: '1px solid var(--st-border)', overflowY: 'auto' }}>
        <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--st-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>{c.name}{c.vip && <span style={{ fontSize: 10, color: 'var(--st-accent)' }}>★ VIP</span>}</h2>
            <a href={`mailto:${c.email}`} style={{ fontSize: 12.5, color: 'var(--st-accent)', textDecoration: 'none' }}>{c.email}</a>
            <div style={{ fontSize: 11, color: 'var(--st-text-3)', marginTop: 4 }}>{c.isMember ? `Member · joined ${c.joined ? new Date(c.joined).toLocaleDateString() : '—'}` : 'Guest (no account)'} · last active {c.lastActive ? new Date(c.lastActive).toLocaleDateString() : '—'}</div>
          </div>
          <button onClick={onClose} style={{ ...iconBtn }} aria-label="Close">✕</button>
        </div>

        <div style={{ padding: 22 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
            <Stat label="Lifetime" value={money(c.spent)} />
            <Stat label="Orders" value={String(c.orders)} />
            <Stat label="Points" value={c.isMember ? String(c.points) : '—'} />
          </div>

          {c.isMember ? (
            <>
              <Section title="Membership & rewards">
                <Row label={`Tier · ${c.tierName}`}>
                  <span className="st-mono" style={{ fontSize: 12, color: 'var(--st-text-2)' }}>{c.points} pts · {c.streak}🔥</span>
                </Row>
                <div style={{ fontSize: 10.5, color: 'var(--st-text-3)', margin: '10px 0 6px', textTransform: 'uppercase', letterSpacing: '.08em' }}>Adjust points</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {[10, 50, 100, -50].map(d => <button key={d} onClick={() => update({ points: Math.max(0, c.points + d) }, `${d > 0 ? '+' : ''}${d} points`)} disabled={busy} style={chip}>{d > 0 ? '+' : ''}{d}</button>)}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--st-text-3)', margin: '4px 0 6px', textTransform: 'uppercase', letterSpacing: '.08em' }}>Set tier</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {TIERS.map(t => <button key={t.id} onClick={() => update({ points: t.min }, `Set to ${t.name}`)} disabled={busy} style={{ ...chip, borderColor: c.tierName === t.name ? t.accent : 'var(--st-border)', color: c.tierName === t.name ? t.accent : 'var(--st-text-2)' }}>{t.name}</button>)}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => update({ streak: c.streak + 1 }, 'Streak +1')} disabled={busy} style={chip}>Streak +1</button>
                  <button onClick={() => update({ streak: 0 }, 'Streak reset')} disabled={busy} style={chip}>Reset streak</button>
                  <button onClick={() => update({ vip: !c.vip }, c.vip ? 'VIP removed' : 'VIP granted')} disabled={busy} style={{ ...chip, color: c.vip ? 'var(--st-accent)' : 'var(--st-text-2)' }}>{c.vip ? '★ Remove VIP' : '☆ Make VIP'}</button>
                  <button onClick={() => update({ disabled: !c.disabled }, c.disabled ? 'Reactivated' : 'Disabled')} disabled={busy} style={{ ...chip, color: c.disabled ? 'var(--st-live)' : 'var(--st-danger)' }}>{c.disabled ? 'Reactivate' : 'Disable'}</button>
                </div>
              </Section>

              <Section title="Engagement">
                <Row label="Saved affirmations"><span style={{ fontSize: 12.5 }}>{c.savedCount}</span></Row>
                <Row label="Mood today"><span style={{ fontSize: 12.5, color: 'var(--st-text-2)' }}>{c.moodToday || '—'}</span></Row>
                <Row label="Birthday"><span style={{ fontSize: 12.5, color: 'var(--st-text-2)' }}>{c.birthday || '—'}</span></Row>
              </Section>

              <Section title="Private admin notes">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes (not visible to customer)" style={{ width: '100%', minHeight: 60, background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 8, color: 'var(--st-text)', fontSize: 12.5, padding: 10, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                <button onClick={() => update({ admin_notes: notes }, 'Notes saved')} disabled={busy} style={{ ...chip, marginTop: 8 }}>Save notes</button>
              </Section>
            </>
          ) : (
            <div style={{ ...card, padding: 16, fontSize: 12.5, color: 'var(--st-text-3)', marginBottom: 22 }}>This customer checked out as a guest — no membership account, so rewards control isn't available.</div>
          )}

          {/* Orders */}
          <Section title="Order history">
            {orders === null ? <div className="st-skel" style={{ height: 50 }} />
              : orders.length === 0 ? <p style={{ fontSize: 12.5, color: 'var(--st-text-3)' }}>No orders.</p>
                : orders.map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--st-border)', fontSize: 12.5 }}>
                    <span style={{ color: 'var(--st-text-2)' }}>#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()} · {o.status}</span>
                    <span className="st-mono">{money(Number(o.amount_total ?? o.subtotal ?? 0))}</span>
                  </div>
                ))}
          </Section>

          {msg && <div style={{ fontSize: 12, color: msg.startsWith('✓') ? 'var(--st-live)' : 'var(--st-danger)', textAlign: 'center', marginTop: 8 }}>{msg}</div>}
        </div>
      </motion.div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div style={{ background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 9, padding: '12px 14px' }}>
    <div style={{ fontSize: 10.5, color: 'var(--st-text-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
    <div className="st-mono" style={{ fontSize: 19, fontWeight: 500 }}>{value}</div>
  </div>
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 22 }}>
    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 12, paddingBottom: 7, borderBottom: '1px solid var(--st-border)' }}>{title}</div>
    {children}
  </div>
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
    <span style={{ fontSize: 12.5, color: 'var(--st-text-3)' }}>{label}</span>{children}
  </div>
}
const chip: CSSProperties = { fontSize: 11.5, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--st-border)', background: 'transparent', color: 'var(--st-text-2)', cursor: 'pointer' }
const iconBtn: CSSProperties = { width: 28, height: 28, borderRadius: 6, border: '1px solid var(--st-border)', background: 'transparent', color: 'var(--st-text-2)', cursor: 'pointer', fontSize: 14 }
