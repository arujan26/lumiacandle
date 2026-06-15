import { createClient } from '@supabase/supabase-js'

/**
 * Live shipping rates via Shippo. Parcel weight is the sum of each item's real
 * weight (from lumia_products.weight_oz) so candles and light stickers are
 * priced correctly.
 */

async function totalWeightOz(items: { id: string; quantity: number }[]): Promise<number> {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  let weights: Record<string, number> = {}
  if (url && key) {
    const supabase = createClient(url, key)
    const { data } = await supabase.from('lumia_products').select('id,weight_oz').eq('active', true)
    for (const p of (data || []) as { id: string; weight_oz: number }[]) weights[p.id] = Number(p.weight_oz)
  }
  let oz = 2 // packaging
  for (const it of items) oz += (weights[it.id] ?? 16) * (Number(it.quantity) || 1)
  return oz
}

function parcelForWeight(oz: number) {
  if (oz <= 5) return { length: 6, width: 4, height: 1, weight: oz }   // flat mailer (stickers)
  if (oz <= 20) return { length: 6, width: 6, height: 5, weight: oz }
  if (oz <= 40) return { length: 9, width: 7, height: 5, weight: oz }
  return { length: 12, width: 9, height: 6, weight: oz }
}

function shipFrom() {
  return {
    name: process.env.SHIP_FROM_NAME || 'Lumia Candles',
    street1: process.env.SHIP_FROM_STREET1 || '',
    city: process.env.SHIP_FROM_CITY || '',
    state: process.env.SHIP_FROM_STATE || '',
    zip: process.env.SHIP_FROM_ZIP || '',
    country: 'US',
    phone: process.env.SHIP_FROM_PHONE || '',
  }
}

export default async (req: Request) => {
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)
  const token = process.env.SHIPPO_API_TOKEN
  if (!token) return json({ error: 'Shipping not configured (SHIPPO_API_TOKEN missing).' }, 500)

  let body: { address?: Record<string, string>; items?: { id: string; quantity: number }[] }
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const a = body.address || {}
  if (!a.zip || !a.street1 || !a.city || !a.state) return json({ error: 'Incomplete address' }, 400)
  const items = body.items || []
  const oz = await totalWeightOz(items)

  const payload = {
    address_from: shipFrom(),
    address_to: {
      name: a.name || 'Customer', street1: a.street1, street2: a.street2 || '',
      city: a.city, state: a.state, zip: a.zip, country: 'US', phone: a.phone || '', email: a.email || '',
    },
    parcels: [{ ...parcelForWeight(oz), distance_unit: 'in', mass_unit: 'oz' }],
    async: false,
  }

  try {
    const res = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: { Authorization: `ShippoToken ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) return json({ error: data?.detail || 'Shippo error', detail: data }, 502)

    type ShippoRate = { object_id: string; amount: string; provider: string; estimated_days?: number; servicelevel?: { name?: string } }
    const rates = (data.rates as ShippoRate[] || [])
      .filter(r => r.provider === 'USPS')
      .map(r => ({ rate_id: r.object_id, service: r.servicelevel?.name || r.provider, amount: Number(r.amount), days: r.estimated_days ?? null }))
      .sort((x, y) => x.amount - y.amount)

    if (rates.length === 0) return json({ error: 'No rates available for this address.' }, 502)
    return json({ rates }, 200)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Rate request failed' }, 500)
  }
}

function json(obj: unknown, status: number) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })
}
