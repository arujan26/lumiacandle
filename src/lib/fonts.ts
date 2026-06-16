import { supabase } from './supabase'

export type FontStatus = 'draft' | 'active' | 'disabled'
export type FontRole = 'none' | 'global' | 'headings' | 'body' | 'buttons'

export interface FontRow {
  id: string
  name: string
  file_url: string
  family_name: string
  weight: string
  style: string
  category: string
  status: FontStatus
  role: FontRole
  license_type: string | null
  file_size: number | null
  format: string | null
  created_at: string
  updated_at: string
}

const EXT_FORMAT: Record<string, string> = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' }
export const MAX_BYTES = 2 * 1024 * 1024     // 2 MB hard cap (also enforced by the bucket)
export const HEAVY_BYTES = 400 * 1024        // warn above ~400 KB

export const fileExt = (n: string) => (n.split('.').pop() || '').toLowerCase()

/** SECURITY: only real font extensions + size guard. */
export function validateFontFile(file: File): { ok: boolean; error?: string } {
  const ext = fileExt(file.name)
  if (!EXT_FORMAT[ext]) return { ok: false, error: 'Only .woff, .woff2, .ttf or .otf fonts are allowed.' }
  if (file.size === 0) return { ok: false, error: 'The file is empty.' }
  if (file.size > MAX_BYTES) return { ok: false, error: `Too large (${(file.size / 1048576).toFixed(1)} MB). Max is 2 MB.` }
  return { ok: true }
}

/** SECURITY: strip anything that could break out of the CSS @font-face string. */
export function sanitizeFamily(name: string) {
  return (name || '').replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 48) || 'Custom Font'
}

const safeStoredName = (name: string) => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt(name)}`

export function fallbackFor(category: string) {
  switch (category) {
    case 'serif': return 'Georgia, serif'
    case 'mono': return 'ui-monospace, monospace'
    case 'display':
    case 'script': return 'Georgia, serif'
    default: return 'system-ui, -apple-system, sans-serif'
  }
}

export async function uploadFontFile(file: File): Promise<{ url: string; size: number; format: string }> {
  const v = validateFontFile(file)
  if (!v.ok) throw new Error(v.error)
  const path = safeStoredName(file.name)
  const { error } = await supabase.storage.from('lumia-fonts').upload(path, file, {
    cacheControl: '31536000', upsert: false, contentType: file.type || 'application/octet-stream',
  })
  if (error) throw error
  const { data } = supabase.storage.from('lumia-fonts').getPublicUrl(path)
  return { url: data.publicUrl, size: file.size, format: EXT_FORMAT[fileExt(file.name)] }
}

export type FontMeta = Omit<FontRow, 'id' | 'created_at' | 'updated_at'>

export async function insertFont(meta: FontMeta): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_custom_fonts').insert({ ...meta, family_name: sanitizeFamily(meta.family_name) })
  return { error: error?.message ?? null }
}

export async function updateFont(id: string, patch: Partial<FontRow>): Promise<{ error: string | null }> {
  const next = { ...patch, updated_at: new Date().toISOString() }
  if (patch.family_name) next.family_name = sanitizeFamily(patch.family_name)
  const { error } = await supabase.from('lumia_custom_fonts').update(next).eq('id', id)
  return { error: error?.message ?? null }
}

export async function adminListFonts(): Promise<FontRow[]> {
  const { data, error } = await supabase.from('lumia_custom_fonts').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as FontRow[]
}

export async function listActiveFonts(): Promise<FontRow[]> {
  const { data } = await supabase.from('lumia_custom_fonts').select('*').eq('status', 'active')
  return (data || []) as FontRow[]
}

export async function deleteFont(font: FontRow): Promise<{ error: string | null }> {
  const marker = '/lumia-fonts/'
  const path = font.file_url.includes(marker) ? font.file_url.split(marker)[1] : null
  if (path) await supabase.storage.from('lumia-fonts').remove([path])
  const { error } = await supabase.from('lumia_custom_fonts').delete().eq('id', font.id)
  return { error: error?.message ?? null }
}

/** Auto-generated @font-face for one font. */
export function fontFaceCss(f: { family_name: string; file_url: string; format?: string | null; weight?: string; style?: string }) {
  const fam = sanitizeFamily(f.family_name)
  return `@font-face{font-family:'${fam}';src:url('${f.file_url}') format('${f.format || 'woff2'}');font-weight:${f.weight || '400'};font-style:${f.style || 'normal'};font-display:swap;}`
}
