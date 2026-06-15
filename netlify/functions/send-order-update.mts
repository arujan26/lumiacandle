/**
 * Sends a branded order-update email to a customer via Resend.
 * Requires RESEND_API_KEY. From-address uses RESEND_FROM if set, otherwise the
 * Resend onboarding sender (works for testing; verify lumiacandle.com in Resend
 * to send from orders@lumiacandle.com in production).
 */

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  paid: { title: 'Order confirmed', body: 'Thank you! We received your payment and your candles are being prepared.' },
  processing: { title: 'Your order is being prepared', body: 'We are hand-pouring and packing your order with care.' },
  shipped: { title: 'Your order has shipped', body: 'Good news — your Lumia order is on its way to you.' },
  delivered: { title: 'Your order was delivered', body: 'Your candles have arrived. We hope you love them.' },
  cancelled: { title: 'Your order was cancelled', body: 'Your order has been cancelled. Reach out if you have any questions.' },
}

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const key = process.env.RESEND_API_KEY
  if (!key) {
    return json({ error: 'Email not configured (RESEND_API_KEY missing).' }, 500)
  }

  let body: { to?: string; customerName?: string; status?: string; trackingCode?: string; orderId?: string }
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const to = (body.to || '').trim()
  if (!to) return json({ error: 'Missing recipient email' }, 400)

  const status = (body.status || 'processing').toLowerCase()
  const copy = STATUS_COPY[status] || { title: 'Order update', body: 'There is an update on your order.' }
  const name = body.customerName || 'there'
  const from = process.env.RESEND_FROM || 'Lumia Candles <onboarding@resend.dev>'

  const tracking = body.trackingCode
    ? `<p style="margin:0 0 8px;font-size:13px;color:#7a6a59">Tracking code</p>
       <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:20px;color:#1a1410">${escapeHtml(body.trackingCode)}</p>`
    : ''

  const html = `
  <div style="background:#fbf8f2;padding:40px 0;font-family:Helvetica,Arial,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#fffdf8;border:1px solid #ece3d5">
      <div style="background:#1a1410;color:#fffdf8;padding:24px 32px;text-align:center;letter-spacing:.18em;font-size:18px">LUMIA</div>
      <div style="padding:36px 32px">
        <p style="font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#b8945a;margin:0 0 12px">${escapeHtml(copy.title)}</p>
        <h1 style="font-family:Georgia,serif;font-weight:400;font-size:30px;color:#1a1410;margin:0 0 18px">Hi ${escapeHtml(name)},</h1>
        <p style="font-size:15px;line-height:1.7;color:#5c4130;margin:0 0 24px">${escapeHtml(copy.body)}</p>
        ${tracking}
        <p style="font-size:13px;color:#7a6a59;margin:24px 0 0">Order ${escapeHtml((body.orderId || '').slice(0, 8))}</p>
      </div>
      <div style="padding:20px 32px;border-top:1px solid #ece3d5;text-align:center;font-size:11px;color:#a89888">
        Hand-poured in small batches · lumiacandle.com
      </div>
    </div>
  </div>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject: `Lumia — ${copy.title}`, html }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return json({ error: data?.message || 'Resend error', detail: data }, 502)
    return json({ ok: true, id: data?.id }, 200)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Send failed' }, 500)
  }
}

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}
