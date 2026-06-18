import { Link } from 'react-router-dom'
import { supabase } from './supabase'
import { useProducts } from './productsApi'

export type BlockType = 'eyebrow' | 'heading' | 'text' | 'image' | 'button' | 'products' | 'gallery' | 'spacer' | 'divider'

export interface Block {
  id: string
  type: BlockType
  props: Record<string, unknown>
  hideMobile?: boolean
  hideDesktop?: boolean
}
export interface PageRow { slug: string; title: string; blocks: Block[]; published: boolean; updated_at?: string }

const uid = () => Math.random().toString(36).slice(2, 9)

export const BLOCK_LIBRARY: { type: BlockType; label: string }[] = [
  { type: 'eyebrow', label: 'Eyebrow' },
  { type: 'heading', label: 'Heading' },
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
  { type: 'button', label: 'Button' },
  { type: 'products', label: 'Product grid' },
  { type: 'gallery', label: 'Gallery' },
  { type: 'divider', label: 'Divider' },
  { type: 'spacer', label: 'Spacer' },
]

export function newBlock(type: BlockType): Block {
  const base = { bg: '', pt: 36, pb: 36, align: 'center', maxWidth: 1180 }
  const byType: Record<BlockType, Record<string, unknown>> = {
    eyebrow: { ...base, pb: 8, text: 'New section', color: '#b8945a' },
    heading: { ...base, pt: 8, text: 'A beautiful heading', level: 'h2', font: 'serif', color: '#1a1410', size: 0 },
    text: { ...base, text: 'Write something lovely here. Click to edit this text.', color: '#7a6a59', size: 16, maxWidth: 620 },
    image: { ...base, src: '', height: 420, fit: 'cover', radius: 0, overlay: 0, maxWidth: 1180 },
    button: { ...base, label: 'Shop now', href: '/shop/candles', variant: 'dark' },
    products: { ...base, kind: 'candle', limit: 4 },
    gallery: { ...base, images: [], columns: 3, radius: 8 },
    divider: { ...base, pt: 8, pb: 8, color: 'rgba(90,65,45,.14)', maxWidth: 1180 },
    spacer: { ...base, pt: 40, pb: 40 },
  }
  return { id: uid(), type, props: byType[type] }
}

/* ----------------------------- Renderer ----------------------------- */

export function Blocks({ blocks, device = 'desktop' }: { blocks: Block[]; device?: 'desktop' | 'mobile' }) {
  return (
    <>
      {blocks.map(b => {
        if (device === 'mobile' && b.hideMobile) return null
        if (device === 'desktop' && b.hideDesktop) return null
        return <BlockView key={b.id} block={b} />
      })}
    </>
  )
}

export function BlockView({ block }: { block: Block }) {
  const p = block.props
  const num = (k: string, d: number) => (typeof p[k] === 'number' ? (p[k] as number) : d)
  const str = (k: string, d = '') => (p[k] != null ? String(p[k]) : d)

  const section: React.CSSProperties = { background: str('bg') || 'transparent', paddingTop: num('pt', 36), paddingBottom: num('pb', 36) }
  const inner: React.CSSProperties = { maxWidth: num('maxWidth', 1180) || '100%', margin: '0 auto', padding: '0 20px', textAlign: (str('align', 'center') as 'left' | 'center' | 'right') }

  let content: React.ReactNode = null
  switch (block.type) {
    case 'eyebrow':
      content = <span style={{ fontSize: num('size', 11), letterSpacing: `${num('tracking', 30) / 100}em`, textTransform: 'uppercase', fontWeight: 600, color: str('color', '#b8945a') }}>{str('text')}</span>
      break
    case 'heading': {
      const Tag = (str('level', 'h2') as 'h1' | 'h2' | 'h3')
      const sz = num('size', 0)
      content = <Tag style={{ fontFamily: str('font', 'serif') === 'serif' ? 'var(--serif)' : 'var(--sans)', color: str('color', '#1a1410'), margin: 0, fontWeight: num('weight', 400), lineHeight: (num('lh', 0) || 105) / 100, letterSpacing: `${num('tracking', -2) / 100}em`, ...(sz ? { fontSize: sz } : {}) }}>{str('text')}</Tag>
      break
    }
    case 'text':
      content = <p style={{ color: str('color', '#7a6a59'), fontSize: num('size', 16), lineHeight: (num('lh', 0) || 175) / 100, fontWeight: num('weight', 300), letterSpacing: `${num('tracking', 0) / 100}em`, maxWidth: num('maxWidth', 620), margin: str('align', 'center') === 'center' ? '0 auto' : 0 }}>{str('text')}</p>
      break
    case 'image':
      content = (
        <div style={{ position: 'relative', width: '100%', height: num('height', 420), borderRadius: num('radius', 0), overflow: 'hidden', background: 'var(--cream)' }}>
          {str('src') && <img src={str('src')} alt="" style={{ width: '100%', height: '100%', objectFit: (str('fit', 'cover') as 'cover' | 'contain'), display: 'block' }} />}
          {num('overlay', 0) > 0 && <div style={{ position: 'absolute', inset: 0, background: `rgba(26,20,16,${num('overlay', 0)})` }} />}
        </div>
      )
      break
    case 'button':
      content = <a href={str('href', '#')} className={`btn btn-${str('variant', 'dark')}`}>{str('label', 'Button')}</a>
      break
    case 'products':
      content = <ProductsBlock kind={str('kind', 'candle') as 'candle' | 'sticker'} limit={num('limit', 4)} />
      break
    case 'gallery':
      content = <Gallery images={(p.images as string[]) || []} columns={num('columns', 3)} radius={num('radius', 8)} />
      break
    case 'divider':
      content = <hr style={{ border: 'none', borderTop: `1px solid ${str('color', 'rgba(90,65,45,.14)')}`, margin: 0 }} />
      break
    case 'spacer':
      content = null
      break
  }

  return <section style={section}><div style={inner}>{content}</div></section>
}

function ProductsBlock({ kind, limit }: { kind: 'candle' | 'sticker'; limit: number }) {
  const { products } = useProducts(kind)
  const list = products.slice(0, limit || 4)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${kind === 'sticker' ? 220 : 240}px, 1fr))`, gap: 24 }}>
      {list.map(p => (
        <Link key={p.id} to={`/shop/${kind === 'sticker' ? 'stickers' : 'candles'}/${p.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ border: '1px solid var(--line)', background: 'var(--white)', overflow: 'hidden' }}>
            <div style={{ aspectRatio: '4/5', background: 'var(--cream)', overflow: 'hidden' }}>
              {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
            </div>
            <div style={{ padding: 18, textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--ink)' }}>{p.name}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--gold)', marginTop: 4 }}>${p.price}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function Gallery({ images, columns, radius }: { images: string[]; columns: number; radius: number }) {
  if (!images.length) return <div style={{ padding: 40, border: '1px dashed var(--line)', color: 'var(--muted)', fontSize: 13 }}>Add images in the gallery block settings.</div>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12 }}>
      {images.map((src, i) => <img key={i} src={src} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: radius, display: 'block' }} />)}
    </div>
  )
}

/* ----------------------------- CRUD ----------------------------- */

export async function adminListPages(): Promise<PageRow[]> {
  const { data } = await supabase.from('lumia_pages').select('*').order('updated_at', { ascending: false })
  return (data || []) as PageRow[]
}
export async function adminGetPage(slug: string): Promise<PageRow | null> {
  const { data } = await supabase.from('lumia_pages').select('*').eq('slug', slug).maybeSingle()
  return (data as PageRow) || null
}
export async function adminSavePage(page: PageRow): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_pages').upsert({ slug: page.slug, title: page.title, blocks: page.blocks, published: page.published, updated_at: new Date().toISOString() })
  return { error: error?.message ?? null }
}
export async function adminDeletePage(slug: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('lumia_pages').delete().eq('slug', slug)
  return { error: error?.message ?? null }
}
export async function fetchPublishedPage(slug: string): Promise<PageRow | null> {
  const { data } = await supabase.from('lumia_pages').select('*').eq('slug', slug).eq('published', true).maybeSingle()
  return (data as PageRow) || null
}
