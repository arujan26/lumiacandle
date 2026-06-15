import { createClient } from '@supabase/supabase-js'

/**
 * Buys the cheapest USPS label for an order via Shippo and returns the tracking
 * number + label PDF url. ADMIN ONLY — verifies the caller's Supabase JWT is an
 * allowlisted admin before spending money on a label.
 */

function parcelFor(qty: number) {
  const weight = qty * 16 + 4
  if (qty <= 1) return { length: 5, width: 5, height: 5, weight }
  if (qty <= 2) return { length: 8, width: 5, height: 5, weight }
  if (qty <= 4) return { length: 9, width: 7, height: 5, weight }
  return { length: 12, width: 9, height: 6, weight }
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  const token = process.env.SHIPPO_API_TOKEN
  const supaUrl = process.env.VITE_SUPABASE_URL
  const supaKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!token || !supaUrl || !supaKey) return json({ error: 'Server not configured' }, 500)

  // --- Admin auth ---
  const jwt = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!jwt) return json({ error: 'Unauthorized' }, 401)
  const supabase = createClient(supaUrl, supaKey, { global: { headers: { Authorization: `Bearer ${jwt}` } } })
  const { data: isAdmin } = await supabase.rpc('lumia_is_admin')
  if (isAdmin !== true) return json({ error: 'Forbidden' }, 403)

  let body: { address?: Record<string, string>; items?: { quantity: number }[] }
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }
  const a = body.address || {}
  if (!a.zip || !a.street1 || !a.city || !a.state) return json({ error: 'Order has no shipping address' }, 400)
  const qty = (body.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 1

  const shipFrom = {
    name: process.env.SHIP_FROM_NAME || 'Lumia Candles',
    street1: process.env.SHIP_FROM_STREET1 || '',
    city: process.env.SHIP_FROM_CITY || '',
    state: process.env.SHIP_FROM_STATE || '',
    zip: process.env.SHIP_FROM_ZIP || '',
    country: 'US',
    phone: process.env.SHIP_FROM_PHONE || '',
  }

  const headers = { Authorization: `ShippoToken ${token}`, 'Content-Type': 'application/json' }

  try {
    // 1) Create shipment to get rates
    const shipRes = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST', headers,
      body: JSON.stringify({
        address_from: shipFrom,
        address_to: {
          name: a.name || 'Customer', street1: a.street1, street2: a.street2 || '',
          city: a.city, state: a.state, zip: a.zip, country: 'US', phone: a.phone || '',
        },
        parcels: [{ ...parcelFor(qty), distance_unit: 'in', mass_unit: 'oz' }],
        async: false,
      }),
    })
    const ship = await shipRes.json()
    if (!shipRes.ok) return json({ error: ship?.detail || 'Shippo shipment failed', detail: ship }, 502)

    type ShippoRate = { object_id: string; amount: string; provider: string }
    const usps = (ship.rates as ShippoRate[] || [])
      .filter(r => r.provider === 'USPS')
      .sort((x, y) => Number(x.amount) - Number(y.amount))
    if (usps.length === 0) return json({ error: 'No USPS rate available' }, 502)

    // 2) Buy the cheapest
    const txRes = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST', headers,
      body: JSON.stringify({ rate: usps[0].object_id, label_file_type: 'PDF', async: false }),
    })
    const tx = await txRes.json()
    if (!txRes.ok || tx.status !== 'SUCCESS') {
      return json({ error: tx?.messages?.[0]?.text || 'Label purchase failed', detail: tx }, 502)
    }

    return json({
      tracking_number: tx.tracking_number,
      tracking_url: tx.tracking_url_provider,
      label_url: tx.label_url,
      cost: Number(usps[0].amount),
    }, 200)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Label purchase error' }, 500)
  }
}

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })
}
