import { supabase } from './supabase'
import type { Order } from '../types'

export async function submitOrder(order: Order): Promise<{ error: string | null }> {
  const payload = {
    name: order.name,
    email: order.email,
    phone: order.phone || null,
    preferred_contact: order.preferred_contact,
    address: order.address,
    city: order.city,
    state: order.state || null,
    zip: order.zip,
    country: order.country,
    notes: order.notes || null,
    items: order.items.map(i => ({
      product_id: i.product.id,
      product_name: i.product.name,
      fragrance: i.product.fragrance,
      quantity: i.quantity,
      unit_price: i.product.price,
    })),
    subtotal: order.subtotal,
    status: 'pending',
  }

  const { error } = await supabase.from('orders').insert(payload)

  if (error) {
    console.error('Order submission error:', error)
    return { error: error.message }
  }

  return { error: null }
}
