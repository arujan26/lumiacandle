import { cart } from './cart'

/**
 * Starts a real Stripe Checkout session (Apple Pay / Google Pay supported) and
 * redirects the browser to Stripe's hosted payment page.
 * Requires STRIPE_SECRET_KEY set in the Netlify environment.
 */
export async function startCheckout(): Promise<{ ok: boolean; error?: string }> {
  const items = cart.getItems().map(i => ({ id: i.product.id, quantity: i.quantity }))
  if (items.length === 0) return { ok: false, error: 'Your cart is empty.' }

  try {
    const res = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.url) {
      return { ok: false, error: data.error || 'Could not start checkout. Please try again.' }
    }
    window.location.href = data.url
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error. Please try again.' }
  }
}
