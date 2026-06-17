import { supabase } from './supabase'

export interface Coupon {
  code: string
  type: 'percent' | 'fixed'
  value: number
  active: boolean
  max_uses: number | null
  used_count: number
  min_subtotal: number
  expires_at: string | null
  description: string | null
  created_at: string
}

export async function adminListCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase.from('lumia_coupons').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Coupon[]
}

export async function adminUpsertCoupon(c: Partial<Coupon> & { code: string }): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_coupons').upsert({ ...c, code: c.code.toUpperCase().trim() })
  return { error: error?.message ?? null }
}

export async function adminDeleteCoupon(code: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_coupons').delete().eq('code', code)
  return { error: error?.message ?? null }
}

/** Validate a code against a cart subtotal (used for the checkout preview). */
export async function validateCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon | null; discount: number; error: string | null }> {
  const c = code.trim().toUpperCase()
  if (!c) return { coupon: null, discount: 0, error: null }
  const { data } = await supabase.from('lumia_coupons').select('*').ilike('code', c).eq('active', true).maybeSingle()
  const coupon = data as Coupon | null
  if (!coupon) return { coupon: null, discount: 0, error: 'Code not found.' }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return { coupon: null, discount: 0, error: 'This code has expired.' }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) return { coupon: null, discount: 0, error: 'This code is no longer available.' }
  if (subtotal < Number(coupon.min_subtotal)) return { coupon: null, discount: 0, error: `Spend $${Number(coupon.min_subtotal)} to use this code.` }
  const discount = coupon.type === 'percent'
    ? Math.round(subtotal * Number(coupon.value)) / 100
    : Math.min(Number(coupon.value), subtotal)
  return { coupon, discount: Math.round(discount * 100) / 100, error: null }
}
