import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './icons'
import { supabase } from '../lib/supabase'

const card: CSSProperties = { background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 'var(--st-r-md)' }

interface Customer { email: string; name: string; orders: number; spent: number; last: string }

export default function StudioCustomers() {
  const [rows, setRows] = useState<Customer[] | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('lumia_orders').select('name,email,amount_total,subtotal,status,created_at').order('created_at', { ascending: false })
      const map = new Map<string, Customer>()
      for (const o of (data || []) as { name: string | null; email: string | null; amount_total: number | null; subtotal: number | null; status: string | null; created_at: string }[]) {
        const email = (o.email || '').toLowerCase()
        if (!email) continue
        const val = o.status === 'cancelled' ? 0 : Number(o.amount_total ?? o.subtotal ?? 0)
        const c = map.get(email) || { email, name: o.name || '', orders: 0, spent: 0, last: o.created_at }
        c.orders += 1; c.spent += val
        if (!c.name && o.name) c.name = o.name
        if (new Date(o.created_at) > new Date(c.last)) c.last = o.created_at
        map.set(email, c)
      }
      setRows([...map.values()].sort((a, b) => b.spent - a.spent))
    })()
  }, [])

  const filtered = useMemo(() => !rows ? [] : rows.filter(c => (c.name + c.email).toLowerCase().includes(q.toLowerCase())), [rows, q])
  const totalSpent = rows ? rows.reduce((a, c) => a + c.spent, 0) : 0

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: '26px 30px', maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 600, margin: 0 }}>Customers</h1>
          <p style={{ color: 'var(--st-text-3)', fontSize: 13, margin: '4px 0 0' }}>{rows ? `${rows.length} customers · $${totalSpent.toFixed(2)} lifetime` : 'Loading…'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 8, padding: '0 10px', height: 34 }}>
          <Icon name="search" size={15} style={{ color: 'var(--st-text-3)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers" style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--st-text)', fontSize: 13, width: 180 }} />
        </div>
      </div>

      {!rows ? <div className="st-skel" style={{ height: 220 }} />
        : rows.length === 0 ? <div style={{ ...card, padding: 44, textAlign: 'center', color: 'var(--st-text-3)', fontSize: 13 }}>No customers yet — they appear after the first paid order.</div>
          : (
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 120px 130px', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--st-border)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--st-text-3)' }}>
                <span>Customer</span><span style={{ textAlign: 'right' }}>Orders</span><span style={{ textAlign: 'right' }}>Spent</span><span style={{ textAlign: 'right' }}>Last order</span>
              </div>
              {filtered.map((c, i) => (
                <div key={c.email} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 120px 130px', gap: 12, padding: '12px 18px', borderBottom: i < filtered.length - 1 ? '1px solid var(--st-border)' : 'none', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--st-bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--st-text-2)', flexShrink: 0, textTransform: 'uppercase' }}>{(c.name || c.email).slice(0, 2)}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name || '—'}</div>
                      <a href={`mailto:${c.email}`} style={{ fontSize: 11.5, color: 'var(--st-text-3)', textDecoration: 'none' }}>{c.email}</a>
                    </div>
                  </div>
                  <span className="st-mono" style={{ textAlign: 'right', fontSize: 13, color: 'var(--st-text-2)' }}>{c.orders}</span>
                  <span className="st-mono" style={{ textAlign: 'right', fontSize: 13 }}>${c.spent.toFixed(2)}</span>
                  <span style={{ textAlign: 'right', fontSize: 12, color: 'var(--st-text-3)' }}>{new Date(c.last).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
    </motion.div>
  )
}
