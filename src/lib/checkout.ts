import { cart } from './cart'

/**
 * Requests an embedded Stripe Checkout session for the current cart and returns
 * its client secret. The payment form (Apple Pay / Google Pay included) is then
 * rendered ON our own page via <EmbeddedCheckout> — the customer never leaves.
 */
export async function fetchCheckoutClientSecret(): Promise<string> {
  const items = cart.getItems().map(i => ({ id: i.product.id, quantity: i.quantity }))
  if (items.length === 0) throw new Error('Your cart is empty.')

  const res = await fetch('/.netlify/functions/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.clientSecret) {
    throw new Error(data.error || 'Could not start checkout. Please try again.')
  }
  return data.clientSecret as string
}
