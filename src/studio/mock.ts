import type { IconName } from './icons'

export interface NavItem { id: string; label: string; icon: IconName }

export const NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'builder', label: 'Visual Builder', icon: 'builder' },
  { id: 'theme', label: 'Theme Studio', icon: 'theme' },
  { id: 'products', label: 'Products', icon: 'products' },
  { id: 'orders', label: 'Orders', icon: 'orders' },
  { id: 'messages', label: 'Messages', icon: 'mail' },
  { id: 'settings', label: 'Site Settings', icon: 'settings' },
  { id: 'pages', label: 'Pages', icon: 'pages' },
  { id: 'media', label: 'Media Studio', icon: 'media' },
  { id: 'customers', label: 'Customers', icon: 'customers' },
  { id: 'seo', label: 'SEO Center', icon: 'seo' },
  { id: 'performance', label: 'Performance', icon: 'performance' },
  { id: 'security', label: 'Security', icon: 'security' },
  { id: 'audit', label: 'Audit Log', icon: 'audit' },
]

export const KPIS = [
  { label: 'Revenue · 30d', value: '$4,820', delta: '+12.4%', up: true },
  { label: 'Orders', value: '138', delta: '+8.0%', up: true },
  { label: 'Sessions', value: '2,914', delta: '+5.2%', up: true },
  { label: 'Conversion', value: '4.7%', delta: '-0.3%', up: false },
]

export const REVENUE = [12, 16, 13, 21, 26, 22, 30, 28, 37, 33, 42, 49]
export const REVENUE_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export const ACTIVITY: { icon: IconName; title: string; meta: string; when: string }[] = [
  { icon: 'check', title: 'Order #LM-2207 paid', meta: '$43.75 · USPS Ground', when: '2m' },
  { icon: 'mail', title: 'New message — wholesale', meta: 'boutique@studio.co', when: '18m' },
  { icon: 'products', title: '“Let Go” stock updated', meta: '42 → 38 units', when: '1h' },
  { icon: 'sparkles', title: 'Theme published', meta: 'accent · champagne', when: '3h' },
  { icon: 'orders', title: 'Order #LM-2206 shipped', meta: 'tracking added', when: '5h' },
]

export const TOP_PRODUCTS = [
  { name: 'Let Go', sub: 'Candle · Release', sales: 48, pct: 100 },
  { name: 'You Are Enough', sub: 'Candle · Self-Worth', sales: 39, pct: 81 },
  { name: 'Mango Season', sub: 'Sticker pack', sales: 27, pct: 56 },
  { name: "I'm Safe", sub: 'Candle · Safety', sales: 21, pct: 44 },
]
