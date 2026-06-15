import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Product } from '../types'
import { PRODUCTS as STATIC_CANDLES } from './products'

export type ProductType = 'candle' | 'sticker'

export interface DbProduct {
  id: string
  type: ProductType
  name: string
  emotion: string | null
  fragrance: string | null
  description: string | null
  long_description: string | null
  for_text: string | null
  price: number
  image_url: string | null
  image_position: string | null
  stock_qty: number | null
  badge: string | null
  burn_time: string | null
  wax: string | null
  size: string | null
  active: boolean
  sort_order: number
}

function rowToProduct(r: DbProduct): Product {
  return {
    id: r.id,
    name: r.name,
    emotion: r.emotion ?? '',
    fragrance: r.fragrance ?? '',
    description: r.description ?? '',
    long_description: r.long_description ?? '',
    price: Number(r.price),
    image_url: r.image_url ?? '',
    image_position: r.image_position || '50% 50%',
    stock_qty: r.stock_qty,
    badge: r.badge ?? undefined,
    burn_time: r.burn_time ?? undefined,
    wax: r.wax ?? undefined,
    size: r.size ?? undefined,
    for_text: r.for_text ?? undefined,
  }
}

/** Storefront: active products of a type, mapped to the Product shape. */
export async function fetchActiveProducts(type: ProductType): Promise<Product[]> {
  const { data, error } = await supabase
    .from('lumia_products')
    .select('*')
    .eq('active', true)
    .eq('type', type)
    .order('sort_order', { ascending: true })
  if (error || !data) throw error || new Error('No data')
  return (data as DbProduct[]).map(rowToProduct)
}

/**
 * Storefront hook. Falls back to the bundled static candles if the DB is
 * unreachable so the shop never renders empty.
 */
export function useProducts(type: ProductType) {
  const [products, setProducts] = useState<Product[]>(type === 'candle' ? STATIC_CANDLES : [])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchActiveProducts(type)
      .then(p => { if (active) { setProducts(p); setLoading(false) } })
      .catch(() => { if (active) setLoading(false) }) // keep fallback
    return () => { active = false }
  }, [type])

  return { products, loading }
}

/* ----------------------------- Admin CRUD ----------------------------- */

export async function adminListProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from('lumia_products')
    .select('*')
    .order('type', { ascending: true })
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as DbProduct[]
}

export type ProductInput = Omit<DbProduct, never>

export async function adminUpsertProduct(p: DbProduct): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_products').upsert({
    id: p.id,
    type: p.type,
    name: p.name,
    emotion: p.emotion,
    fragrance: p.fragrance,
    description: p.description,
    long_description: p.long_description,
    for_text: p.for_text,
    price: p.price,
    image_url: p.image_url,
    image_position: p.image_position,
    stock_qty: p.stock_qty,
    badge: p.badge,
    burn_time: p.burn_time,
    wax: p.wax,
    size: p.size,
    active: p.active,
    sort_order: p.sort_order,
  })
  return { error: error?.message ?? null }
}

export async function adminDeleteProduct(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_products').delete().eq('id', id)
  return { error: error?.message ?? null }
}

/** Uploads an image to the public product bucket and returns its public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from('lumia-products').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('lumia-products').getPublicUrl(path)
  return data.publicUrl
}

export function emptyProduct(type: ProductType): DbProduct {
  return {
    id: '',
    type,
    name: '',
    emotion: '',
    fragrance: '',
    description: '',
    long_description: '',
    for_text: '',
    price: 35,
    image_url: '',
    image_position: '50% 50%',
    stock_qty: null,
    badge: '',
    burn_time: type === 'candle' ? '35–45 hrs' : '',
    wax: type === 'candle' ? 'Coconut-Soy Wax Blend' : '',
    size: type === 'candle' ? '7 oz / 198g' : '',
    active: true,
    sort_order: 99,
  }
}
