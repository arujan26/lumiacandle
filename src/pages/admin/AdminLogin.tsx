import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, checkIsAdmin } from '../../lib/auth'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: signErr } = await signIn(email, password)
    if (signErr) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }
    const ok = await checkIsAdmin()
    setLoading(false)
    if (!ok) {
      setError('This account is not an admin.')
      return
    }
    navigate('/admin')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 15px', border: '1px solid var(--line)',
    background: 'var(--ivory)', fontSize: 14, color: 'var(--ink)', outline: 'none',
    borderRadius: 0, fontFamily: 'var(--sans)', marginBottom: 14,
  }

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'var(--white)', border: '1px solid var(--line)', padding: 44 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 32, letterSpacing: '.12em', marginBottom: 6 }}>Lumia</div>
          <p style={{ fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)' }}>Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required />
          <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
          {error && <p style={{ color: '#c04a3a', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button className="btn btn-dark" type="submit" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
