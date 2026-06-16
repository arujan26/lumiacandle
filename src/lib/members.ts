import { supabase } from './supabase'

export interface Member {
  user_id: string; email: string | null; name: string | null
  points: number; streak: number; last_visit: string | null
  birthday: string | null; saved_affirmations: string[]; mood_today: string | null
}

export interface Tier { id: string; name: string; min: number; color: string; accent: string; perk: string }

export const TIERS: Tier[] = [
  { id: 'pearl', name: 'Pearl', min: 0, color: '#ECE7E1', accent: '#A89E94', perk: 'Welcome to the club' },
  { id: 'rose', name: 'Rose', min: 250, color: '#F4DADE', accent: '#C68692', perk: 'Early access to launches' },
  { id: 'rosegold', name: 'Rose Gold', min: 750, color: '#F0CDB4', accent: '#BF8455', perk: 'Birthday gift + exclusives' },
  { id: 'diamond', name: 'Diamond', min: 1500, color: '#D9E5EE', accent: '#7B9AB4', perk: 'Secret collections · 2× points' },
  { id: 'elite', name: 'Elite Muse', min: 3000, color: '#E6D4EA', accent: '#8B5F97', perk: 'Everything · private concierge' },
]

export function tierForPoints(p: number): { tier: Tier; next: Tier | null; progress: number } {
  let idx = 0
  for (let i = 0; i < TIERS.length; i++) if (p >= TIERS[i].min) idx = i
  const tier = TIERS[idx]
  const next = TIERS[idx + 1] ?? null
  const progress = next ? Math.min(1, (p - tier.min) / (next.min - tier.min)) : 1
  return { tier, next, progress }
}

const today = () => new Date().toISOString().slice(0, 10)
const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)

/** Loads the member, awarding daily-login points + streak once per day. */
export async function loadMember(userId: string, email: string, name: string): Promise<Member> {
  const { data } = await supabase.from('lumia_members').select('*').eq('user_id', userId).maybeSingle()
  const t = today()
  if (!data) {
    const row = { user_id: userId, email, name, points: 20, streak: 1, last_visit: t }
    await supabase.from('lumia_members').insert(row)
    return { ...row, birthday: null, saved_affirmations: [], mood_today: null }
  }
  const m = data as Member
  if (m.last_visit !== t) {
    const gap = m.last_visit ? daysBetween(m.last_visit, t) : 99
    const streak = gap === 1 ? m.streak + 1 : 1
    const points = m.points + 10
    await supabase.from('lumia_members').update({ streak, points, last_visit: t, updated_at: new Date().toISOString() }).eq('user_id', userId)
    return { ...m, streak, points, last_visit: t }
  }
  return m
}

export async function addPoints(userId: string, current: number, delta: number): Promise<number> {
  const points = current + delta
  await supabase.from('lumia_members').update({ points, updated_at: new Date().toISOString() }).eq('user_id', userId)
  return points
}

export async function setMood(userId: string, mood: string) {
  await supabase.from('lumia_members').update({ mood_today: mood }).eq('user_id', userId)
}

export async function toggleSavedAffirmation(userId: string, text: string, current: string[]): Promise<string[]> {
  const next = current.includes(text) ? current.filter(x => x !== text) : [...current, text]
  await supabase.from('lumia_members').update({ saved_affirmations: next }).eq('user_id', userId)
  return next
}
