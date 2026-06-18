import { useEffect, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './icons'
import { uploadProductImage } from '../lib/productsApi'
import {
  BlockView, newBlock, BLOCK_LIBRARY,
  adminListPages, adminGetPage, adminSavePage, adminDeletePage,
  type Block, type BlockType, type PageRow,
} from '../lib/blocks'

const SITE = (typeof location !== 'undefined' && /localhost|127\.0\.0\.1/.test(location.hostname)) ? location.origin : 'https://lumiacandle.com'
const uid = () => Math.random().toString(36).slice(2, 9)
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function StudioBuilder({ device, zoom }: { device: 'desktop' | 'mobile'; zoom: number }) {
  const [pages, setPages] = useState<PageRow[]>([])
  const [page, setPage] = useState<PageRow | null>(null)
  const [sel, setSel] = useState<string | null>(null)
  const [hov, setHov] = useState<string | null>(null)
  const [hist, setHist] = useState<Block[][]>([])
  const [future, setFuture] = useState<Block[][]>([])
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const loadList = () => adminListPages().then(setPages)
  useEffect(() => { loadList() }, [])

  const blocks = page?.blocks || []
  const selected = blocks.find(b => b.id === sel) || null

  // Robust functional update — derives from the latest blocks so rapid edits never clobber each other.
  const apply = (fn: (bs: Block[]) => Block[]) => {
    setHist(h => [...h.slice(-50), blocks]); setFuture([]); setDirty(true)
    setPage(p => p ? { ...p, blocks: fn(p.blocks) } : p)
  }
  const undo = () => { if (!hist.length) return; setFuture(f => [blocks, ...f]); setPage(p => p ? { ...p, blocks: hist[hist.length - 1] } : p); setHist(h => h.slice(0, -1)); setDirty(true) }
  const redo = () => { if (!future.length) return; setHist(h => [...h, blocks]); setPage(p => p ? { ...p, blocks: future[0] } : p); setFuture(f => f.slice(1)); setDirty(true) }

  const addBlock = (type: BlockType) => {
    const b = newBlock(type)
    apply(bs => { const idx = sel ? bs.findIndex(x => x.id === sel) + 1 : bs.length; return [...bs.slice(0, idx), b, ...bs.slice(idx)] })
    setSel(b.id)
  }
  const updateBlock = (id: string, props: Record<string, unknown>) => apply(bs => bs.map(b => b.id === id ? { ...b, props: { ...b.props, ...props } } : b))
  const setFlag = (id: string, k: 'hideMobile' | 'hideDesktop', v: boolean) => apply(bs => bs.map(b => b.id === id ? { ...b, [k]: v } : b))
  const move = (id: string, dir: number) => apply(bs => { const i = bs.findIndex(b => b.id === id); const j = i + dir; if (j < 0 || j >= bs.length) return bs; const n = [...bs];[n[i], n[j]] = [n[j], n[i]]; return n })
  const dup = (id: string) => { const nid = uid(); apply(bs => { const b = bs.find(x => x.id === id); if (!b) return bs; const i = bs.findIndex(x => x.id === id); return [...bs.slice(0, i + 1), { ...b, id: nid, props: { ...b.props } }, ...bs.slice(i + 1)] }); setSel(nid) }
  const del = (id: string) => { apply(bs => bs.filter(b => b.id !== id)); setSel(null) }

  const openPage = async (slug: string) => { const p = await adminGetPage(slug); setPage(p); setSel(null); setHist([]); setFuture([]); setDirty(false) }
  const createPage = async () => {
    const title = prompt('Page title (e.g. Spring Launch)'); if (!title) return
    const slug = slugify(prompt('URL slug', slugify(title)) || slugify(title)); if (!slug) return
    const p: PageRow = { slug, title, blocks: [newBlock('eyebrow'), newBlock('heading'), newBlock('text'), newBlock('button')], published: false }
    await adminSavePage(p); await loadList(); setPage(p); setDirty(false)
  }
  const save = async (publish?: boolean) => {
    if (!page) return
    setSaving(true); setMsg('')
    const next = { ...page, published: publish ?? page.published }
    const { error } = await adminSavePage(next)
    setSaving(false)
    if (error) { setMsg(error); return }
    setPage(next); setDirty(false); await loadList()
    setMsg(publish ? '✓ Published — live now' : '✓ Saved'); setTimeout(() => setMsg(''), 2400)
  }

  const frameW = device === 'mobile' ? 390 : 1180

  if (!page) {
    return (
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--st-text-2)' }}>
          <Icon name="builder" size={34} style={{ color: 'var(--st-accent)' }} />
          <div style={{ fontSize: 16, color: 'var(--st-text)' }}>Build a page from scratch</div>
          <p style={{ fontSize: 13, color: 'var(--st-text-3)', maxWidth: 360, textAlign: 'center' }}>Create custom pages with drag-style blocks. They publish to <span className="st-mono">/p/your-slug</span>.</p>
          <button onClick={createPage} style={{ ...btnPrimary, marginTop: 6 }}>+ New page</button>
          {pages.length > 0 && (
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6, width: 280 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--st-text-3)' }}>Your pages</div>
              {pages.map(p => (
                <button key={p.slug} onClick={() => openPage(p.slug)} style={{ ...rowBtn, justifyContent: 'space-between' }}>
                  <span>{p.title || p.slug}</span>
                  <span style={{ fontSize: 10, color: p.published ? 'var(--st-live)' : 'var(--st-text-3)' }}>{p.published ? 'Live' : 'Draft'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      {/* Left: page + palette + layers */}
      <div style={{ width: 214, flexShrink: 0, background: 'var(--st-bg-1)', borderRight: '1px solid var(--st-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 10, borderBottom: '1px solid var(--st-border)' }}>
          <button onClick={() => setPage(null)} style={{ ...rowBtn, fontSize: 11.5, color: 'var(--st-text-3)' }}><Icon name="chevronRight" size={12} style={{ transform: 'rotate(180deg)' }} /> All pages</button>
          <div style={{ fontSize: 13, fontWeight: 500, padding: '6px 8px 2px' }}>{page.title || page.slug}</div>
          <a href={`${SITE}/p/${page.slug}`} target="_blank" rel="noreferrer" className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-accent)', padding: '0 8px', textDecoration: 'none' }}>/p/{page.slug} ↗</a>
        </div>
        <div style={{ padding: 10, borderBottom: '1px solid var(--st-border)' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--st-text-3)', marginBottom: 7 }}>Add block</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {BLOCK_LIBRARY.map(b => <button key={b.type} onClick={() => addBlock(b.type)} style={paletteBtn}>+ {b.label}</button>)}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--st-text-3)', margin: '2px 6px 7px' }}>Layers</div>
          {blocks.map((b, i) => (
            <div key={b.id} onClick={() => setSel(b.id)} onMouseEnter={() => setHov(b.id)} onMouseLeave={() => setHov(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', background: sel === b.id ? 'var(--st-accent-soft)' : 'transparent', color: sel === b.id ? 'var(--st-text)' : 'var(--st-text-2)', opacity: b.hideMobile || b.hideDesktop ? 0.55 : 1 }}>
              <span style={{ flex: 1, fontSize: 12, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.type}</span>
              <button onClick={e => { e.stopPropagation(); move(b.id, -1) }} disabled={i === 0} style={miniIcon}>↑</button>
              <button onClick={e => { e.stopPropagation(); move(b.id, 1) }} disabled={i === blocks.length - 1} style={miniIcon}>↓</button>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, minWidth: 0, background: 'var(--st-bg)', position: 'relative', overflow: 'auto', display: 'flex', justifyContent: 'center' }} onClick={() => setSel(null)}>
        <div style={{ padding: '30px 20px 70px', transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform .18s ease' }}>
          <div style={{ width: frameW, minHeight: 400, background: 'var(--white)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,.5)', border: '1px solid var(--st-border)' }}>
            {blocks.length === 0 && <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Empty page — add blocks from the left.</div>}
            {blocks.map(b => {
              if (device === 'mobile' && b.hideMobile) return null
              if (device === 'desktop' && b.hideDesktop) return null
              return (
                <div key={b.id} onClick={e => { e.stopPropagation(); setSel(b.id) }} onMouseEnter={() => setHov(b.id)} onMouseLeave={() => setHov(null)}
                  style={{ position: 'relative', outline: sel === b.id ? '2px solid #C9A86A' : hov === b.id ? '1px solid rgba(201,168,106,.55)' : 'none', outlineOffset: -1, cursor: 'pointer' }}>
                  <BlockView block={b} />
                  {sel === b.id && (
                    <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 2, background: '#C9A86A', borderBottomLeftRadius: 6, padding: 2, zIndex: 5 }}>
                      <button onClick={e => { e.stopPropagation(); dup(b.id) }} style={tbBtn} title="Duplicate"><Icon name="plus" size={12} /></button>
                      <button onClick={e => { e.stopPropagation(); del(b.id) }} style={tbBtn} title="Delete"><Icon name="x" size={12} /></button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right: properties */}
      <div style={{ width: 290, flexShrink: 0, background: 'var(--st-bg-1)', borderLeft: '1px solid var(--st-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 42, flexShrink: 0, borderBottom: '1px solid var(--st-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
          <span style={{ fontSize: 12.5, fontWeight: 500, textTransform: 'capitalize' }}>{selected ? selected.type : 'Page'}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={undo} disabled={!hist.length} style={miniIcon} title="Undo">↺</button>
            <button onClick={redo} disabled={!future.length} style={miniIcon} title="Redo">↻</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {selected
            ? <Props block={selected} onProp={(p) => updateBlock(selected.id, p)} onFlag={(k, v) => setFlag(selected.id, k, v)} />
            : <p style={{ fontSize: 12.5, color: 'var(--st-text-3)', textAlign: 'center', marginTop: 16 }}>Select a block to edit it, or add one from the left.</p>}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--st-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {msg && <p style={{ fontSize: 11.5, textAlign: 'center', margin: 0, color: msg.startsWith('✓') ? 'var(--st-live)' : 'var(--st-danger)' }}>{msg}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => save(false)} disabled={saving} style={{ ...btnGhost, flex: 1 }}>{saving ? '…' : dirty ? 'Save draft' : 'Saved'}</button>
            <button onClick={() => save(true)} disabled={saving} style={{ ...btnPrimary, flex: 1 }}>{page.published ? 'Update live' : 'Publish'}</button>
          </div>
          <button onClick={async () => { if (confirm(`Delete page "${page.title}"?`)) { await adminDeletePage(page.slug); setPage(null); loadList() } }} style={{ ...btnGhost, color: 'var(--st-danger)', fontSize: 11 }}>Delete page</button>
        </div>
      </div>
    </div>
  )
}

function Props({ block, onProp, onFlag }: { block: Block; onProp: (p: Record<string, unknown>) => void; onFlag: (k: 'hideMobile' | 'hideDesktop', v: boolean) => void }) {
  const p = block.props as Record<string, unknown>
  const n = (k: string, d: number) => (typeof p[k] === 'number' ? p[k] as number : d)
  const s = (k: string, d = '') => (p[k] != null ? String(p[k]) : d)
  const [uploading, setUploading] = useState(false)
  const up = async (k: string, f?: File) => { if (!f) return; setUploading(true); try { onProp({ [k]: await uploadProductImage(f) }) } finally { setUploading(false) } }

  return (
    <motion.div key={block.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
      {/* Content */}
      {(block.type === 'eyebrow' || block.type === 'heading' || block.type === 'text') && (
        <G title="Content"><Area v={s('text')} onV={v => onProp({ text: v })} /></G>
      )}
      {block.type === 'heading' && (
        <G title="Typography">
          <Seg label="Level" v={s('level', 'h2')} opts={[['h1', 'H1'], ['h2', 'H2'], ['h3', 'H3']]} onV={v => onProp({ level: v })} />
          <Seg label="Font" v={s('font', 'serif')} opts={[['serif', 'Serif'], ['sans', 'Sans']]} onV={v => onProp({ font: v })} />
          <Sld label="Size" v={n('size', 0)} min={0} max={120} onV={v => onProp({ size: v })} />
          <Seg label="Weight" v={String(n('weight', 400))} opts={[['300', 'L'], ['400', 'R'], ['500', 'M'], ['600', 'B']]} onV={v => onProp({ weight: Number(v) })} />
          <Sld label="Line ht" v={n('lh', 0) || 105} min={80} max={200} onV={v => onProp({ lh: v })} />
          <Sld label="Tracking" v={n('tracking', -2)} min={-6} max={40} onV={v => onProp({ tracking: v })} />
          <Col label="Color" v={s('color', '#1a1410')} onV={v => onProp({ color: v })} />
        </G>
      )}
      {block.type === 'eyebrow' && (
        <G title="Style">
          <Sld label="Size" v={n('size', 11)} min={9} max={20} onV={v => onProp({ size: v })} />
          <Sld label="Tracking" v={n('tracking', 30)} min={0} max={60} onV={v => onProp({ tracking: v })} />
          <Col label="Color" v={s('color', '#b8945a')} onV={v => onProp({ color: v })} />
        </G>
      )}
      {block.type === 'text' && (
        <G title="Typography">
          <Sld label="Size" v={n('size', 16)} min={11} max={64} onV={v => onProp({ size: v })} />
          <Seg label="Weight" v={String(n('weight', 300))} opts={[['300', 'L'], ['400', 'R'], ['500', 'M'], ['600', 'B']]} onV={v => onProp({ weight: Number(v) })} />
          <Sld label="Line ht" v={n('lh', 0) || 175} min={110} max={240} onV={v => onProp({ lh: v })} />
          <Sld label="Tracking" v={n('tracking', 0)} min={-4} max={40} onV={v => onProp({ tracking: v })} />
          <Col label="Color" v={s('color', '#7a6a59')} onV={v => onProp({ color: v })} />
        </G>
      )}
      {block.type === 'image' && (
        <G title="Image">
          <div style={{ width: '100%', height: 64, borderRadius: 7, background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', backgroundImage: s('src') ? `url(${s('src')})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 8 }} />
          <label style={pill}>{uploading ? 'Uploading…' : 'Upload image'}<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => up('src', e.target.files?.[0])} /></label>
          <Sld label="Height" v={n('height', 420)} min={120} max={760} onV={v => onProp({ height: v })} />
          <Seg label="Fit" v={s('fit', 'cover')} opts={[['cover', 'Cover'], ['contain', 'Contain']]} onV={v => onProp({ fit: v })} />
          <Sld label="Radius" v={n('radius', 0)} min={0} max={40} onV={v => onProp({ radius: v })} />
          <Sld label="Overlay" v={Math.round(n('overlay', 0) * 100)} min={0} max={80} onV={v => onProp({ overlay: v / 100 })} />
        </G>
      )}
      {block.type === 'button' && (
        <G title="Button">
          <T label="Label" v={s('label', 'Button')} onV={v => onProp({ label: v })} />
          <T label="Link" v={s('href', '/')} onV={v => onProp({ href: v })} />
          <Seg label="Style" v={s('variant', 'dark')} opts={[['dark', 'Dark'], ['outline', 'Outline'], ['gold', 'Gold']]} onV={v => onProp({ variant: v })} />
        </G>
      )}
      {block.type === 'products' && (
        <G title="Products">
          <Seg label="Type" v={s('kind', 'candle')} opts={[['candle', 'Candles'], ['sticker', 'Stickers']]} onV={v => onProp({ kind: v })} />
          <Sld label="How many" v={n('limit', 4)} min={1} max={8} onV={v => onProp({ limit: v })} />
        </G>
      )}
      {block.type === 'gallery' && (
        <G title="Gallery">
          <label style={pill}>{uploading ? 'Uploading…' : '+ Add image'}<input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => { const f = e.target.files?.[0]; if (!f) return; setUploading(true); try { const url = await uploadProductImage(f); onProp({ images: [...((p.images as string[]) || []), url] }) } finally { setUploading(false) } }} /></label>
          <div style={{ fontSize: 11, color: 'var(--st-text-3)', marginTop: 6 }}>{((p.images as string[]) || []).length} images</div>
          <Sld label="Columns" v={n('columns', 3)} min={2} max={4} onV={v => onProp({ columns: v })} />
        </G>
      )}
      {block.type === 'divider' && <G title="Divider"><Col label="Color" v={s('color', 'rgba(90,65,45,.14)')} onV={v => onProp({ color: v })} /></G>}

      {/* Layout — all blocks */}
      <G title="Section">
        <Col label="Background" v={s('bg') || '#ffffff'} onV={v => onProp({ bg: v })} allowClear cleared={!s('bg')} onClear={() => onProp({ bg: '' })} />
        <Seg label="Align" v={s('align', 'center')} opts={[['left', 'L'], ['center', 'C'], ['right', 'R']]} onV={v => onProp({ align: v })} />
        <Sld label="Pad top" v={n('pt', 36)} min={0} max={160} onV={v => onProp({ pt: v })} />
        <Sld label="Pad bottom" v={n('pb', 36)} min={0} max={160} onV={v => onProp({ pb: v })} />
        <Sld label="Width" v={n('maxWidth', 1180)} min={420} max={1180} onV={v => onProp({ maxWidth: v })} />
      </G>
      <G title="Responsive">
        <Tog label="Hide on mobile" v={!!block.hideMobile} onV={v => onFlag('hideMobile', v)} />
        <Tog label="Hide on desktop" v={!!block.hideDesktop} onV={v => onFlag('hideDesktop', v)} />
      </G>
    </motion.div>
  )
}

/* controls */
function G({ title, children }: { title: string; children: React.ReactNode }) { return <div style={{ marginBottom: 16 }}><div style={{ fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--st-text-3)', marginBottom: 9 }}>{title}</div><div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{children}</div></div> }
function T({ label, v, onV }: { label: string; v: string; onV: (v: string) => void }) { return <div><span style={lab}>{label}</span><input value={v} onChange={e => onV(e.target.value)} style={inp} /></div> }
function Area({ v, onV }: { v: string; onV: (v: string) => void }) { return <textarea value={v} onChange={e => onV(e.target.value)} style={{ ...inp, minHeight: 56, resize: 'vertical' }} /> }
function Sld({ label, v, min, max, onV }: { label: string; v: number; min: number; max: number; onV: (v: number) => void }) { return <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ ...lab, width: 66, margin: 0 }}>{label}</span><input type="range" min={min} max={max} value={v} onChange={e => onV(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--st-accent)' }} /><span className="st-mono" style={{ fontSize: 11, color: 'var(--st-text-2)', width: 26, textAlign: 'right' }}>{v}</span></div> }
function Seg({ label, v, opts, onV }: { label: string; v: string; opts: [string, string][]; onV: (v: string) => void }) { return <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ ...lab, width: 66, margin: 0 }}>{label}</span><div style={{ flex: 1, display: 'flex', background: 'var(--st-bg-3)', borderRadius: 7, padding: 2 }}>{opts.map(([val, txt]) => <button key={val} onClick={() => onV(val)} style={{ flex: 1, height: 24, borderRadius: 5, fontSize: 11, color: v === val ? 'var(--st-text)' : 'var(--st-text-3)', background: v === val ? 'var(--st-bg-1)' : 'transparent' }}>{txt}</button>)}</div></div> }
function Col({ label, v, onV, allowClear, cleared, onClear }: { label: string; v: string; onV: (v: string) => void; allowClear?: boolean; cleared?: boolean; onClear?: () => void }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ ...lab, width: 66, margin: 0 }}>{label}</span><div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 7, padding: '3px 7px' }}><input type="color" value={/^#/.test(v) ? v : '#ffffff'} onChange={e => onV(e.target.value)} style={{ width: 18, height: 18, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }} /><span className="st-mono" style={{ flex: 1, fontSize: 11, color: 'var(--st-text-2)' }}>{cleared ? 'none' : v}</span>{allowClear && <button onClick={onClear} style={{ ...miniIcon, width: 18, height: 18 }}>✕</button>}</div></div>
}
function Tog({ label, v, onV }: { label: string; v: boolean; onV: (v: boolean) => void }) { return <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--st-text-2)', cursor: 'pointer' }}>{label}<input type="checkbox" checked={v} onChange={e => onV(e.target.checked)} /></label> }

const lab: CSSProperties = { fontSize: 11, color: 'var(--st-text-3)', display: 'block', marginBottom: 5 }
const inp: CSSProperties = { width: '100%', background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 7, color: 'var(--st-text)', fontSize: 12.5, padding: '8px 10px', outline: 'none', fontFamily: 'inherit' }
const paletteBtn: CSSProperties = { fontSize: 11, padding: '7px 6px', border: '1px solid var(--st-border)', borderRadius: 6, background: 'transparent', color: 'var(--st-text-2)', cursor: 'pointer' }
const rowBtn: CSSProperties = { width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px', borderRadius: 7, background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', color: 'var(--st-text-2)', cursor: 'pointer', fontSize: 12.5, textAlign: 'left' }
const btnPrimary: CSSProperties = { height: 34, padding: '0 16px', borderRadius: 8, background: 'var(--st-accent)', color: '#1a1410', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }
const btnGhost: CSSProperties = { height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid var(--st-border)', color: 'var(--st-text-2)', fontSize: 12, background: 'transparent', cursor: 'pointer' }
const pill: CSSProperties = { display: 'inline-block', fontSize: 10.5, padding: '7px 11px', border: '1px solid var(--st-border)', borderRadius: 7, background: 'transparent', color: 'var(--st-text-2)', cursor: 'pointer' }
const miniIcon: CSSProperties = { width: 22, height: 22, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--st-text-3)', background: 'transparent', cursor: 'pointer', fontSize: 12 }
const tbBtn: CSSProperties = { width: 22, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1410', background: 'transparent', cursor: 'pointer' }
