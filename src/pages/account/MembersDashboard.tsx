import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useProducts } from '../../lib/productsApi'
import { cart } from '../../lib/cart'
import { loadMember, tierForPoints, addPoints, setMood, toggleSavedAffirmation, type Member } from '../../lib/members'
import { dailyAffirmation, MOODS, type Mood } from '../../lib/clubContent'

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } }

function timeTheme() {
  const h = new Date().getHours()
  const period = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'night'
  return {
    greeting: period === 'morning' ? 'Good morning' : period === 'afternoon' ? 'Good afternoon' : 'Good evening',
    emoji: period === 'morning' ? '☀️' : period === 'afternoon' ? '✨' : '🌙',
    bg: period === 'morning'
      ? 'radial-gradient(130% 130% at 85% -10%, #FCEFDF 0%, #F6E2D0 55%, #F0D8C4 100%)'
      : period === 'afternoon'
        ? 'radial-gradient(130% 130% at 85% -10%, #FCF8F1 0%, #F2ECE2 100%)'
        : 'radial-gradient(130% 130% at 85% -10%, #F5E5D3 0%, #ECD4BD 55%, #E6C9AE 100%)',
  }
}

export default function MembersDashboard({ userId, email, name }: { userId: string; email: string; name: string }) {
  const [m, setM] = useState<Member | null>(null)
  const [activeMood, setActiveMood] = useState<Mood | null>(null)
  const [savePulse, setSavePulse] = useState(false)
  const { products } = useProducts('candle')
  const theme = timeTheme()
  const aff = dailyAffirmation()

  useEffect(() => { loadMember(userId, email, name).then(setM) }, [userId, email, name])

  if (!m) return <div className="st-skel" style={{ height: 360, borderRadius: 22, background: 'var(--cream)' }} />

  const { tier, next, progress } = tierForPoints(m.points)
  const firstName = (m.name || name || 'there').split(' ')[0]
  const isSaved = m.saved_affirmations.includes(aff)

  const pickMood = (mood: Mood) => {
    setActiveMood(mood)
    setMood(userId, mood.id)
    setM(p => p ? { ...p, mood_today: mood.id } : p)
  }
  const saveAff = async () => {
    const next = await toggleSavedAffirmation(userId, aff, m.saved_affirmations)
    let pts = m.points
    if (!m.saved_affirmations.includes(aff)) { pts = await addPoints(userId, m.points, 5); setSavePulse(true); setTimeout(() => setSavePulse(false), 700) }
    setM(p => p ? { ...p, saved_affirmations: next, points: pts } : p)
  }

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
      {/* Greeting */}
      <motion.div variants={fade} style={{ background: theme.bg, borderRadius: 22, padding: 'clamp(28px,4vw,46px)', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <span style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>The Lumia Club</span>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1, margin: '14px 0 8px', letterSpacing: '-.02em' }}>
          {theme.greeting}, {firstName} {theme.emoji}
        </h1>
        <p style={{ color: 'var(--brown)', fontSize: 15 }}>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
          <Chip icon="✦" label={`${m.points.toLocaleString()} points`} />
          <Chip icon="🔥" label={`${m.streak}-day streak`} />
          <Chip icon="♡" label={`${m.saved_affirmations.length} saved`} />
        </div>
      </motion.div>

      {/* Tier + affirmation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16, marginBottom: 16 }} className="club-2col">
        {/* Tier card */}
        <motion.div variants={fade} style={{ borderRadius: 22, padding: 28, background: `linear-gradient(150deg, ${tier.color} 0%, #fff 130%)`, border: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: 10.5, letterSpacing: '.25em', textTransform: 'uppercase', color: tier.accent, fontWeight: 600 }}>Membership</span>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, margin: '6px 0 2px', color: 'var(--ink)' }}>{tier.name} Member</h2>
              <p style={{ fontSize: 12.5, color: 'var(--brown)' }}>{tier.perk}</p>
            </div>
            <span style={{ width: 46, height: 46, borderRadius: '50%', background: tier.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--serif)', fontSize: 20, flexShrink: 0 }}>{tier.name[0]}</span>
          </div>
          {next ? (
            <div style={{ marginTop: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--brown)', marginBottom: 7 }}>
                <span>{m.points.toLocaleString()} pts</span>
                <span>{next.name} at {next.min.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,.6)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round(progress * 100)}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} style={{ height: '100%', background: tier.accent, borderRadius: 99 }} />
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 9 }}>{(next.min - m.points).toLocaleString()} points to <strong style={{ color: tier.accent }}>{next.name}</strong></p>
            </div>
          ) : <p style={{ marginTop: 22, fontSize: 13, color: tier.accent, fontWeight: 500 }}>✦ You've reached the highest tier. You are the Muse.</p>}
        </motion.div>

        {/* Daily affirmation */}
        <motion.div variants={fade} style={{ borderRadius: 22, padding: 28, background: 'var(--white)', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', position: 'relative' }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 14 }}>Today's Affirmation</span>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(20px,2.4vw,26px)', lineHeight: 1.35, color: 'var(--ink)' }}>“{aff}”</p>
          <button onClick={saveAff} style={{ marginTop: 18, alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 7, background: isSaved ? 'var(--ink)' : 'transparent', color: isSaved ? 'var(--white)' : 'var(--ink)', border: '1px solid var(--ink)', borderRadius: 99, padding: '8px 18px', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'pointer', transform: savePulse ? 'scale(1.08)' : 'scale(1)', transition: 'transform .25s' }}>
            {isSaved ? '♥ Saved' : '♡ Save'}
          </button>
        </motion.div>
      </div>

      {/* Mood ritual */}
      <motion.div variants={fade} style={{ borderRadius: 22, padding: 'clamp(24px,3vw,32px)', background: 'var(--cream)', marginBottom: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>Daily Ritual</span>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px,3vw,34px)', margin: '8px 0 0' }}>How are you feeling today?</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center', maxWidth: 720, margin: '0 auto' }}>
          {MOODS.map(mood => {
            const on = activeMood?.id === mood.id
            return (
              <button key={mood.id} onClick={() => pickMood(mood)}
                style={{ padding: '10px 18px', borderRadius: 99, border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`, background: on ? 'var(--ink)' : mood.color, color: on ? '#fff' : 'var(--ink)', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'all .2s' }}>
                {mood.label}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeMood && (
            <motion.div key={activeMood.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}
              style={{ marginTop: 26, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 18, padding: 24, display: 'grid', gridTemplateColumns: '160px 1fr', gap: 22, alignItems: 'center' }} className="mood-reveal">
              <MoodCandle mood={activeMood} products={products} />
              <div>
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--ink)', marginBottom: 6 }}>“{activeMood.affirmation}”</p>
                <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 16 }}>{activeMood.note}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a href={activeMood.playlist} target="_blank" rel="noreferrer" style={pill}>♫ Mood playlist</a>
                  <span style={{ ...pill, cursor: 'default' }}>✦ Matching scent below</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recent orders */}
      <motion.div variants={fade} style={{ borderRadius: 22, padding: 28, background: 'var(--white)', border: '1px solid var(--line)', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16, fontFamily: 'var(--serif)' }}>Recent orders</h2>
        <RecentOrders />
      </motion.div>

      {/* Roadmap teaser */}
      <motion.div variants={fade} style={{ borderRadius: 22, padding: '24px 28px', background: 'var(--cream)', textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10.5, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>Coming to your club</span>
        <p style={{ fontSize: 14, color: 'var(--brown)', marginTop: 10, lineHeight: 1.8 }}>
          Wellness Journal · Candle Journey · Burn Tracker · Members Vault · Collectible Stickers · Scent Personality · AI Concierge
        </p>
      </motion.div>
    </motion.div>
  )
}

function MoodCandle({ mood, products }: { mood: Mood; products: ReturnType<typeof useProducts>['products'] }) {
  const p = products.find(x => x.id === mood.scent) || products[0]
  if (!p) return <div className="st-skel" style={{ aspectRatio: '4/5', borderRadius: 12 }} />
  return (
    <Link to={`/shop/candles/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ aspectRatio: '4/5', borderRadius: 12, overflow: 'hidden', position: 'relative', background: 'var(--cream)', marginBottom: 8 }}>
        {p.image_url && <img src={p.image_url} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)' }}>{p.name}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--gold)' }}>${p.price}</span>
        <button onClick={e => { e.preventDefault(); cart.add(p) }} style={{ ...pill, padding: '6px 12px', fontSize: 9 }}>Add</button>
      </div>
    </Link>
  )
}

function RecentOrders() {
  const [orders, setOrders] = useState<{ id: string; created_at: string; status: string | null; amount_total: number | null; subtotal: number | null }[] | null>(null)
  useEffect(() => {
    supabase.from('lumia_orders').select('id,created_at,status,amount_total,subtotal').order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => setOrders(data || []))
  }, [])
  if (orders === null) return <div className="st-skel" style={{ height: 60 }} />
  if (orders.length === 0) return <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>No orders yet — your <Link to="/shop/candles" style={{ color: 'var(--gold)' }}>first ritual</Link> awaits.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {orders.map(o => (
        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontSize: 13 }}>#{o.id.slice(0, 8)}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleDateString()} · {o.status}</div>
          </div>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>${Number(o.amount_total ?? o.subtotal ?? 0)}</span>
        </div>
      ))}
    </div>
  )
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.65)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.6)', borderRadius: 99, padding: '8px 14px', fontSize: 12.5, color: 'var(--ink)', fontWeight: 500 }}>{icon} {label}</span>
}

const pill: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--ink)', borderRadius: 99, padding: '8px 14px', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 500 }
