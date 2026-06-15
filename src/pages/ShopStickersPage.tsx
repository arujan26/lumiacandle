import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../lib/productsApi'
import { cart } from '../lib/cart'

export default function ShopStickersPage() {
  const { products } = useProducts('sticker')
  const [hovered, setHovered] = useState<string | null>(null)
  const hasStickers = products.length > 0

  return (
    <>
      <section style={{ background: 'var(--cream)', padding: '120px 0 72px', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>{hasStickers ? 'The Collection' : 'Coming Soon'}</span>
          <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: .95 }}>Shop Stickers</h1>
          <p className="lead" style={{ margin: '24px auto 0' }}>
            Affirmation stickers designed to inspire, remind, and uplift.
          </p>
        </div>
      </section>

      {hasStickers ? (
        <section className="section" style={{ background: 'var(--white)' }}>
          <div className="wrap">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
              {products.map(p => (
                <article key={p.id}
                  style={{
                    background: 'var(--ivory)', border: '1px solid var(--line)', overflow: 'hidden',
                    transform: hovered === p.id ? 'translateY(-6px)' : 'none',
                    boxShadow: hovered === p.id ? '0 28px 70px rgba(26,20,16,.12)' : 'none',
                    transition: 'transform .4s var(--ease), box-shadow .4s var(--ease)',
                  }}
                  onMouseEnter={() => setHovered(p.id)} onMouseLeave={() => setHovered(null)}>
                  <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1/1', background: 'var(--cream)' }}>
                    {p.image_url && <img src={p.image_url} alt={p.name} decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ padding: 20 }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 6, color: 'var(--ink)' }}>{p.name}</h3>
                    {p.description && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>{p.description}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>${p.price}</span>
                      <button className="btn btn-dark" style={{ padding: '10px 16px', fontSize: 9 }} onClick={() => cart.add(p)}>Add to Cart</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="section" style={{ background: 'var(--white)', textAlign: 'center' }}>
          <div className="wrap">
            <div style={{ maxWidth: 480, margin: '0 auto', padding: '72px 40px', border: '1px solid var(--line)', background: 'var(--ivory)' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 64, display: 'block', marginBottom: 28, color: 'var(--champagne)', lineHeight: 1 }}>✦</span>
              <h2 style={{ fontSize: 32, marginBottom: 16 }}>Something beautiful is on its way.</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 36 }}>
                Our sticker collection is being crafted with care. Follow us on Instagram and TikTok{' '}
                <strong>@lumiacandles</strong> to be the first to know when they drop.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <a href="https://instagram.com/lumiacandles" target="_blank" rel="noopener noreferrer" className="btn btn-dark">Instagram</a>
                <Link to="/shop/candles" className="btn btn-outline">Shop Candles</Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
