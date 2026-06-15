import Stripe from 'stripe'

/**
 * Creates an embedded Stripe Checkout Session.
 * Product prices are resolved server-side from CATALOG; the shipping amount is
 * re-fetched from Shippo by rate_id (so a client can't tamper with either).
 * The shipping address is collected on our own page (for live rates) and passed
 * here, then stored in session metadata for the order record.
 */

type CatalogItem = { name: string; price: number; image: string }

const CATALOG: Record<string, CatalogItem> = {
  'let-go': { name: 'Let Go', price: 35, image: '/products/let-go.webp' },
  'im-safe': { name: "I'm Safe", price: 35, image: '/products/im-safe.webp' },
  'you-are-enough': { name: 'You Are Enough', price: 35, image: '/products/you-are-enough.webp' },
  'new-beginning': { name: 'New Beginning', price: 35, image: '/products/new-beginning.webp' },
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

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) return json({ error: 'Stripe not configured.' }, 500)

  let body: {
    items?: { id: string; quantity: number }[]
    rate_id?: string
    address?: Record<string, string>
  }
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON body' }, 400) }

  const items = Array.isArray(body.items) ? body.items : []
  if (items.length === 0) return json({ error: 'Cart is empty' }, 400)

  const a = body.address || {}
  if (!a.zip || !a.street1 || !a.city || !a.state) return json({ error: 'Incomplete shipping address' }, 400)
  if (!body.rate_id) return json({ error: 'No shipping rate selected' }, 400)

  const rate = await getShippoRate(body.rate_id)
  if (!rate) return json({ error: 'Shipping rate expired. Please re-select.' }, 400)

  const origin = process.env.URL || req.headers.get('origin') || 'https://lumiacandle.com'
  const stripe = new Stripe(secret)

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  for (const it of items) {
    const product = CATALOG[it.id]
    const qty = Math.max(1, Math.min(99, Math.floor(Number(it.quantity) || 1)))
    if (!product) continue
    line_items.push({
      quantity: qty,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(product.price * 100),
        product_data: { name: product.name, images: [origin + product.image] },
      },
    })
  }
  if (line_items.length === 0) return json({ error: 'No valid items' }, 400)

  // Shipping as a line item (address already collected on our page)
  line_items.push({
    quantity: 1,
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(rate.amount * 100),
      product_data: { name: `Shipping — ${rate.service}` },
    },
  })

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'embedded_page' as 'embedded',
      line_items,
      billing_address_collection: 'auto',
      customer_email: a.email || undefined,
      metadata: {
        ship_name: a.name || '',
        ship_phone: a.phone || '',
        ship_street1: a.street1 || '',
        ship_street2: a.street2 || '',
        ship_city: a.city || '',
        ship_state: a.state || '',
        ship_zip: a.zip || '',
        ship_country: 'US',
        ship_service: rate.service,
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
