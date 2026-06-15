import Stripe from 'stripe'

/**
 * Creates a Stripe Checkout Session for the current cart.
 * Apple Pay / Google Pay appear automatically on Stripe Checkout once the
 * domain is registered with Stripe (Checkout handles wallet display natively).
 *
 * Prices are resolved SERVER-SIDE from the catalog below so a client cannot
 * tamper with amounts. (This will later be sourced from the Supabase
 * `lumia_products` table once the admin panel is wired up.)
 */

type CatalogItem = { name: string; price: number; image: string }

const CATALOG: Record<string, CatalogItem> = {
  'let-go': { name: 'Let Go', price: 35, image: '/products/let-go.webp' },
  'im-safe': { name: "I'm Safe", price: 35, image: '/products/im-safe.webp' },
  'you-are-enough': { name: 'You Are Enough', price: 35, image: '/products/you-are-enough.webp' },
  'new-beginning': { name: 'New Beginning', price: 35, image: '/products/new-beginning.webp' },
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    return new Response(
      JSON.stringify({ error: 'Stripe not configured. Set STRIPE_SECRET_KEY in Netlify env.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let body: { items?: { id: string; quantity: number }[] }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const items = Array.isArray(body.items) ? body.items : []
  if (items.length === 0) {
    return new Response(JSON.stringify({ error: 'Cart is empty' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Resolve origin for redirect URLs (Netlify sets URL; fall back to request origin)
  const origin = process.env.URL || req.headers.get('origin') || 'https://lumiacandles.com'

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
        product_data: {
          name: product.name,
          images: [origin + product.image],
        },
      },
    })
  }

  if (line_items.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid items' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'embedded', // renders the payment form INSIDE our own page
      line_items,
      // Wallets (Apple Pay / Google Pay) are shown automatically by Checkout.
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'BR', 'PT'],
      },
      phone_number_collection: { enabled: true },
      return_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    })

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
