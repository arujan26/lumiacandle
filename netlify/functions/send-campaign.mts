import { createClient } from '@supabase/supabase-js'

/** Admin-only: sends a marketing email to a list of recipients via Resend. */
export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  const supaUrl = process.env.VITE_SUPABASE_URL
  const supaKey = process.env.VITE_SUPABASE_ANON_KEY
  const resend = process.env.RESEND_API_KEY
  if (!supaUrl || !supaKey) return json({ error: 'Server not configured' }, 500)
  if (!resend) return json({ error: 'Email not configured (RESEND_API_KEY).' }, 500)

  // Verify caller is an admin (their JWT)
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '')
  const supabase = createClient(supaUrl, supaKey, { global: { headers: { Authorization: `Bearer ${token}` } } })
  const { data: isAdmin } = await supabase.rpc('lumia_is_admin')
  if (isAdmin !== true) return json({ error: 'Not authorized' }, 403)

  let body: { recipients?: string[]; subject?: string; bodyText?: string; heading?: string }
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const recipients = [...new Set((body.recipients || []).map(e => (e || '').trim().toLowerCase()).filter(Boolean))]
  if (recipients.length === 0) return json({ error: 'No recipients' }, 400)
  if (!body.subject || !body.bodyText) return json({ error: 'Subject and message required' }, 400)
  if (recipients.length > 500) return json({ error: 'Max 500 recipients per campaign' }, 400)

  const from = process.env.RESEND_FROM || 'Lumia Candles <onboarding@resend.dev>'
  const html = campaignHtml(body.heading || body.subject, body.bodyText)

  let sent = 0
  const errors: string[] = []
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100).map(to => ({ from, to, subject: body.subject as string, html }))
    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resend}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      })
      if (res.ok) { const d = await res.json().catch(() => ({})) as { data?: unknown[] }; sent += (d.data?.length ?? chunk.length) }
      else errors.push((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`)
    } catch (e) { errors.push(e instanceof Error ? e.message : 'send failed') }
  }

  return json({ ok: true, sent, total: recipients.length, errors: errors.slice(0, 3) }, 200)
}

function campaignHtml(heading: string, text: string) {
  const paras = text.split('\n').filter(Boolean).map(p => `<p style="font-size:15px;line-height:1.75;color:#5c4130;margin:0 0 14px">${esc(p)}</p>`).join('')
  return `<div style="background:#fbf8f2;padding:40px 0;font-family:Helvetica,Arial,sans-serif">
    <div style="max-width:540px;margin:0 auto;background:#fffdf8;border:1px solid #ece3d5">
      <div style="background:#1a1410;color:#fffdf8;padding:24px;text-align:center;letter-spacing:.18em;font-size:18px">LUMIA</div>
      <div style="padding:38px 34px">
        <h1 style="font-family:Georgia,serif;font-weight:400;font-size:30px;color:#1a1410;margin:0 0 20px">${esc(heading)}</h1>
        ${paras}
        <a href="https://lumiacandle.com/shop/candles" style="display:inline-block;margin-top:14px;background:#1a1410;color:#fffdf8;text-decoration:none;padding:13px 26px;font-size:11px;letter-spacing:.2em;text-transform:uppercase">Shop now</a>
      </div>
      <div style="padding:20px 34px;border-top:1px solid #ece3d5;text-align:center;font-size:11px;color:#a89888">Hand-poured in small batches · lumiacandle.com</div>
    </div></div>`
}
function esc(s: string) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)) }
function json(obj: unknown, status: number) { return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } }) }
