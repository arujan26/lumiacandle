import { Link } from 'react-router-dom'
import { useProducts } from '../lib/productsApi'
import { cart } from '../lib/cart'

export default function HomePage() {
  const { products } = useProducts('candle')
  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative', minHeight: '100svh',
        display: 'flex', alignItems: 'center', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/hero.webp)',
          backgroundSize: 'cover', backgroundPosition: 'center 40%',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(100deg,rgba(26,20,16,.68) 0%,rgba(26,20,16,.4) 55%,rgba(26,20,16,.1) 100%)',
        }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 680, padding: 'clamp(100px,14vw,180px) 0 clamp(80px,10vw,140px)' }}>
            <span className="eyebrow" style={{ color: 'var(--champagne)', marginBottom: 24, display: 'block' }}>
              Lumia Candles
            </span>
            <h1 style={{ color: 'var(--white)', marginBottom: 28, lineHeight: .92 }}>
              Candles inspired by <em style={{ fontStyle: 'italic', color: 'var(--champagne)' }}>emotions</em>,<br />
              rituals, and meaningful<br />moments.
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 44 }}>
              <Link to="/shop/candles" className="btn btn-ghost">Shop Candles</Link>
              <Link to="/shop/stickers" className="btn btn-outline" style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,.4)' }}>
                Shop Stickers
              </Link>
            </div>
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          color: 'rgba(255,253,248,.55)', fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase',
        }}>
          Scroll
          <span style={{ display: 'block', width: 1, height: 40, background: 'rgba(255,253,248,.35)' }} />
        </div>
      </section>

      {/* Featured Collection */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="wrap">
          <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 72px' }}>
            <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>Featured Collection</span>
            <h2>Four candles. Four feelings.</h2>
          </div>
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {products.map(p => (
              <Link key={p.id} to={`/shop/candles/${p.id}`} style={{ textDecoration: 'none' }}>
                <article style={{
                  background: 'var(--ivory)', border: '1px solid var(--line)', overflow: 'hidden',
                  transition: 'transform .4s var(--ease), box-shadow .4s var(--ease)', cursor: 'pointer',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 32px 80px rgba(26,20,16,.12)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5' }}>
                    <img src={p.image_url} alt={p.name} decoding="async" style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'cover', objectPosition: 'center center', display: 'block',
                    }} />
                    {p.badge && (
                      <span style={{
                        position: 'absolute', top: 16, left: 16, zIndex: 2,
                        background: 'var(--gold)', color: 'white', fontSize: 8,
                        letterSpacing: '.2em', textTransform: 'uppercase', padding: '5px 10px', fontWeight: 500,
                      }}>{p.badge}</span>
                    )}
                  </div>
                  <div style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, marginBottom: 6, lineHeight: 1.1 }}>{p.name}</h3>
                    <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '.1em', marginBottom: 12 }}>{p.fragrance}</p>
                    <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>{p.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>${p.price}</span>
                      <button className="btn btn-dark" style={{ padding: '10px 16px', fontSize: 9 }}
                        onClick={e => { e.preventDefault(); cart.add(p) }}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 52, display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Link to="/shop/candles" className="btn btn-dark">Shop Candles</Link>
            <Link to="/shop/stickers" className="btn btn-outline">Shop Stickers</Link>
          </div>
        </div>
      </section>

      {/* Footer tagline */}
      <section style={{ background: 'var(--cream)', padding: '60px 0', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ marginBottom: 20, display: 'block' }}>Lumia</span>
          <p className="lead" style={{ margin: '0 auto', textAlign: 'center' }}>
            Hand-poured in small batches.<br />Made with a premium coconut-soy wax blend.
          </p>
        </div>
      </section>
    </>
  )
}
