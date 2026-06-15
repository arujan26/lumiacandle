import { createClient } from '@supabase/supabase-js'

/** Emails the shop inbox when a new contact message arrives (best-effort). */
export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
  const key = process.env.RESEND_API_KEY
  if (!key) return json({ ok: false, skipped: 'no RESEND_API_KEY' }, 200)

  let body: { name?: string; email?: string; message?: string }
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  // Resolve the destination inbox from settings (fallback to a default)
  let to = 'contact@lumiacandle.com'
  try {
    const supaUrl = process.env.VITE_SUPABASE_URL
    const supaKey = process.env.VITE_SUPABASE_ANON_KEY
    if (supaUrl && supaKey) {
      const supabase = createClient(supaUrl, supaKey)
      const { data } = await supabase.from('lumia_settings').select('value').eq('key', 'contact_email').single()
      if (data?.value) to = data.value
    }
  } catch { /* keep default */ }

  const from = process.env.RESEND_FROM || 'Lumia Website <onboarding@resend.dev>'
  const html = `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto">
      <h2 style="font-family:Georgia,serif;color:#1a1410">New message from the website</h2>
      <p style="color:#5c4130"><strong>Name:</strong> ${esc(body.name || '')}</p>
      <p style="color:#5c4130"><strong>Email:</strong> ${esc(body.email || '')}</p>
      <p style="color:#5c4130;white-space:pre-wrap;border-left:3px solid #b8945a;padding-left:14px">${esc(body.message || '')}</p>
      <p style="color:#a89888;font-size:12px">See all messages in your dashboard.</p>
    </div>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, reply_to: body.email || undefined, subject: `New contact: ${body.name || 'Website'}`, html }),
    })
    const data = await res.json().catch(() => ({}))
    return json({ ok: res.ok, id: data?.id }, 200)
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : 'send failed' }, 200)
  }
}

function esc(s: string) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)) }
function json(obj: unknown, status: number) { return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } }) }
