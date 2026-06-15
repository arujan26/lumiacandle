import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { stripePromise } from '../lib/stripe'
import { fetchCheckoutClientSecret } from '../lib/checkout'
import { useCart, cart } from '../lib/cart'

export default function CheckoutPage() {
  const items = useCart()
  const total = cart.total()
  const [error, setError] = useState('')

  const fetchClientSecret = useCallback(async () => {
    try {
      return await fetchCheckoutClientSecret()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Checkout is temporarily unavailable.'
      setError(msg)
      throw e
    }
  }, [])

  // Empty cart (and not mid-error) → nudge back to the shop
  if (items.length === 0 && !error) {
    return (
      <section style={{ background: 'var(--white)', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
          <span className="eyebrow" style={{ marginBottom: 14, display: 'block' }}>Checkout</span>
          <h1 style={{ fontSize: 'clamp(32px,4vw,48px)', marginBottom: 16 }}>Your cart is empty</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Add a candle to begin.</p>
          <Link to="/shop/candles" className="btn btn-dark">Shop Candles</Link>
        </div>
      </section>
    )
  }

  return (
    <section style={{ background: 'var(--white)', padding: '56px 0 96px', minHeight: '70vh' }}>
      <div className="wrap" style={{ maxWidth: 720, margin: '0 auto' }}>
        <nav style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 28 }}>
          <Link to="/shop/candles" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</Link>
          <span>/</span>
          <span style={{ color: 'var(--ink)' }}>Checkout</span>
        </nav>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span className="eyebrow" style={{ marginBottom: 12, display: 'block' }}>Secure Checkout</span>
          <h1 style={{ fontSize: 'clamp(34px,4.5vw,56px)', lineHeight: 1 }}>Complete your order</h1>
        </div>

        {/* Order summary */}
        {items.length > 0 && (
          <div style={{ background: 'var(--cream)', padding: 24, marginBottom: 28 }}>
            {items.map(item => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: 'var(--ink)' }}>
                <span>{item.product.name} × {item.quantity}</span>
                <span>${item.product.price * item.quantity}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, marginTop: 6, borderTop: '1px solid var(--line)', fontFamily: 'var(--serif)', fontSize: 22 }}>
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        )}

        {error ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px solid var(--line)', background: 'var(--ivory)' }}>
            <p style={{ fontSize: 15, color: 'var(--ink)', marginBottom: 8 }}>We couldn't start the payment.</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>{error}</p>
            <Link to="/shop/candles" className="btn btn-outline">Back to Shop</Link>
          </div>
        ) : (
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
