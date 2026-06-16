import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useCustomer, customerSignUp, customerSignIn, customerSignOut, customerName } from '../lib/customerAuth'
import MembersDashboard from './account/MembersDashboard'

export default function AccountPage() {
  const { session, loading } = useCustomer()

  if (loading) {
    return <section className="section" style={{ background: 'var(--white)' }}><div className="wrap" style={{ textAlign: 'center', color: 'var(--muted)' }}>Loading…</div></section>
  }

  if (session) {
    return (
      <section style={{ background: 'var(--ivory)', padding: 'clamp(18px,3vw,30px) 0 80px' }}>
        <div className="wrap" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button className="btn btn-outline" style={{ fontSize: 9, padding: '9px 16px' }} onClick={() => customerSignOut()}>Sign out</button>
          </div>
          <MembersDashboard userId={session.user.id} email={session.user.email || ''} name={customerName(session)} />
        </div>
      </section>
    )
  }

  return (
    <>
      <section style={{ background: 'var(--cream)', padding: '120px 0 64px', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>The Lumia Club</span>
          <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: .95 }}>Members Only</h1>
          <p className="lead" style={{ margin: '20px auto 0' }}>A private space for rituals, rewards and a little daily glow. Sign in to enter.</p>
        </div>
      </section>
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="wrap" style={{ maxWidth: 420, margin: '0 auto' }}><AuthForm /></div>
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
        {(['login', 'signup'] as const).map(mm => (
          <button key={mm} onClick={() => { setMode(mm); setError(''); setInfo('') }}
            style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 500, color: mode === mm ? 'var(--ink)' : 'var(--muted-light)', borderBottom: mode === mm ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: -1 }}>
            {mm === 'login' ? 'Sign In' : 'Create Account'}
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
        </form>
      )}
      <p style={{ fontSize: 11, color: 'var(--muted-light)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
        You don't need an account to shop — <Link to="/shop/candles" style={{ color: 'var(--gold)' }}>checkout as a guest</Link> anytime.
      </p>
    </div>
  )
}

const inp: CSSProperties = {
  width: '100%', padding: '13px 15px', border: '1px solid var(--line)', background: 'var(--ivory)',
  fontSize: 14, color: 'var(--ink)', outline: 'none', borderRadius: 0, fontFamily: 'var(--sans)', marginBottom: 14,
}
