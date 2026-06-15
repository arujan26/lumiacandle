import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { stripePromise } from '../lib/stripe'
import { useCart, cart } from '../lib/cart'
import { fetchRates, createCheckoutSession, type ShipAddress, type Rate } from '../lib/shipping'

const EMPTY: ShipAddress = { name: '', email: '', phone: '', street1: '', street2: '', city: '', state: '', zip: '' }

export default function CheckoutPage() {
  const items = useCart()
  const subtotal = cart.total()
  const [step, setStep] = useState<'address' | 'rates' | 'pay'>('address')
  const [addr, setAddr] = useState<ShipAddress>(EMPTY)
  const [rates, setRates] = useState<Rate[]>([])
  const [rateId, setRateId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof ShipAddress, v: string) => setAddr(p => ({ ...p, [k]: v }))
  const fetchClientSecret = useCallback(async () => clientSecret, [clientSecret])

  if (items.length === 0 && step !== 'pay') {
    return (
      <section style={{ background: 'var(--white)', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
          <span className="eyebrow" style={{ marginBottom: 14, display: 'block' }}>Checkout</span>
          <h1 style={{ fontSize: 'clamp(32px,4vw,48px)', marginBottom: 16 }}>Your cart is empty</h1>
          <Link to="/shop/candles" className="btn btn-dark">Shop Candles</Link>
        </div>
      </section>
    )
  }

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await fetchRates(addr)
      setRates(r)
      setRateId(r[0]?.rate_id || '')
      setStep('rates')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not get rates.')
    } finally { setBusy(false) }
  }

  const goToPay = async () => {
    setBusy(true); setError('')
    try {
      const cs = await createCheckoutSession(rateId, addr)
      setClientSecret(cs)
      setStep('pay')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start payment.')
    } finally { setBusy(false) }
  }

  const chosen = rates.find(r => r.rate_id === rateId)

  return (
    <section style={{ background: 'var(--white)', padding: '56px 0 96px', minHeight: '70vh' }}>
      <div className="wrap" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span className="eyebrow" style={{ marginBottom: 12, display: 'block' }}>Secure Checkout</span>
          <h1 style={{ fontSize: 'clamp(32px,4.5vw,52px)', lineHeight: 1 }}>
            {step === 'address' ? 'Shipping details' : step === 'rates' ? 'Choose shipping' : 'Payment'}
          </h1>
          <Stepper step={step} />
        </div>

        {/* Order summary */}
        <div style={{ background: 'var(--cream)', padding: 20, marginBottom: 24 }}>
          {items.map(it => (
            <div key={it.product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 }}>
              <span>{it.product.name} × {it.quantity}</span><span>${it.product.price * it.quantity}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--line)', fontSize: 14, color: 'var(--muted)' }}>
            <span>Subtotal</span><span>${subtotal}</span>
          </div>
          {chosen && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, fontSize: 14, color: 'var(--muted)' }}>
                <span>Shipping ({chosen.service})</span><span>${chosen.amount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--line)', fontFamily: 'var(--serif)', fontSize: 22 }}>
                <span>Total</span><span>${(subtotal + chosen.amount).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {error && <p style={{ color: '#c04a3a', fontSize: 13, marginBottom: 14 }}>{error}</p>}

        {/* Step 1: address */}
        {step === 'address' && (
          <form onSubmit={submitAddress}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Full name" full><input style={inp} value={addr.name} onChange={e => set('name', e.target.value)} required /></Field>
              <Field label="Email"><input style={inp} type="email" value={addr.email} onChange={e => set('email', e.target.value)} required /></Field>
              <Field label="Phone"><input style={inp} value={addr.phone} onChange={e => set('phone', e.target.value)} /></Field>
              <Field label="Street address" full><input style={inp} value={addr.street1} onChange={e => set('street1', e.target.value)} required /></Field>
              <Field label="Apt / Suite (optional)" full><input style={inp} value={addr.street2} onChange={e => set('street2', e.target.value)} /></Field>
              <Field label="City"><input style={inp} value={addr.city} onChange={e => set('city', e.target.value)} required /></Field>
              <Field label="State"><input style={inp} value={addr.state} maxLength={2} placeholder="FL" onChange={e => set('state', e.target.value.toUpperCase())} required /></Field>
              <Field label="ZIP code"><input style={inp} value={addr.zip} onChange={e => set('zip', e.target.value)} required /></Field>
            </div>
            <button className="btn btn-dark" type="submit" style={{ width: '100%', marginTop: 18 }} disabled={busy}>
              {busy ? 'Getting rates…' : 'Continue to shipping'}
            </button>
            <p style={{ fontSize: 11, color: 'var(--muted-light)', textAlign: 'center', marginTop: 10 }}>We ship within the US 🇺🇸</p>
          </form>
        )}

        {/* Step 2: rates */}
        {step === 'rates' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {rates.map(r => (
                <label key={r.rate_id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '16px 18px', border: `1px solid ${rateId === r.rate_id ? 'var(--ink)' : 'var(--line)'}`,
                  background: rateId === r.rate_id ? 'var(--ivory)' : 'var(--white)', cursor: 'pointer',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="radio" name="rate" checked={rateId === r.rate_id} onChange={() => setRateId(r.rate_id)} />
                    <span>
                      <span style={{ fontSize: 15, color: 'var(--ink)', display: 'block' }}>{r.service}</span>
                      {r.days != null && <span style={{ fontSize: 12, color: 'var(--muted)' }}>~{r.days} business days</span>}
                    </span>
                  </span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>${r.amount.toFixed(2)}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setStep('address')}>Back</button>
              <button className="btn btn-dark" style={{ flex: 1 }} onClick={goToPay} disabled={busy || !rateId}>
                {busy ? 'Loading…' : 'Continue to payment'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: payment */}
        {step === 'pay' && clientSecret && (
          <div id="lumia-embedded-checkout">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </section>
  )
}

function Stepper({ step }: { step: 'address' | 'rates' | 'pay' }) {
  const idx = step === 'address' ? 0 : step === 'rates' ? 1 : 2
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18 }}>
      {['Address', 'Shipping', 'Payment'].map((l, i) => (
        <span key={l} style={{ fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: i <= idx ? 'var(--gold)' : 'var(--muted-light)', fontWeight: 500 }}>
          {l}{i < 2 ? ' ·' : ''}
        </span>
      ))}
    </div>
  )
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div style={{ marginBottom: 2, gridColumn: full ? '1 / -1' : undefined }}>
      <label style={{ fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 5, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 13px', border: '1px solid var(--line)',
  background: 'var(--ivory)', fontSize: 14, color: 'var(--ink)', outline: 'none',
  borderRadius: 0, fontFamily: 'var(--sans)',
}
