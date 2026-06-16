import { supabase } from './supabase'
import { tierForPoints } from './members'

export interface AdminCustomer {
  email: string
  name: string
  isMember: boolean
  userId: string | null
  points: number
  streak: number
  tierName: string
  tierAccent: string
  vip: boolean
  disabled: boolean
  savedCount: number
  moodToday: string | null
  birthday: string | null
  adminNotes: string | null
  lastActive: string | null
  joined: string | null
  orders: number
  spent: number
}

interface MemberRow {
  user_id: string; email: string | null; name: string | null; points: number; streak: number
  last_visit: string | null; birthday: string | null; saved_affirmations: string[]; mood_today: string | null
  vip: boolean; disabled: boolean; admin_notes: string | null; created_at: string
}
interface OrderRow { email: string | null; name: string | null; amount_total: number | null; subtotal: number | null; status: string | null; created_at: string }

export async function adminListCustomers(): Promise<AdminCustomer[]> {
  const [mR, oR] = await Promise.all([
    supabase.from('lumia_members').select('*'),
    supabase.from('lumia_orders').select('email,name,amount_total,subtotal,status,created_at').order('created_at', { ascending: false }),
  ])
  const members = (mR.data || []) as MemberRow[]
  const orders = (oR.data || []) as OrderRow[]

  const agg = new Map<string, { orders: number; spent: number; last: string; first: string; name: string }>()
  for (const o of orders) {
    const email = (o.email || '').toLowerCase()
    if (!email) continue
    const val = o.status === 'cancelled' ? 0 : Number(o.amount_total ?? o.subtotal ?? 0)
    const a = agg.get(email) || { orders: 0, spent: 0, last: o.created_at, first: o.created_at, name: o.name || '' }
    a.orders += 1; a.spent += val
    if (new Date(o.created_at) > new Date(a.last)) a.last = o.created_at
    if (new Date(o.created_at) < new Date(a.first)) a.first = o.created_at
    if (!a.name && o.name) a.name = o.name
    agg.set(email, a)
  }

  const out: AdminCustomer[] = []
  const seen = new Set<string>()

  for (const m of members) {
    const email = (m.email || '').toLowerCase()
    seen.add(email)
    const o = agg.get(email)
    const t = tierForPoints(m.points)
    out.push({
      email, name: m.name || o?.name || '—', isMember: true, userId: m.user_id,
      points: m.points, streak: m.streak, tierName: t.tier.name, tierAccent: t.tier.accent,
      vip: m.vip, disabled: m.disabled, savedCount: (m.saved_affirmations || []).length, moodToday: m.mood_today,
      birthday: m.birthday, adminNotes: m.admin_notes,
      lastActive: m.last_visit || o?.last || null, joined: m.created_at,
      orders: o?.orders || 0, spent: o?.spent || 0,
    })
  }
  for (const [email, o] of agg) {
    if (seen.has(email)) continue
    out.push({
      email, name: o.name || '—', isMember: false, userId: null,
      points: 0, streak: 0, tierName: 'Guest', tierAccent: '#8A8A94', vip: false, disabled: false,
      savedCount: 0, moodToday: null, birthday: null, adminNotes: null,
      lastActive: o.last, joined: o.first, orders: o.orders, spent: o.spent,
    })
  }
  return out.sort((a, b) => b.spent - a.spent || b.points - a.points)
}

export async function adminUpdateMember(userId: string, patch: Partial<{ points: number; streak: number; vip: boolean; disabled: boolean; admin_notes: string }>): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_members').update({ ...patch, updated_at: new Date().toISOString() }).eq('user_id', userId)
  return { error: error?.message ?? null }
}

export async function adminCustomerOrders(email: string) {
  const { data } = await supabase.from('lumia_orders').select('id,created_at,status,amount_total,subtotal,tracking_code,items').ilike('email', email).order('created_at', { ascending: false })
  return data || []
}
