import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCustomer, customerSignUp, customerSignIn, customerSignOut, customerName } from '../lib/customerAuth'

export default function AccountPage() {
  const { session, loading } = useCustomer()

  return (
    <>
      <section style={{ background: 'var(--cream)', padding: '120px 0 64px', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>Lumia</span>
          <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: .95 }}>{session ? 'Your Account' : 'Account'}</h1>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="wrap" style={{ maxWidth: session ? 760 : 420, margin: '0 auto' }}>
          {loading ? <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Loading…</p>
            : session ? <Dashboard email={session.user.email || ''} name={customerName(session)} />
              : <AuthForm />}
        </div>
      </section>
    </>
  )
}

function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(''); setInfo('')
    if (mode === 'signup') {
      const { error, needsConfirm } = await customerSignUp(name, email, password)
      setBusy(false)
      if (error) { setError(error); return }
      if (needsConfirm) setInfo('Almost there — check your email to confirm your account, then sign in.')
    } else {
      const { error } = await customerSignIn(email, password)
      setBusy(false)
      if (error) { setError('Invalid email or password.'); return }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', marginBottom: 28 }}>
        {(['login', 'signup'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError(''); setInfo('') }}
            style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 500, color: mode === m ? 'var(--ink)' : 'var(--muted-light)', borderBottom: mode === m ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: -1 }}>
            {m === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      {info ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 44, color: 'var(--champagne)', display: 'block', marginBottom: 14 }}>✦</span>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{info}</p>
        </div>
      ) : (
        <form onSubmit={submit}>
          {mode === 'signup' && <input style={inp} placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />}
          <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
          <input style={inp} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required />
          {error && <p style={{ color: '#c04a3a', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-dark" type="submit" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--muted-light)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
            {mode === 'login' ? 'New here? ' : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </form>
      )}
      <p style={{ fontSize: 11, color: 'var(--muted-light)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
        You don't need an account to shop — <Link to="/shop/candles" style={{ color: 'var(--gold)' }}>checkout as a guest</Link> anytime.
      </p>
    </div>
  )
}

interface Order { id: string; created_at: string; status: string | null; amount_total: number | null; subtotal: number | null; tracking_code: string | null; items: { product_name?: string; quantity?: number }[] | null }

function Dashboard({ email, name }: { email: string; name: string }) {
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    supabase.from('lumia_orders').select('id,created_at,status,amount_total,subtotal,tracking_code,items').order('created_at', { ascending: false })
      .then(({ data }) => setOrders((data || []) as Order[]))
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 'clamp(24px,3vw,32px)', marginBottom: 4 }}>Hi {name} 👋</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>{email}</p>
        </div>
        <button className="btn btn-outline" style={{ fontSize: 9 }} onClick={() => customerSignOut()}>Sign out</button>
      </div>

      <h3 style={{ fontSize: 20, marginBottom: 16 }}>Order history</h3>
      {orders === null ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading…</p>
        : orders.length === 0 ? (
          <div style={{ border: '1px solid var(--line)', padding: '40px 24px', textAlign: 'center', background: 'var(--ivory)' }}>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>No orders yet.</p>
            <Link to="/shop/candles" className="btn btn-dark">Shop Candles</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(o => (
              <div key={o.id} style={{ border: '1px solid var(--line)', padding: 18, background: 'var(--white)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleDateString()} · #{o.id.slice(0, 8)}</span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>${Number(o.amount_total ?? o.subtotal ?? 0)}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 8 }}>
                  {(o.items || []).map((it, i) => <span key={i}>{it.product_name} × {it.quantity}{i < (o.items!.length - 1) ? ' · ' : ''}</span>)}
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                  <span style={{ color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{o.status}</span>
                  {o.tracking_code && <span style={{ color: 'var(--muted)' }}>Tracking: {o.tracking_code}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}

const inp: CSSProperties = {
  width: '100%', padding: '13px 15px', border: '1px solid var(--line)', background: 'var(--ivory)',
  fontSize: 14, color: 'var(--ink)', outline: 'none', borderRadius: 0, fontFamily: 'var(--sans)', marginBottom: 14,
}
