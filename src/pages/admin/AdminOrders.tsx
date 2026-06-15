import { useEffect, useState } from 'react'
import {
  adminListOrders, adminUpdateOrder, sendOrderUpdateEmail,
  ORDER_STATUSES, type AdminOrder,
} from '../../lib/ordersApi'

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminListOrders().then(o => { setOrders(o); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(28px,3.5vw,40px)', marginBottom: 4 }}>Orders</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Customer details, status & shipping updates by email.</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : orders.length === 0 ? (
        <div style={{ border: '1px solid var(--line)', padding: '48px 24px', textAlign: 'center', background: 'var(--white)' }}>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>No orders yet.</p>
          <p style={{ color: 'var(--muted-light)', fontSize: 12, marginTop: 6 }}>Paid orders will appear here automatically once the Stripe webhook is connected.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map(o => <OrderRow key={o.id} order={o} onChanged={load} />)}
        </div>
      )}
    </div>
  )
}

function OrderRow({ order, onChanged }: { order: AdminOrder; onChanged: () => void }) {
  const [status, setStatus] = useState(order.status ?? 'paid')
  const [tracking, setTracking] = useState(order.tracking_code ?? '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const total = order.amount_total ?? order.subtotal ?? 0
  const date = order.created_at ? new Date(order.created_at).toLocaleString() : ''

  const saveAndNotify = async (notify: boolean) => {
    setBusy(true); setMsg('')
    const { error } = await adminUpdateOrder(order.id, { status, tracking_code: tracking || null as unknown as string })
    if (error) { setMsg(error); setBusy(false); return }
    if (notify && order.email) {
      const { error: mailErr } = await sendOrderUpdateEmail({
        to: order.email, customerName: order.name || 'there',
        status, trackingCode: tracking || undefined, orderId: order.id,
      })
      setMsg(mailErr ? `Saved, but email failed: ${mailErr}` : '✓ Saved & email sent')
    } else {
      setMsg('✓ Saved')
    }
    setBusy(false)
    onChanged()
  }

  return (
    <div style={{ border: '1px solid var(--line)', background: 'var(--white)', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{order.name || 'Customer'}</div>
          <a href={`mailto:${order.email}`} style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none' }}>{order.email}</a>
          {order.phone && <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 10 }}>{order.phone}</span>}
          <div style={{ fontSize: 11, color: 'var(--muted-light)', marginTop: 3 }}>{date} · #{order.id.slice(0, 8)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>${Number(total)}</div>
          <span style={{ fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>{order.status}</span>
        </div>
      </div>

      {/* Items */}
      {Array.isArray(order.items) && order.items.length > 0 && (
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
          {order.items.map((it, i) => (
            <span key={i}>{it.product_name || it.product_id} × {it.quantity}{i < order.items!.length - 1 ? ' · ' : ''}</span>
          ))}
        </div>
      )}

      {/* Address */}
      {order.address && (
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
          📦 {order.address}, {order.city} {order.state} {order.zip}, {order.country}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={status} onChange={e => setStatus(e.target.value)} style={ctrl}>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Tracking code" style={{ ...ctrl, minWidth: 160 }} />
        <button onClick={() => saveAndNotify(false)} disabled={busy} style={{ ...btn, background: 'transparent', color: 'var(--ink)' }}>Save</button>
        <button onClick={() => saveAndNotify(true)} disabled={busy || !order.email} style={btn}>Save & email customer</button>
        {msg && <span style={{ fontSize: 12, color: msg.startsWith('✓') ? '#3a7a4a' : '#c04a3a' }}>{msg}</span>}
      </div>
    </div>
  )
}

const ctrl: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid var(--line)', background: 'var(--ivory)',
  fontSize: 13, color: 'var(--ink)', outline: 'none', borderRadius: 0, fontFamily: 'var(--sans)',
}
const btn: React.CSSProperties = {
  padding: '9px 16px', border: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--white)',
  fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500,
}
