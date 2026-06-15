import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type Settings = Record<string, string>

const DEFAULTS: Settings = {
  hero_home: '/hero.webp',
  hero_shop_candles: '/shop-candles-hero.webp',
  hero_shop_stickers: '/shop-stickers-hero.webp',
  hero_about: '',
  hero_contact: '',
  announcement: 'Hand-poured in small batches  ·  $35 each  ·  Fast USPS shipping · Ships in 2–5 business days',
  accent: '#b8945a',
  contact_email: 'contact@lumiacandle.com',
  instagram: 'https://instagram.com/lumiacandles',
  tiktok: 'https://tiktok.com/@lumiacandles',
}

let _cache: Settings | null = null
let _promise: Promise<Settings> | null = null

async function fetchSettings(): Promise<Settings> {
  const { data } = await supabase.from('lumia_settings').select('key,value')
  const m: Settings = { ...DEFAULTS }
  for (const r of (data || []) as { key: string; value: string | null }[]) {
    if (r.value != null && r.value !== '') m[r.key] = r.value
  }
  _cache = m
  return m
}

export function loadSettings(force = false): Promise<Settings> {
  if (_cache && !force) return Promise.resolve(_cache)
  if (!_promise || force) _promise = fetchSettings()
  return _promise
}

/** Storefront hook — resolves settings (with bundled defaults as fallback). */
export function useSettings(): Settings {
  const [settings, setSettings] = useState<Settings>(_cache || DEFAULTS)
  useEffect(() => { let on = true; loadSettings().then(s => on && setSettings(s)); return () => { on = false } }, [])
  return settings
}

/** Admin: read every setting fresh (bypasses cache). */
export async function adminLoadSettings(): Promise<Settings> {
  const { data } = await supabase.from('lumia_settings').select('key,value')
  const m: Settings = { ...DEFAULTS }
  for (const r of (data || []) as { key: string; value: string | null }[]) m[r.key] = r.value ?? ''
  return m
}

export async function adminSaveSettings(entries: Settings): Promise<{ error: string | null }> {
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }))
  const { error } = await supabase.from('lumia_settings').upsert(rows)
  if (!error) { _cache = null; _promise = null } // invalidate so storefront refetches
  return { error: error?.message ?? null }
}
