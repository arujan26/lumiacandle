import { supabase } from './supabase'

export interface OrderItem {
  product_id?: string
  product_name?: string
  fragrance?: string
  quantity: number
  unit_price?: number
}

export interface AdminOrder {
  id: string
  created_at: string
  name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  notes: string | null
  items: OrderItem[] | null
  subtotal: number | null
  amount_total: number | null
  status: string | null
  tracking_code: string | null
  stripe_session_id: string | null
}

export const ORDER_STATUSES = ['paid', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

export async function adminListOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from('lumia_orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AdminOrder[]
}

export async function adminUpdateOrder(
  id: string,
  patch: Partial<Pick<AdminOrder, 'status' | 'tracking_code'>>,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_orders').update(patch).eq('id', id)
  return { error: error?.message ?? null }
}

/** Sends an order-update email to the customer via the Resend serverless function. */
export async function sendOrderUpdateEmail(payload: {
  to: string
  customerName: string
  status: string
  trackingCode?: string
  orderId: string
}): Promise<{ error: string | null }> {
  try {
    const res = await fetch('/.netlify/functions/send-order-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { error: data.error || 'Failed to send email' }
    return { error: null }
  } catch {
    return { error: 'Network error' }
  }
}
