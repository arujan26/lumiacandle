import { useState, Fragment } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CANDLE_CARE, PRODUCT_DETAILS } from '../lib/products'
import { useProducts } from '../lib/productsApi'
import { cart } from '../lib/cart'
import { accentFor } from '../lib/accents'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { products, loading } = useProducts('candle')
  const product = products.find(p => p.id === id)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        {loading ? (
          <span style={{ fontFamily: 'var(--serif)', fontSize: 40, color: 'var(--champagne)' }}>✦</span>
        ) : (
          <>
            <p className="eyebrow">404</p>
            <h2>Candle not found</h2>
            <Link to="/shop/candles" className="btn btn-dark">Back to Shop</Link>
          </>
        )}
      </div>
    )
  }

  const handleAdd = () => {
    cart.add(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const others = products.filter(p => p.id !== product.id)
  const accent = accentFor(product.emotion)

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: 'var(--cream)', padding: '24px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <nav style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link to="/shop/candles" style={{ color: 'inherit', textDecoration: 'none' }}>Shop Candles</Link>
            <span>/</span>
            <span style={{ color: 'var(--ink)' }}>{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product */}
      <section style={{ background: 'var(--white)', padding: '72px 0' }}>
        <div className="wrap">
          <div className="product-page-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
            gap: 72, alignItems: 'start',
          }}>
            {/* Image */}
            <div style={{ position: 'sticky', top: 100 }}>
              <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5', background: 'var(--cream)' }}>
                <img src={product.image_url} alt={product.name} decoding="async" style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: product.image_position || '50% 50%', display: 'block',
                }} />
                {product.badge && (
                  <span style={{
                    position: 'absolute', top: 20, left: 20, zIndex: 2,
                    background: accent, color: 'var(--ink)', fontSize: 8.5,
                    letterSpacing: '.18em', textTransform: 'uppercase', padding: '6px 12px', fontWeight: 600,
                  }}>{product.badge}</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div style={{ paddingTop: 8 }}>
              <span className="eyebrow" style={{ marginBottom: 12, display: 'block' }}>{product.emotion}</span>
              <h1 style={{ fontSize: 'clamp(44px,5vw,68px)', lineHeight: .9, marginBottom: 16 }}>{product.name}</h1>
              <span style={{ display: 'block', width: 44, height: 4, borderRadius: 2, background: accent, marginBottom: 20 }} />
              <p style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '.15em', marginBottom: 24 }}>
                {product.fragrance}
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 20, lineHeight: 1.5, color: 'var(--ink)', marginBottom: 16 }}>
                {product.description}
              </p>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, marginBottom: 8 }}>
                {product.long_description}
              </p>
              {product.for_text && (
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 40, borderLeft: `3px solid ${accent}`, paddingLeft: 16 }}>
                  {product.for_text}
                </p>
              )}

              <div style={{ fontFamily: 'var(--serif)', fontSize: 32, marginBottom: 36 }}>${product.price}</div>

              {/* Qty + Add */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line)' }}>
                  <button
                    style={{ width: 44, height: 50, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--ink)' }}
                    onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span style={{ width: 44, textAlign: 'center', fontSize: 14, fontWeight: 500 }}>{qty}</span>
                  <button
                    style={{ width: 44, height: 50, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--ink)' }}
                    onClick={() => setQty(q => q + 1)}>+</button>
                </div>
                <button
                  className="btn btn-dark"
                  style={{ flex: 1, fontSize: 10, letterSpacing: '.2em' }}
                  onClick={handleAdd}>
                  {added ? '✓ Added' : 'Add to Cart'}
                </button>
              </div>

              {/* Product details table */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 32, marginBottom: 36 }}>
                <h4 style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20, color: 'var(--ink)' }}>
                  Product Details
                </h4>
                <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 32px' }}>
                  {PRODUCT_DETAILS.map(d => (
                    <Fragment key={d.label}>
                      <dt style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.05em' }}>{d.label}</dt>
                      <dd style={{ fontSize: 12, color: 'var(--ink)', margin: 0, fontWeight: 500 }}>{d.value}</dd>
                    </Fragment>
                  ))}
                </dl>
              </div>

              {/* Candle care */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 32 }}>
                <h4 style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20, color: 'var(--ink)' }}>
                  Candle Care
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {CANDLE_CARE.map((tip, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}>—</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* You may also like */}
      <section style={{ background: 'var(--cream)', padding: '80px 0' }}>
        <div className="wrap">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="eyebrow" style={{ marginBottom: 12, display: 'block' }}>The Collection</span>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)' }}>You may also like</h2>
          </div>
          <div className="similar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {others.map(p => (
              <Link key={p.id} to={`/shop/candles/${p.id}`} style={{ textDecoration: 'none' }}>
                <article style={{
                  background: 'var(--white)', border: '1px solid var(--line)', overflow: 'hidden',
                  transition: 'transform .4s var(--ease), box-shadow .4s var(--ease)',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 60px rgba(26,20,16,.1)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
                >
                  <div style={{ aspectRatio: '4/5', overflow: 'hidden', position: 'relative' }}>
                    <img src={p.image_url} alt={p.name} decoding="async" style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'cover', objectPosition: p.image_position || '50% 50%', display: 'block',
                    }} />
                  </div>
                  <div style={{ padding: 20 }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 4, color: 'var(--ink)' }}>{p.name}</h3>
                    <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '.1em', marginBottom: 10 }}>{p.fragrance}</p>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>${p.price}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
