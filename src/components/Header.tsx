import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../lib/cart'

interface HeaderProps {
  onCartOpen: () => void
}

export default function Header({ onCartOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = useCart()
  const count = items.reduce((s, i) => s + i.quantity, 0)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const nav = [
    { to: '/', label: 'Home' },
    { to: '/shop/candles', label: 'Shop Candles' },
    { to: '/shop/stickers', label: 'Shop Stickers' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ]

  const onHero = isHome && !scrolled
  // Subtle top-down shade over the hero so light nav text stays readable
  const headerBg = onHero
    ? 'linear-gradient(180deg, rgba(18,13,10,.55) 0%, rgba(18,13,10,.18) 55%, rgba(18,13,10,0) 100%)'
    : 'rgba(251,248,242,.96)'
  const navColor = onHero ? 'rgba(255,253,248,.92)' : 'var(--muted)'
  const logoColor = onHero ? 'var(--white)' : 'var(--ink)'
  const borderColor = onHero ? 'rgba(255,253,248,.18)' : 'var(--line)'
  const cartColor = onHero ? 'var(--white)' : 'var(--ink)'
  const cartBorder = onHero ? 'rgba(255,253,248,.4)' : 'var(--line)'
  const hamColor = onHero ? 'var(--white)' : 'var(--ink)'

  return (
    <>
      {/* Announcement bar */}
      <div style={{
        background: 'var(--ink)', color: 'rgba(255,253,248,.75)',
        fontSize: 10, letterSpacing: '.2em', textAlign: 'center',
        padding: '10px 24px', textTransform: 'uppercase', fontWeight: 500,
      }}>
        Hand-poured in small batches &nbsp;·&nbsp; $35 each &nbsp;·&nbsp; Free shipping on orders over $70
      </div>

      <header style={{
        position: 'sticky', top: 0, zIndex: 900,
        background: headerBg,
        backdropFilter: scrolled || !isHome ? 'blur(20px)' : 'none',
        borderBottom: `1px solid ${borderColor}`,
        transition: 'background .35s ease, border-color .35s ease, box-shadow .3s',
        boxShadow: scrolled ? '0 4px 40px rgba(26,20,16,.08)' : 'none',
      }}>
        <div className="header-inner">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: `1px solid ${borderColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontSize: 17, color: logoColor,
              transition: 'color .35s, border-color .35s',
              background: isHome && !scrolled ? 'rgba(255,253,248,.12)' : 'transparent',
            }}>L</div>
            <span style={{
              fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: '.1em',
              color: logoColor, transition: 'color .35s',
            }}>Lumia</span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {nav.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'}
                style={({ isActive }) => ({
                  fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
                  fontWeight: 500, textDecoration: 'none',
                  color: isActive ? (isHome && !scrolled ? 'var(--champagne)' : 'var(--ink)') : navColor,
                  transition: 'color .35s',
                })}
              >{n.label}</NavLink>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onCartOpen} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
              border: `1px solid ${cartBorder}`, background: 'transparent',
              fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
              color: cartColor, cursor: 'pointer', fontWeight: 500,
              transition: 'color .35s, border-color .35s',
            }}>
              Cart
              {count > 0 && (
                <span style={{
                  background: 'var(--gold)', color: 'white', borderRadius: '50%',
                  width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 500,
                }}>{count}</span>
              )}
            </button>

            {/* Hamburger — mobile only, hidden in desktop via CSS */}
            <button
              style={{
                display: 'flex', flexDirection: 'column', gap: 5, padding: 8,
                background: 'none', border: 'none', cursor: 'pointer',
              }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{ display: 'block', width: 22, height: 1.5, background: hamColor, transition: 'background .35s' }} />
              ))}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 950, background: 'var(--ivory)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
        }}>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ position: 'absolute', top: 24, right: 24, fontSize: 28, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >✕</button>
          {nav.map(n => (
            <Link key={n.to} to={n.to} style={{ fontFamily: 'var(--serif)', fontSize: 32, color: 'var(--ink)', textDecoration: 'none' }}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
