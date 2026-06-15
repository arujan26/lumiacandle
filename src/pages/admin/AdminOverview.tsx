import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ADMIN_ORDERS, ADMIN_MESSAGES, ADMIN_PRODUCTS, ADMIN_SETTINGS } from '../../lib/adminBase'

interface RecentOrder { name: string | null; email: string | null; amount_total: number | null; subtotal: number | null; status: string | null; created_at: string }
interface Stats {
  orders: number; revenue: number; pending: number
  newMessages: number; candles: number; stickers: number
  recent: RecentOrder[]
}

export default function AdminOverview() {
  const [s, setS] = useState<Stats | null>(null)

  useEffect(() => {
    (async () => {
      const [ordersR, msgsR, prodsR] = await Promise.all([
        supabase.from('lumia_orders').select('amount_total,subtotal,status,created_at,name,email').order('created_at', { ascending: false }),
        supabase.from('lumia_messages').select('status'),
        supabase.from('lumia_products').select('active,type'),
      ])
      const orders = (ordersR.data || []) as RecentOrder[]
      const msgs = (msgsR.data || []) as { status: string }[]
      const prods = (prodsR.data || []) as { active: boolean; type: string }[]
      const revenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.amount_total ?? o.subtotal ?? 0), 0)
      setS({
        orders: orders.length,
        revenue,
        pending: orders.filter(o => ['paid', 'pending', 'processing'].includes(o.status || '')).length,
        newMessages: msgs.filter(m => m.status === 'new').length,
        candles: prods.filter(p => p.active && p.type === 'candle').length,
        stickers: prods.filter(p => p.active && p.type === 'sticker').length,
        recent: orders.slice(0, 6),
      })
    })()
  }, [])

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(28px,3.5vw,40px)', marginBottom: 4 }}>Overview</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Your store at a glance.</p>
      </div>

      {!s ? <p style={{ color: 'var(--muted)' }}>Loading…</p> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 36 }}>
            <Stat label="Revenue" value={`$${s.revenue.toFixed(2)}`} to={ADMIN_ORDERS} big />
            <Stat label="Orders" value={s.orders} to={ADMIN_ORDERS} />
            <Stat label="To fulfill" value={s.pending} to={ADMIN_ORDERS} />
            <Stat label="New messages" value={s.newMessages} to={ADMIN_MESSAGES} highlight={s.newMessages > 0} />
            <Stat label="Live products" value={`${s.candles + s.stickers}`} sub={`${s.candles} candles · ${s.stickers} stickers`} to={ADMIN_PRODUCTS} />
          </div>

          {/* Recent orders */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h2 style={{ fontSize: 22 }}>Recent orders</h2>
            <Link to={ADMIN_ORDERS} style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {s.recent.length === 0 ? (
            <div style={{ border: '1px solid var(--line)', padding: '40px 24px', textAlign: 'center', background: 'var(--white)', color: 'var(--muted)' }}>
              No orders yet — they appear here automatically after a paid checkout.
            </div>
          ) : (
            <div style={{ border: '1px solid var(--line)', background: 'var(--white)' }}>
              {s.recent.map((o, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: i < s.recent.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--ink)' }}>{o.name || o.email || 'Customer'}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-light)' }}>{new Date(o.created_at).toLocaleDateString()} · {o.status}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>${Number(o.amount_total ?? o.subtotal ?? 0)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 28 }}>
            <Link to={ADMIN_PRODUCTS} className="btn btn-dark" style={{ fontSize: 9 }}>Manage products</Link>
            <Link to={ADMIN_SETTINGS} className="btn btn-outline" style={{ fontSize: 9 }}>Edit site</Link>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, sub, to, big, highlight }: { label: string; value: string | number; sub?: string; to: string; big?: boolean; highlight?: boolean }) {
  return (
    <Link to={to} style={{
      textDecoration: 'none', display: 'block', padding: '20px 22px',
      background: highlight ? 'var(--gold)' : 'var(--white)', border: '1px solid var(--line)',
    }}>
      <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: highlight ? 'rgba(255,255,255,.85)' : 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: big ? 34 : 30, color: highlight ? 'white' : 'var(--ink)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{sub}</div>}
    </Link>
  )
}
