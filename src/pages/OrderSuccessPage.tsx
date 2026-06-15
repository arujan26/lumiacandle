import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cart } from '../lib/cart'

export default function OrderSuccessPage() {
  useEffect(() => {
    // Payment succeeded — clear the cart.
    cart.clear()
  }, [])

  return (
    <section style={{ background: 'var(--white)', minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 72, color: 'var(--champagne)', display: 'block', lineHeight: 1, marginBottom: 28 }}>✦</span>
        <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>Order Confirmed</span>
        <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', lineHeight: 1, marginBottom: 20 }}>Thank you.</h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 40 }}>
          Your payment went through and your candles are on their way to being hand-poured and packed.
          A confirmation email with your order details is on its way.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/shop/candles" className="btn btn-dark">Continue Shopping</Link>
          <Link to="/" className="btn btn-outline">Back Home</Link>
        </div>
      </div>
    </section>
  )
}
