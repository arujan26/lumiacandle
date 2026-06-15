import { cart } from './cart'
import { supabase } from './supabase'

export interface ShipAddress {
  name: string
  email: string
  phone: string
  street1: string
  street2: string
  city: string
  state: string
  zip: string
}

export interface Rate {
  rate_id: string
  service: string
  amount: number
  days: number | null
}

function cartItems() {
  return cart.getItems().map(i => ({ id: i.product.id, quantity: i.quantity }))
}

/** Live USPS rates for the entered address. */
export async function fetchRates(address: ShipAddress): Promise<Rate[]> {
  const res = await fetch('/.netlify/functions/shippo-rates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, items: cartItems() }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.rates) throw new Error(data.error || 'Could not get shipping rates.')
  return data.rates as Rate[]
}

/** Creates the embedded Stripe session for the cart + chosen rate, returns the client secret. */
export async function createCheckoutSession(rateId: string, address: ShipAddress): Promise<string> {
  const res = await fetch('/.netlify/functions/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cartItems(), rate_id: rateId, address }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.clientSecret) throw new Error(data.error || 'Could not start checkout.')
  return data.clientSecret as string
}

/** Admin: buy the cheapest USPS label for an order. Sends the admin's JWT. */
export async function buyLabel(address: Partial<ShipAddress>, items: { quantity: number }[]) {
  const { data: sess } = await supabase.auth.getSession()
  const jwt = sess.session?.access_token
  const res = await fetch('/.netlify/functions/shippo-buy-label', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ address, items }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Label purchase failed')
  return data as { tracking_number: string; tracking_url: string; label_url: string; cost: number }
}
