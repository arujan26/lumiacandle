import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth, signOut } from '../../lib/auth'
import { ADMIN_HOME, ADMIN_PRODUCTS, ADMIN_ORDERS, ADMIN_MESSAGES, ADMIN_SETTINGS, ADMIN_LOGIN } from '../../lib/adminBase'

export default function AdminLayout() {
  const { allowed, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 40, color: 'var(--champagne)' }}>✦</span>
      </div>
    )
  }

  if (!allowed) return <Navigate to={ADMIN_LOGIN} replace />

  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display: 'block', padding: '12px 16px', fontSize: 12, letterSpacing: '.12em',
    textTransform: 'uppercase', textDecoration: 'none', fontWeight: 500,
    color: isActive ? 'var(--white)' : 'rgba(255,253,248,.6)',
    background: isActive ? 'rgba(255,253,248,.08)' : 'transparent',
    borderLeft: isActive ? '2px solid var(--champagne)' : '2px solid transparent',
  })

  const handleLogout = async () => { await signOut(); navigate(ADMIN_LOGIN) }

  return (
    <div style={{ display: 'flex', minHeight: '100svh', background: 'var(--ivory)' }}>
      <aside style={{ width: 230, background: 'var(--ink)', color: 'var(--white)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100svh' }}>
        <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,253,248,.1)' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 26, letterSpacing: '.12em' }}>Lumia</div>
          <p style={{ fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(255,253,248,.4)', marginTop: 4 }}>Dashboard</p>
        </div>
        <nav style={{ padding: '16px 0', flex: 1 }}>
          <NavLink to={ADMIN_HOME} end style={linkStyle}>Overview</NavLink>
          <NavLink to={ADMIN_PRODUCTS} style={linkStyle}>Products</NavLink>
          <NavLink to={ADMIN_ORDERS} style={linkStyle}>Orders</NavLink>
          <NavLink to={ADMIN_MESSAGES} style={linkStyle}>Messages</NavLink>
          <NavLink to={ADMIN_SETTINGS} style={linkStyle}>Settings</NavLink>
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,253,248,.1)' }}>
          <a href="https://lumiacandle.com" target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 11, color: 'rgba(255,253,248,.5)', textDecoration: 'none', marginBottom: 12, letterSpacing: '.1em' }}>↗ View store</a>
          <button onClick={handleLogout} style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,253,248,.7)', background: 'none', border: '1px solid rgba(255,253,248,.2)', padding: '8px 14px', cursor: 'pointer', width: '100%' }}>
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px clamp(20px,4vw,48px)', overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  )
}
