import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../lib/productsApi'
import { cart } from '../lib/cart'

const FEATURES = ['Waterproof', 'Durable vinyl', 'Perfect for laptops, journals, water bottles & iPads']

export default function ShopStickersPage() {
  const { products } = useProducts('sticker')
  const [hovered, setHovered] = useState<string | null>(null)
  const [added, setAdded] = useState<string | null>(null)
  const hasStickers = products.length > 0

  const add = (p: typeof products[number]) => {
    cart.add(p)
    setAdded(p.id)
    setTimeout(() => setAdded(a => (a === p.id ? null : a)), 1500)
  }

  return (
    <>
      <section style={{ background: 'var(--cream)', padding: '120px 0 72px', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>Shop Stickers</span>
          <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: .95 }}>Sticker Collections</h1>
          <p className="lead" style={{ margin: '24px auto 0' }}>
            A collection of illustrated stickers inspired by growth, healing, everyday joy, and the little moments that make life meaningful.
          </p>
        </div>
      </section>

      {hasStickers ? (
        <section className="section" style={{ background: 'var(--white)' }}>
          <div className="wrap">
            <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
              {products.map(p => (
                <article key={p.id}
                  style={{
                    background: 'var(--ivory)', border: '1px solid var(--line)', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    transform: hovered === p.id ? 'translateY(-6px)' : 'none',
                    boxShadow: hovered === p.id ? '0 28px 70px rgba(26,20,16,.12)' : 'none',
                    transition: 'transform .4s var(--ease), box-shadow .4s var(--ease)',
                  }}
                  onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)}>
                  <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5', background: 'var(--cream)' }}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--champagne)', fontFamily: 'var(--serif)', fontSize: 48 }}>✦</div>}
                  </div>
                  <div style={{ padding: 26, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 26, marginBottom: 4, lineHeight: 1.1, color: 'var(--ink)' }}>{p.name}</h3>
                    {p.fragrance && <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '.1em', marginBottom: 14, textTransform: 'uppercase' }}>{p.fragrance}</p>}
                    {p.description && <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 16 }}>{p.description}</p>}
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {FEATURES.map(f => (
                        <li key={f} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
                          <span style={{ color: 'var(--gold)', flexShrink: 0 }}>✓</span>{f}
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>${p.price.toFixed(2)}</span>
                      <button className="btn btn-dark" style={{ padding: '11px 18px', fontSize: 9 }} onClick={() => add(p)}>
                        {added === p.id ? '✓ Added' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Bottom note */}
            <div style={{ marginTop: 56, textAlign: 'center', background: 'var(--cream)', padding: '28px 24px', border: '1px solid var(--line)' }}>
              <p style={{ fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                ✨ Every candle order includes 2 surprise Lumia Mini Gifts stickers.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="section" style={{ background: 'var(--white)', textAlign: 'center' }}>
          <div className="wrap">
            <div style={{ maxWidth: 480, margin: '0 auto', padding: '72px 40px', border: '1px solid var(--line)', background: 'var(--ivory)' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 64, display: 'block', marginBottom: 28, color: 'var(--champagne)', lineHeight: 1 }}>✦</span>
              <h2 style={{ fontSize: 32, marginBottom: 16 }}>Coming soon.</h2>
              <Link to="/shop/candles" className="btn btn-dark">Shop Candles</Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
