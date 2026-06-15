import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet, useNavigate, Navigate } from 'react-router-dom'
import './index.css'
import { isDashboardHost } from './lib/adminBase'
import { useSettings } from './lib/settings'
import Header from './components/Header'
import CartDrawer from './components/CartDrawer'
import HomePage from './pages/HomePage'
import ShopCandlesPage from './pages/ShopCandlesPage'
import ProductPage from './pages/ProductPage'
import ShopStickersPage from './pages/ShopStickersPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminOverview from './pages/admin/AdminOverview'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminMessages from './pages/admin/AdminMessages'
import AdminSettings from './pages/admin/AdminSettings'

function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: 'var(--white)', padding: '60px 0' }}>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 28, letterSpacing: '.1em', marginBottom: 10 }}>Lumia</div>
          <p style={{ fontSize: 12, color: 'rgba(255,253,248,.5)', maxWidth: 260, lineHeight: 1.7 }}>
            Hand-poured in small batches.<br />Made with a premium coconut-soy wax blend.
          </p>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 36px' }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/shop/candles', label: 'Shop Candles' },
            { href: '/shop/stickers', label: 'Shop Stickers' },
            { href: '/about', label: 'About Us' },
            { href: '/contact', label: 'Contact' },
          ].map(n => (
            <a key={n.href} href={n.href} style={{
              fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase',
              color: 'rgba(255,253,248,.55)', fontWeight: 500, textDecoration: 'none',
            }}>{n.label}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="mailto:lumiacandles@gmail.com" style={{ fontSize: 11, color: 'rgba(255,253,248,.55)', textDecoration: 'none' }}>lumiacandles@gmail.com</a>
          <a href="https://instagram.com/lumiacandles" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'rgba(255,253,248,.55)', textDecoration: 'none' }}>Instagram · @lumiacandles</a>
          <a href="https://tiktok.com/@lumiacandles" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'rgba(255,253,248,.55)', textDecoration: 'none' }}>TikTok · @lumiacandles</a>
        </div>
      </div>
      <div className="wrap" style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,253,248,.1)', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,253,248,.3)' }}>© 2026 Lumia. All rights reserved.</p>
      </div>
    </footer>
  )
}

function StorefrontLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const navigate = useNavigate()
  const settings = useSettings()

  useEffect(() => {
    if (settings.accent) document.documentElement.style.setProperty('--gold', settings.accent)
  }, [settings.accent])

  const handleCheckout = () => {
    setCartOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      <Header onCartOpen={() => setCartOpen(true)} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
    </>
  )
}

function DashboardApp() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/products" element={<AdminProducts />} />
        <Route path="/orders" element={<AdminOrders />} />
        <Route path="/messages" element={<AdminMessages />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function StoreApp() {
  return (
    <Routes>
      {/* Storefront */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop/candles" element={<ShopCandlesPage />} />
        <Route path="/shop/candles/:id" element={<ProductPage />} />
        <Route path="/shop/stickers" element={<ShopStickersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/success" element={<OrderSuccessPage />} />
      </Route>

      {/* Admin (also reachable at /admin on the main domain / localhost) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      {isDashboardHost ? <DashboardApp /> : <StoreApp />}
    </BrowserRouter>
  )
}
