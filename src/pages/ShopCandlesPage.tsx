import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../lib/productsApi'
import { cart } from '../lib/cart'

export default function ShopCandlesPage() {
  const [hovered, setHovered] = useState<string | null>(null)
  const { products } = useProducts('candle')

  return (
    <>
      <section style={{ background: 'var(--cream)', padding: '120px 0 72px', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>The Collection</span>
          <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: .95 }}>Shop Candles</h1>
          <p className="lead" style={{ margin: '24px auto 0' }}>
            Each candle is named after an emotion — a feeling you want to sit with, release, or step into.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="wrap">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 28,
          }}>
            {products.map(p => (
              <article
                key={p.id}
                style={{
                  background: 'var(--ivory)', border: '1px solid var(--line)', overflow: 'hidden',
                  transform: hovered === p.id ? 'translateY(-6px)' : 'none',
                  boxShadow: hovered === p.id ? '0 32px 80px rgba(26,20,16,.12)' : 'none',
                  transition: 'transform .4s var(--ease), box-shadow .4s var(--ease)',
                }}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <Link to={`/shop/candles/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5' }}>
                    <img src={p.image_url} alt={p.name} decoding="async" style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'cover', objectPosition: 'center center', display: 'block',
                      transform: hovered === p.id ? 'scale(1.04)' : 'scale(1)',
                      transition: 'transform .6s var(--ease)',
                    }} />
                    {p.badge && (
                      <span style={{
                        position: 'absolute', top: 16, left: 16, zIndex: 2,
                        background: 'var(--gold)', color: 'white', fontSize: 8,
                        letterSpacing: '.2em', textTransform: 'uppercase', padding: '5px 10px', fontWeight: 500,
                      }}>{p.badge}</span>
                    )}
                  </div>
                  <div style={{ padding: 28 }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginBottom: 6, lineHeight: 1.1, color: 'var(--ink)' }}>{p.name}</h3>
                    <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '.1em', marginBottom: 12, fontWeight: 400 }}>{p.fragrance}</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 0 }}>{p.description}</p>
                  </div>
                </Link>
                <div style={{ padding: '0 28px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>${p.price}</span>
                  <button className="btn btn-dark" style={{ padding: '11px 20px', fontSize: 9 }}
                    onClick={() => cart.add(p)}>
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
