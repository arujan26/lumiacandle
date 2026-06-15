import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

/**
 * Called by the order-success page with the Stripe session id. Retrieves the
 * paid session, stores the order in lumia_orders (deduped by session id), and
 * emails the customer a confirmation. Avoids needing a Stripe webhook.
 */
export default async (req: Request) => {
  const url = new URL(req.url)
  const sessionId = url.searchParams.get('session_id') || ''
  if (!sessionId) return json({ error: 'Missing session_id' }, 400)

  const secret = process.env.STRIPE_SECRET_KEY
  const supaUrl = process.env.VITE_SUPABASE_URL
  const supaKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!secret || !supaUrl || !supaKey) return json({ error: 'Server not configured' }, 500)

  const stripe = new Stripe(secret)

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Could not retrieve session' }, 400)
  }

  if (session.payment_status !== 'paid') {
    return json({ ok: false, pending: true }, 200)
  }

  const cd = session.customer_details
  const ship = (session as unknown as { collected_information?: { shipping_details?: { address?: Stripe.Address; name?: string } } })
    .collected_information?.shipping_details
  const addr = ship?.address || cd?.address || ({} as Stripe.Address)

  const items = (session.line_items?.data || []).map(li => ({
    product_name: li.description,
    quantity: li.quantity || 1,
    unit_price: (li.price?.unit_amount || 0) / 100,
  }))

  const order = {
    stripe_session_id: session.id,
    name: ship?.name || cd?.name || null,
    email: cd?.email || null,
    phone: cd?.phone || null,
    address: addr.line1 ? `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}` : null,
    city: addr.city || null,
    state: addr.state || null,
    zip: addr.postal_code || null,
    country: addr.country || null,
    items,
    subtotal: (session.amount_subtotal || 0) / 100,
    amount_total: (session.amount_total || 0) / 100,
    status: 'paid',
    preferred_contact: 'Email',
  }

  const supabase = createClient(supaUrl, supaKey)
  const { error: dbErr } = await supabase
    .from('lumia_orders')
    .upsert(order, { onConflict: 'stripe_session_id', ignoreDuplicates: true })
  if (dbErr) return json({ error: dbErr.message }, 500)

  // Confirmation email (best-effort)
  if (order.email && process.env.RESEND_API_KEY) {
    try {
      const from = process.env.RESEND_FROM || 'Lumia Candles <onboarding@resend.dev>'
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from, to: order.email, subject: 'Lumia — Order confirmed',
          html: confirmationHtml(order.name || 'there', items, order.amount_total),
        }),
      })
    } catch { /* ignore email failure */ }
  }

  return json({ ok: true }, 200)
}

function confirmationHtml(name: string, items: { product_name: string | null; quantity: number }[], total: number) {
  const rows = items.map(i => `<tr><td style="padding:6px 0;color:#5c4130">${esc(i.product_name || 'Item')} × ${i.quantity}</td></tr>`).join('')
  return `<div style="background:#fbf8f2;padding:40px 0;font-family:Helvetica,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#fffdf8;border:1px solid #ece3d5">
      <div style="background:#1a1410;color:#fffdf8;padding:24px;text-align:center;letter-spacing:.18em;font-size:18px">LUMIA</div>
      <div style="padding:36px 32px">
        <p style="font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#b8945a;margin:0 0 12px">Order confirmed</p>
        <h1 style="font-family:Georgia,serif;font-weight:400;font-size:30px;color:#1a1410;margin:0 0 18px">Thank you, ${esc(name)}.</h1>
        <p style="font-size:15px;line-height:1.7;color:#5c4130;margin:0 0 20px">Your payment went through and your candles are being hand-poured and packed.</p>
        <table style="width:100%;border-top:1px solid #ece3d5;border-bottom:1px solid #ece3d5;margin:0 0 16px">${rows}</table>
        <p style="font-family:Georgia,serif;font-size:22px;color:#1a1410;margin:0">Total: $${total}</p>
      </div>
      <div style="padding:20px 32px;border-top:1px solid #ece3d5;text-align:center;font-size:11px;color:#a89888">Hand-poured in small batches · lumiacandle.com</div>
    </div></div>`
}
function esc(s: string) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)) }
function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })
}
