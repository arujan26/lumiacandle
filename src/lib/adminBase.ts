// In production the admin lives on dashboard.lumiacandle.com (root paths).
// On the main domain / localhost it lives under /admin for convenience.
export const isDashboardHost =
  typeof window !== 'undefined' && window.location.hostname.startsWith('dashboard.')

export const ADMIN_HOME = isDashboardHost ? '/' : '/admin'
export const ADMIN_LOGIN = isDashboardHost ? '/login' : '/admin/login'
export const ADMIN_ORDERS = isDashboardHost ? '/orders' : '/admin/orders'
