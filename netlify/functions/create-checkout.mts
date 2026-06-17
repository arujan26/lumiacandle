import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

/**
 * Creates an embedded Stripe Checkout Session.
 * Product names/prices/images are resolved SERVER-SIDE from lumia_products so a
 * client can't tamper. Shipping amount is re-fetched from Shippo by rate_id.
 * The shipping address (collected on our page for live rates) is stored in
 * session metadata for the order record.
 */

interface DbProduct { id: string; name: string; price: number; image_url: string | null }

async function fetchProducts(): Promise<Record<string, DbProduct>> {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return {}
  const supabase = createClient(url, key)
  const { data } = await supabase.from('lumia_products').select('id,name,price,image_url').eq('active', true)
  const map: Record<string, DbProduct> = {}
  for (const p of (data || []) as DbProduct[]) map[p.id] = { ...p, price: Number(p.price) }
  return map
}

async function getShippoRate(rateId: string): Promise<{ amount: number; service: string } | null> {
  const token = process.env.SHIPPO_API_TOKEN
  if (!token) return null
  const res = await fetch(`https://api.goshippo.com/rates/${rateId}`, {
    headers: { Authorization: `ShippoToken ${token}` },
  })
  if (!res.ok) return null
  const r = await res.json() as { amount?: string; servicelevel?: { name?: string } }
  if (!r.amount) return null
  return { amount: Number(r.amount), service: r.servicelevel?.name || 'USPS' }
}

interface CouponRow { code: string; type: string; value: number; max_uses: number | null; used_count: number; min_subtotal: number; expires_at: string | null }
async function fetchCoupon(code: string): Promise<CouponRow | null> {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const supabase = createClient(url, key)
  const { data } = await supabase.from('lumia_coupons').select('*').ilike('code', code.trim().toUpperCase()).eq('active', true).maybeSingle()
  return (data as CouponRow) || null
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return json({ error: 'Stripe not configured.' }, 500)

  let body: { items?: { id: string; quantity: number }[]; rate_id?: string; address?: Record<string, string>; coupon?: string }
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON body' }, 400) }

  const items = Array.isArray(body.items) ? body.items : []
  if (items.length === 0) return json({ error: 'Cart is empty' }, 400)

  const a = body.address || {}
  if (!a.zip || !a.street1 || !a.city || !a.state) return json({ error: 'Incomplete shipping address' }, 400)
  if (!body.rate_id) return json({ error: 'No shipping rate selected' }, 400)

  const rate = await getShippoRate(body.rate_id)
  if (!rate) return json({ error: 'Shipping rate expired. Please re-select.' }, 400)

  const origin = process.env.URL || req.headers.get('origin') || 'https://lumiacandle.com'
  const products = await fetchProducts()
  const stripe = new Stripe(secret)

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  let subtotal = 0
  for (const it of items) {
    const p = products[it.id]
    const qty = Math.max(1, Math.min(99, Math.floor(Number(it.quantity) || 1)))
    if (!p) continue
    subtotal += p.price * qty
    const img = p.image_url
      ? (p.image_url.startsWith('http') ? p.image_url : origin + p.image_url)
      : undefined
    line_items.push({
      quantity: qty,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(p.price * 100),
        product_data: { name: p.name, ...(img ? { images: [img] } : {}) },
      },
    })
  }
  if (line_items.length === 0) return json({ error: 'No valid items' }, 400)

  line_items.push({
    quantity: 1,
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(rate.amount * 100),
      product_data: { name: `Shipping — ${rate.service}` },
    },
  })

  // Apply a discount coupon if valid
  const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = []
  let appliedCoupon = ''
  if (body.coupon) {
    const c = await fetchCoupon(body.coupon)
    const ok = c && (!c.expires_at || new Date(c.expires_at) > new Date()) && (c.max_uses == null || c.used_count < c.max_uses) && subtotal >= Number(c.min_subtotal)
    if (c && ok) {
      const sc = c.type === 'percent'
        ? await stripe.coupons.create({ percent_off: Math.min(100, Number(c.value)), duration: 'once', name: c.code })
        : await stripe.coupons.create({ amount_off: Math.round(Number(c.value) * 100), currency: 'usd', duration: 'once', name: c.code })
      discounts.push({ coupon: sc.id })
      appliedCoupon = c.code
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'embedded_page' as 'embedded',
      line_items,
      ...(discounts.length ? { discounts } : {}),
      billing_address_collection: 'auto',
      customer_email: a.email || undefined,
      metadata: {
        ship_name: a.name || '', ship_phone: a.phone || '',
        ship_street1: a.street1 || '', ship_street2: a.street2 || '',
        ship_city: a.city || '', ship_state: a.state || '',
        ship_zip: a.zip || '', ship_country: 'US', ship_service: rate.service,
        coupon: appliedCoupon,
      },
      return_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    })
    return json({ clientSecret: session.client_secret }, 200)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Stripe error' }, 500)
  }
}

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })
}
