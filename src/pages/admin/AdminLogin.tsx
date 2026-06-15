import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { signIn, checkIsAdmin, getVerifiedTotpFactorId, isAalSatisfied } from '../../lib/auth'
import { ADMIN_HOME } from '../../lib/adminBase'

type Step = 'loading' | 'password' | 'enroll' | 'challenge'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [qr, setQr] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')

  // Route based on any existing session on mount
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) { setStep('password'); return }
      if (!(await checkIsAdmin())) { await supabase.auth.signOut(); setStep('password'); return }
      await proceed()
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Decide next step: force enrollment if no authenticator, else require a code.
  async function proceed() {
    const verified = await getVerifiedTotpFactorId()
    if (!verified) { await startEnroll(); return }
    if (await isAalSatisfied()) { navigate(ADMIN_HOME); return }
    setFactorId(verified); setStep('challenge')
  }

  async function startEnroll() {
    setError('')
    const { data: list } = await supabase.auth.mfa.listFactors()
    for (const f of (list?.all ?? []).filter(x => x.status === 'unverified')) {
      await supabase.auth.mfa.unenroll({ factorId: f.id })
    }
    const { data, error: enrErr } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Lumia-${Date.now()}` })
    if (enrErr || !data) { setError(enrErr?.message || 'Could not start 2FA setup.'); setStep('password'); return }
    setFactorId(data.id)
    setQr(data.totp.qr_code)
    setSecret(data.totp.secret)
    setStep('enroll')
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('')
    const { error: signErr } = await signIn(email, password)
    if (signErr) { setError('Invalid email or password.'); setBusy(false); return }
    if (!(await checkIsAdmin())) { await supabase.auth.signOut(); setError('This account is not an admin.'); setBusy(false); return }
    await proceed()
    setBusy(false)
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('')
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId })
    if (chErr || !ch) { setError(chErr?.message || 'Could not verify. Try again.'); setBusy(false); return }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code: code.replace(/\s/g, '') })
    if (vErr) { setError('Invalid code. Try again.'); setBusy(false); return }
    setBusy(false); navigate(ADMIN_HOME)
  }

  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--white)', border: '1px solid var(--line)', padding: 44 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 32, letterSpacing: '.12em', marginBottom: 6 }}>Lumia</div>
          <p style={{ fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)' }}>Dashboard</p>
        </div>

        {step === 'loading' && <p style={{ textAlign: 'center', color: 'var(--muted)' }}>…</p>}

        {step === 'password' && (
          <form onSubmit={handlePassword}>
            <input style={inp} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required />
            <input style={inp} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
            {error && <p style={errStyle}>{error}</p>}
            <button className="btn btn-dark" type="submit" style={{ width: '100%' }} disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
          </form>
        )}

        {step === 'enroll' && (
          <form onSubmit={verifyCode}>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16, textAlign: 'center' }}>
              Set up <strong>Google Authenticator</strong>: scan this code, then enter the 6-digit code.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <div style={{ width: 180, height: 180, background: '#fff', padding: 8, border: '1px solid var(--line)' }}>
                {qr.startsWith('<svg')
                  ? <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: qr }} />
                  : <img src={qr} alt="QR code" style={{ width: '100%', height: '100%' }} />}
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted-light)', textAlign: 'center', marginBottom: 16, wordBreak: 'break-all' }}>
              Or enter key manually: <code style={{ color: 'var(--ink)' }}>{secret}</code>
            </p>
            <input style={{ ...inp, textAlign: 'center', letterSpacing: '.3em', fontSize: 18 }} inputMode="numeric" placeholder="000000" value={code} onChange={e => setCode(e.target.value)} maxLength={6} required />
            {error && <p style={errStyle}>{error}</p>}
            <button className="btn btn-dark" type="submit" style={{ width: '100%' }} disabled={busy}>{busy ? 'Verifying…' : 'Activate 2FA'}</button>
          </form>
        )}

        {step === 'challenge' && (
          <form onSubmit={verifyCode}>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 16, textAlign: 'center' }}>
              Enter the 6-digit code from <strong>Google Authenticator</strong>.
            </p>
            <input style={{ ...inp, textAlign: 'center', letterSpacing: '.3em', fontSize: 18 }} inputMode="numeric" placeholder="000000" value={code} onChange={e => setCode(e.target.value)} maxLength={6} autoFocus required />
            {error && <p style={errStyle}>{error}</p>}
            <button className="btn btn-dark" type="submit" style={{ width: '100%' }} disabled={busy}>{busy ? 'Verifying…' : 'Verify'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '13px 15px', border: '1px solid var(--line)',
  background: 'var(--ivory)', fontSize: 14, color: 'var(--ink)', outline: 'none',
  borderRadius: 0, fontFamily: 'var(--sans)', marginBottom: 14,
}
const errStyle: React.CSSProperties = { color: '#c04a3a', fontSize: 13, marginBottom: 12 }
