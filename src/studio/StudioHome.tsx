import { useEffect, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconName } from './icons'
import { supabase } from '../lib/supabase'

const card: CSSProperties = { background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 'var(--st-r-md)' }
const fade = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } } }

interface OrderRow { amount_total: number | null; subtotal: number | null; status: string | null; created_at: string; name: string | null; email: string | null; items: { product_name?: string; product_id?: string; quantity?: number }[] | null }
interface Stats {
  revenue: number; orders: number; fulfill: number; newMsgs: number
  monthly: number[]; labels: string[]
  activity: { icon: IconName; title: string; meta: string; when: string }[]
  top: { name: string; sales: number; pct: number }[]
}

function ago(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m`
  if (s < 86400) return `${Math.round(s / 3600)}h`
  return `${Math.round(s / 86400)}d`
}

export default function StudioHome() {
  const [s, setS] = useState<Stats | null>(null)

  useEffect(() => {
    (async () => {
      const [oR, mR] = await Promise.all([
        supabase.from('lumia_orders').select('amount_total,subtotal,status,created_at,name,email,items').order('created_at', { ascending: false }),
        supabase.from('lumia_messages').select('status,name,created_at').order('created_at', { ascending: false }),
      ])
      const orders = (oR.data || []) as OrderRow[]
      const msgs = (mR.data || []) as { status: string; name: string | null; created_at: string }[]
      const val = (o: OrderRow) => Number(o.amount_total ?? o.subtotal ?? 0)

      const now = new Date()
      const labels: string[] = [], monthly: number[] = []
      const buckets: Record<string, number> = {}
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        buckets[key] = 0
        labels.push(d.toLocaleString('en', { month: 'short' })[0])
      }
      for (const o of orders) {
        if (o.status === 'cancelled') continue
        const d = new Date(o.created_at)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (key in buckets) buckets[key] += val(o)
      }
      Object.values(buckets).forEach(v => monthly.push(Math.round(v)))

      const counts: Record<string, number> = {}
      for (const o of orders) for (const it of (o.items || [])) {
        const n = it.product_name || it.product_id || 'Item'
        counts[n] = (counts[n] || 0) + (Number(it.quantity) || 0)
      }
      const topArr = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4)
      const topMax = topArr[0]?.[1] || 1

      const act = [
        ...orders.slice(0, 5).map(o => ({ icon: (o.status === 'paid' ? 'check' : 'orders') as IconName, title: `Order — ${o.name || o.email || 'customer'}`, meta: `$${val(o)} · ${o.status}`, when: ago(o.created_at), t: o.created_at })),
        ...msgs.slice(0, 5).map(m => ({ icon: 'mail' as IconName, title: `Message — ${m.name || 'website'}`, meta: m.status, when: ago(m.created_at), t: m.created_at })),
      ].sort((a, b) => new Date(b.t).getTime() - new Date(a.t).getTime()).slice(0, 6)

      setS({
        revenue: orders.filter(o => o.status !== 'cancelled').reduce((a, o) => a + val(o), 0),
        orders: orders.length,
        fulfill: orders.filter(o => ['paid', 'pending', 'processing'].includes(o.status || '')).length,
        newMsgs: msgs.filter(m => m.status === 'new').length,
        monthly, labels,
        activity: act.map(({ icon, title, meta, when }) => ({ icon, title, meta, when })),
        top: topArr.map(([name, sales]) => ({ name, sales, pct: Math.round((sales / topMax) * 100) })),
      })
    })()
  }, [])

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} style={{ padding: '26px 30px', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div variants={fade} style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, margin: 0, letterSpacing: '-.02em' }}>Good evening, Lumia</h1>
        <p style={{ color: 'var(--st-text-3)', fontSize: 13, margin: '4px 0 0' }}>Live data from your store.</p>
      </motion.div>

      <motion.div variants={fade} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 13, marginBottom: 13 }}>
        <Kpi label="Revenue" value={s ? `$${s.revenue.toFixed(2)}` : null} />
        <Kpi label="Orders" value={s ? s.orders : null} />
        <Kpi label="To fulfill" value={s ? s.fulfill : null} />
        <Kpi label="New messages" value={s ? s.newMsgs : null} highlight={!!s && s.newMsgs > 0} />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.62fr 1fr', gap: 13, marginBottom: 13 }}>
        <motion.div variants={fade} style={{ ...card, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Revenue</div>
            <span style={{ fontSize: 11, color: 'var(--st-text-3)', border: '1px solid var(--st-border)', borderRadius: 999, padding: '3px 10px' }}>Last 12 months</span>
          </div>
          {s ? <Chart data={s.monthly} labels={s.labels} /> : <div className="st-skel" style={{ height: 168 }} />}
        </motion.div>

        <motion.div variants={fade} style={{ ...card, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Activity</div>
          {!s ? [0, 1, 2, 3].map(i => <div key={i} className="st-skel" style={{ height: 38, marginBottom: 8 }} />)
            : s.activity.length === 0 ? <Empty>No activity yet</Empty>
              : s.activity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '8px 0' }}>
                  <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, background: 'var(--st-bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--st-text-2)' }}><Icon name={a.icon} size={15} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--st-text-3)' }}>{a.meta}</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--st-text-3)' }}>{a.when}</span>
                </div>
              ))}
        </motion.div>
      </div>

      <motion.div variants={fade} style={{ ...card, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Top products</div>
        {!s ? [0, 1, 2].map(i => <div key={i} className="st-skel" style={{ height: 18, marginBottom: 12 }} />)
          : s.top.length === 0 ? <Empty>No sales yet — your best sellers will show here.</Empty>
            : s.top.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 13 }}>
                <div style={{ width: 170, flexShrink: 0, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ flex: 1, height: 7, background: 'var(--st-bg-3)', borderRadius: 999, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ height: '100%', background: 'var(--st-accent)' }} />
                </div>
                <span className="st-mono" style={{ fontSize: 12.5, color: 'var(--st-text-2)', width: 28, textAlign: 'right' }}>{p.sales}</span>
              </div>
            ))}
      </motion.div>
    </motion.div>
  )
}

function Kpi({ label, value, highlight }: { label: string; value: string | number | null; highlight?: boolean }) {
  return (
    <div style={{ ...card, padding: '16px 18px', background: highlight ? 'var(--st-accent)' : 'var(--st-bg-2)' }}>
      <div style={{ fontSize: 12, color: highlight ? 'rgba(26,20,16,.7)' : 'var(--st-text-3)', marginBottom: 10 }}>{label}</div>
      {value === null ? <div className="st-skel" style={{ height: 26, width: 80 }} />
        : <span className="st-mono" style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-.02em', color: highlight ? '#1a1410' : 'var(--st-text)' }}>{value}</span>}
    </div>
  )
}

function Chart({ data, labels }: { data: number[]; labels: string[] }) {
  const W = 640, H = 168, pad = 6
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => [pad + (i * (W - 2 * pad)) / Math.max(1, data.length - 1), H - 16 - (v / max) * (H - 30)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${W - pad} ${H - 14} L${pad} ${H - 14} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="168" preserveAspectRatio="none" style={{ display: 'block' }}>
      {[0.25, 0.5, 0.75].map(f => <line key={f} x1={pad} x2={W - pad} y1={(H - 14) * f + 4} y2={(H - 14) * f + 4} stroke="rgba(255,255,255,.05)" />)}
      <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} d={area} fill="var(--st-accent-soft)" />
      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: 'easeOut' }} d={line} fill="none" stroke="var(--st-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3.5 : 0} fill="var(--st-accent)" />)}
      {labels.map((l, i) => <text key={i} x={pts[i][0]} y={H - 2} fill="var(--st-text-3)" fontSize="9" textAnchor="middle" fontFamily="Inter">{l}</text>)}
    </svg>
  )
}

const Empty = ({ children }: { children: React.ReactNode }) => <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--st-text-3)', fontSize: 12.5 }}>{children}</div>
