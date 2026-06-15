/**
 * Live shipping rates via Shippo. Given the customer's address + cart quantity,
 * returns real USPS rate options to show at checkout.
 */

function parcelFor(qty: number) {
  const weight = qty * 16 + 4 // oz: ~1 lb per candle + packaging
  if (qty <= 1) return { length: 5, width: 5, height: 5, weight }
  if (qty <= 2) return { length: 8, width: 5, height: 5, weight }
  if (qty <= 4) return { length: 9, width: 7, height: 5, weight }
  return { length: 12, width: 9, height: 6, weight }
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
  if (!a.zip || !a.street1 || !a.city || !a.state) {
    return json({ error: 'Incomplete address' }, 400)
  }
  const qty = (body.items || []).reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 1

  const payload = {
    address_from: shipFrom(),
    address_to: {
      name: a.name || 'Customer',
      street1: a.street1,
      street2: a.street2 || '',
      city: a.city,
      state: a.state,
      zip: a.zip,
      country: 'US',
      phone: a.phone || '',
      email: a.email || '',
    },
    parcels: [{ ...parcelFor(qty), distance_unit: 'in', mass_unit: 'oz' }],
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

    type ShippoRate = { object_id: string; amount: string; currency: string; provider: string; estimated_days?: number; servicelevel?: { name?: string } }
    const rates = (data.rates as ShippoRate[] || [])
      .filter(r => r.provider === 'USPS')
      .map(r => ({
        rate_id: r.object_id,
        service: r.servicelevel?.name || r.provider,
        amount: Number(r.amount),
        days: r.estimated_days ?? null,
      }))
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
