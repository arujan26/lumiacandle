import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../lib/productsApi'
import { cart } from '../lib/cart'
import { accentFor, EMOTION_PASTELS } from '../lib/accents'
import { useSettings } from '../lib/settings'

export default function ShopCandlesPage() {
  const [hovered, setHovered] = useState<string | null>(null)
  const { products } = useProducts('candle')
  const settings = useSettings()

  return (
    <>
      {/* Image banner */}
      <div style={{ width: '100%', height: 'clamp(280px,42vh,460px)', position: 'relative', overflow: 'hidden' }}>
        <img src={settings.hero_shop_candles || '/shop-candles-hero.webp'} alt="The Lumia candle collection" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: settings.hero_shop_candles_pos || '50% 52%',
        }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, background: 'linear-gradient(180deg, rgba(251,248,242,0), var(--ivory))' }} />
      </div>

      {/* Title */}
      <section style={{ background: 'var(--ivory)', padding: 'clamp(40px,6vw,72px) 0 clamp(36px,5vw,56px)', textAlign: 'center' }}>
        <div className="wrap" style={{ maxWidth: 660, margin: '0 auto' }}>
          <span className="eyebrow" style={{ marginBottom: 18, display: 'block' }}>The Collection</span>
          <h1 style={{ fontSize: 'clamp(42px,5.5vw,72px)', lineHeight: .95, marginBottom: 18 }}>Shop Candles</h1>
          {/* four emotion pastels */}
          <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 22 }}>
            {EMOTION_PASTELS.map(c => (
              <span key={c} style={{ width: 30, height: 5, borderRadius: 3, background: c }} />
            ))}
          </div>
          <p style={{ fontSize: 'clamp(15px,1.6vw,18px)', color: 'var(--brown)', lineHeight: 1.7, fontWeight: 300, maxWidth: 540, margin: '0 auto' }}>
            Each candle is named after an emotion — a feeling you want to sit with, release, or step into.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section style={{ background: 'var(--white)', padding: '0 0 clamp(80px,10vw,140px)' }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 28 }}>
            {products.map(p => {
              const accent = accentFor(p.emotion)
              return (
                <article
                  key={p.id}
                  style={{
                    background: 'var(--white)', border: '1px solid var(--line)', overflow: 'hidden',
                    transform: hovered === p.id ? 'translateY(-6px)' : 'none',
                    boxShadow: hovered === p.id ? `0 30px 70px rgba(26,20,16,.13)` : 'none',
                    transition: 'transform .4s var(--ease), box-shadow .4s var(--ease)',
                  }}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Link to={`/shop/candles/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5', background: 'var(--cream)' }}>
                      <img src={p.image_url} alt={p.name} decoding="async" style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        objectFit: 'cover', objectPosition: p.image_position || '50% 50%', display: 'block',
                        transform: hovered === p.id ? 'scale(1.04)' : 'scale(1)',
                        transition: 'transform .6s var(--ease)',
                      }} />
                      {p.badge && (
                        <span style={{
                          position: 'absolute', top: 16, left: 16, zIndex: 2,
                          background: accent, color: 'var(--ink)', fontSize: 8.5,
                          letterSpacing: '.18em', textTransform: 'uppercase', padding: '6px 11px', fontWeight: 600,
                        }}>{p.badge}</span>
                      )}
                    </div>
                    <div style={{ padding: '26px 28px 0' }}>
                      <h3 style={{ fontFamily: 'var(--serif)', fontSize: 28, marginBottom: 10, lineHeight: 1.05, color: 'var(--ink)' }}>{p.name}</h3>
                      <span style={{ display: 'block', width: 34, height: 3, borderRadius: 2, background: accent, marginBottom: 12 }} />
                      <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '.08em', marginBottom: 12, fontWeight: 500 }}>{p.fragrance}</p>
                      <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 0 }}>{p.description}</p>
                    </div>
                  </Link>
                  <div style={{ padding: '20px 28px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 23 }}>${p.price}</span>
                    <button className="btn btn-dark" style={{ padding: '11px 20px', fontSize: 9 }} onClick={() => cart.add(p)}>
                      Add to Cart
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
