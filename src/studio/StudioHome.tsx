import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './icons'
import { KPIS, REVENUE, REVENUE_LABELS, ACTIVITY, TOP_PRODUCTS } from './mock'

const card: CSSProperties = { background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 'var(--st-r-md)' }
const fade = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } } }

export default function StudioHome() {
  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      style={{ padding: '26px 30px', maxWidth: 1200, margin: '0 auto' }}>

      <motion.div variants={fade} style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, margin: 0, letterSpacing: '-.02em' }}>Good evening, Lumia</h1>
        <p style={{ color: 'var(--st-text-3)', fontSize: 13, margin: '4px 0 0' }}>Here's how your store is doing today.</p>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fade} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 13, marginBottom: 13 }}>
        {KPIS.map(k => (
          <div key={k.label} style={{ ...card, padding: '16px 18px' }}>
            <div style={{ fontSize: 12, color: 'var(--st-text-3)', marginBottom: 10 }}>{k.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span className="st-mono" style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-.02em' }}>{k.value}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, color: k.up ? 'var(--st-live)' : 'var(--st-danger)' }}>
                <Icon name={k.up ? 'arrowUp' : 'arrowDown'} size={13} /> {k.delta}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.62fr 1fr', gap: 13, marginBottom: 13 }}>
        {/* Revenue chart */}
        <motion.div variants={fade} style={{ ...card, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Revenue</div>
            <span style={{ fontSize: 11, color: 'var(--st-text-3)', border: '1px solid var(--st-border)', borderRadius: 999, padding: '3px 10px' }}>Last 12 months</span>
          </div>
          <RevenueChart />
        </motion.div>

        {/* Activity */}
        <motion.div variants={fade} style={{ ...card, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '8px 0' }}>
                <span style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, background: 'var(--st-bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--st-text-2)' }}>
                  <Icon name={a.icon} size={15} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: 'var(--st-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--st-text-3)' }}>{a.meta}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--st-text-3)' }}>{a.when}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top products */}
      <motion.div variants={fade} style={{ ...card, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Top products</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {TOP_PRODUCTS.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 150, flexShrink: 0 }}>
                <div style={{ fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--st-text-3)' }}>{p.sub}</div>
              </div>
              <div style={{ flex: 1, height: 7, background: 'var(--st-bg-3)', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: '100%', background: 'var(--st-accent)', borderRadius: 999 }} />
              </div>
              <span className="st-mono" style={{ fontSize: 12.5, color: 'var(--st-text-2)', width: 28, textAlign: 'right' }}>{p.sales}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function RevenueChart() {
  const W = 640, H = 168, pad = 6
  const max = Math.max(...REVENUE)
  const pts = REVENUE.map((v, i) => [pad + (i * (W - 2 * pad)) / (REVENUE.length - 1), H - 16 - (v / max) * (H - 30)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${W - pad} ${H - 14} L${pad} ${H - 14} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="168" preserveAspectRatio="none" style={{ display: 'block' }}>
      {[0.25, 0.5, 0.75].map(f => <line key={f} x1={pad} x2={W - pad} y1={(H - 14) * f + 4} y2={(H - 14) * f + 4} stroke="rgba(255,255,255,.05)" />)}
      <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} d={area} fill="var(--st-accent-soft)" />
      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: 'easeOut' }}
        d={line} fill="none" stroke="var(--st-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3.5 : 0} fill="var(--st-accent)" />)}
      {REVENUE_LABELS.map((l, i) => (
        <text key={i} x={pts[i][0]} y={H - 2} fill="var(--st-text-3)" fontSize="9" textAnchor="middle" fontFamily="Inter">{l}</text>
      ))}
    </svg>
  )
}
