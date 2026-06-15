import { useState, useEffect } from 'react'
import { useCart } from '../lib/cart'

interface HeaderProps {
  onCartOpen: () => void
}

export default function Header({ onCartOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = useCart()
  const count = items.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const nav = [
    { href: '#shop', label: 'Shop' },
    { href: '#emotions', label: 'Find Yours' },
    { href: '#build', label: 'Custom' },
    { href: '#why', label: 'Why Lumia' },
    { href: '#shipping', label: 'Shipping' },
  ]

  return (
    <>
      <div id="announcement-bar">Hand-poured emotional candles &nbsp;·&nbsp; $35 each &nbsp;·&nbsp; Customer pays shipping at checkout</div>
      <header id="header" className={scrolled ? 'scrolled' : ''} style={{
        position: 'sticky', top: 0, zIndex: 900,
        background: 'rgba(251,248,242,.94)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line)', transition: 'box-shadow .3s',
        boxShadow: scrolled ? '0 4px 40px rgba(26,20,16,.08)' : 'none',
      }}>
        <div className="header-inner">
          <a href="#" className="logo-mark" style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div className="logo-circle" style={{
              width:42, height:42, borderRadius:'50%',
              background: 'var(--champagne)',
              border: '1px solid var(--line)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--serif)', fontSize:18, color:'var(--ink)',
            }}>L</div>
            <span className="logo-text">Lumia</span>
          </a>

          <nav style={{ display:'flex', alignItems:'center', gap:32 }}>
            {nav.map(n => (
              <a key={n.href} href={n.href} style={{ fontSize:10, letterSpacing:'.2em', textTransform:'uppercase', fontWeight:500, color:'var(--muted)' }}>
                {n.label}
              </a>
            ))}
          </nav>

          <div className="header-actions" style={{ display:'flex', alignItems:'center', gap:16 }}>
            <button className="cart-btn" onClick={onCartOpen} style={{
              display:'flex', alignItems:'center', gap:8, padding:'8px 16px',
              border:'1px solid var(--line)', background:'transparent',
              fontSize:10, letterSpacing:'.18em', textTransform:'uppercase',
              color:'var(--ink)', cursor:'pointer', fontWeight:500,
            }}>
              Cart
              {count > 0 && (
                <span className="cart-count" style={{
                  background:'var(--gold)', color:'white', borderRadius:'50%',
                  width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:9, fontWeight:500,
                }}>{count}</span>
              )}
            </button>
            <button
              style={{ display:'flex', flexDirection:'column', gap:5, padding:8, background:'none', border:'none' }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              {[0,1,2].map(i => (
                <span key={i} style={{ display:'block', width:22, height:1.5, background:'var(--ink)' }} />
              ))}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex:950, background:'var(--ivory)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:28,
        }}>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ position:'absolute', top:24, right:24, fontSize:28, color:'var(--muted)', background:'none', border:'none', cursor:'pointer' }}
          >✕</button>
          {nav.map(n => (
            <a key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
              style={{ fontFamily:'var(--serif)', fontSize:32, color:'var(--ink)' }}>
              {n.label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
