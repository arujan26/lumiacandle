import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconName } from './icons'

type ElType = 'section' | 'text' | 'image' | 'button'
interface El {
  id: string; type: ElType; name: string
  text?: string; fontSize?: number; weight?: number; color?: string; align?: 'left' | 'center' | 'right'
  bg?: string; padding?: number; height?: number; radius?: number
  src?: string; objectFit?: 'cover' | 'contain'; opacity?: number
  children?: El[]; hidden?: boolean; locked?: boolean
}

const INITIAL: El[] = [
  {
    id: 'hero', type: 'section', name: 'Hero', bg: '#15151b', padding: 44, height: 300, children: [
      { id: 'eyebrow', type: 'text', name: 'Eyebrow', text: 'LUMIA CANDLES', fontSize: 12, weight: 500, color: '#C9A86A', align: 'center' },
      { id: 'title', type: 'text', name: 'Heading', text: 'Candles inspired by emotions', fontSize: 38, weight: 600, color: '#F3F3F6', align: 'center' },
      { id: 'sub', type: 'text', name: 'Subtext', text: 'Hand-poured in small batches.', fontSize: 15, weight: 400, color: '#A2A2AD', align: 'center' },
      { id: 'cta', type: 'button', name: 'Button', text: 'Shop Candles', bg: '#C9A86A', color: '#1a1410', radius: 8, fontSize: 13 },
    ],
  },
  {
    id: 'feature', type: 'section', name: 'Featured', bg: '#101013', padding: 28, height: 240, children: [
      { id: 'fimg', type: 'image', name: 'Image', src: '/shop-candles-hero.webp', objectFit: 'cover', radius: 12, opacity: 1 },
    ],
  },
]

const flatten = (page: El[]): El[] => page.flatMap(s => [s, ...(s.children || [])])
const findEl = (page: El[], id: string | null) => (id ? flatten(page).find(e => e.id === id) || null : null)
function patchEl(page: El[], id: string, patch: Partial<El>): El[] {
  return page.map(s => s.id === id ? { ...s, ...patch } : { ...s, children: s.children?.map(c => c.id === id ? { ...c, ...patch } : c) })
}

export default function StudioBuilder({ device, zoom }: { device: 'desktop' | 'mobile'; zoom: number }) {
  const [page, setPage] = useState<El[]>(INITIAL)
  const [sel, setSel] = useState<string | null>('title')
  const [hov, setHov] = useState<string | null>(null)
  const selected = findEl(page, sel)
  const update = (id: string, patch: Partial<El>) => setPage(p => patchEl(p, id, patch))
  const frameW = device === 'mobile' ? 390 : 920

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      <LayersPanel page={page} sel={sel} onSel={setSel} hov={hov} onHov={setHov} onToggle={(id, k) => update(id, { [k]: !findEl(page, id)?.[k] })} />

      {/* Canvas */}
      <div style={{ flex: 1, minWidth: 0, background: 'var(--st-bg)', position: 'relative', overflow: 'auto' }}>
        <Ruler horizontal /><Ruler />
        <div style={{ padding: '46px 30px 60px 46px', minHeight: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform .18s ease' }}>
            <div style={{ width: frameW, background: '#0d0d10', borderRadius: 10, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.5)', border: '1px solid var(--st-border)' }}>
              {page.map(sec => sec.hidden ? null : (
                <Node key={sec.id} el={sec} sel={sel} hov={hov} onSel={setSel} onHov={setHov} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'var(--st-text-3)', background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 999, padding: '4px 12px' }}>
          {device === 'mobile' ? 'Mobile · 390px' : 'Desktop · 920px'} · {zoom}%
        </div>
      </div>

      <Properties el={selected} onChange={update} />
    </div>
  )
}

function Node({ el, sel, hov, onSel, onHov }: { el: El; sel: string | null; hov: string | null; onSel: (id: string) => void; onHov: (id: string | null) => void }) {
  const on = sel === el.id, hovered = hov === el.id
  const ring = on ? '0 0 0 1.5px var(--st-accent)' : hovered ? '0 0 0 1px rgba(201,168,106,.5)' : 'none'
  const click = (e: React.MouseEvent) => { e.stopPropagation(); onSel(el.id) }
  const over = (e: React.MouseEvent) => { e.stopPropagation(); onHov(el.id) }

  if (el.type === 'section') {
    return (
      <div onClick={click} onMouseOver={over} onMouseOut={() => onHov(null)}
        style={{ background: el.bg, padding: el.padding, minHeight: el.height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, position: 'relative', boxShadow: ring, cursor: 'pointer' }}>
        {el.children?.map(c => c.hidden ? null : <Node key={c.id} el={c} sel={sel} hov={hov} onSel={onSel} onHov={onHov} />)}
      </div>
    )
  }
  if (el.type === 'text') {
    return <div onClick={click} onMouseOver={over} onMouseOut={() => onHov(null)}
      style={{ fontSize: el.fontSize, fontWeight: el.weight, color: el.color, textAlign: el.align, width: '100%', boxShadow: ring, cursor: 'pointer', fontFamily: el.id === 'title' ? 'Georgia, serif' : 'inherit', lineHeight: 1.2 }}>{el.text}</div>
  }
  if (el.type === 'button') {
    return <button onClick={click} onMouseOver={over} onMouseOut={() => onHov(null)}
      style={{ background: el.bg, color: el.color, borderRadius: el.radius, fontSize: el.fontSize, fontWeight: 500, padding: '11px 22px', boxShadow: ring, cursor: 'pointer', letterSpacing: '.04em' }}>{el.text}</button>
  }
  return <div onClick={click} onMouseOver={over} onMouseOut={() => onHov(null)} style={{ width: '100%', boxShadow: ring, cursor: 'pointer', borderRadius: el.radius, overflow: 'hidden', opacity: el.opacity }}>
    <img src={el.src} alt="" style={{ width: '100%', height: 180, objectFit: el.objectFit, display: 'block' }} />
  </div>
}

function LayersPanel({ page, sel, onSel, hov, onHov, onToggle }: { page: El[]; sel: string | null; onSel: (id: string) => void; hov: string | null; onHov: (id: string | null) => void; onToggle: (id: string, k: 'hidden' | 'locked') => void }) {
  return (
    <div style={{ width: 232, flexShrink: 0, background: 'var(--st-bg-1)', borderRight: '1px solid var(--st-border)', display: 'flex', flexDirection: 'column' }}>
      <PanelHead title="Layers" />
      <div style={{ overflowY: 'auto', padding: 6 }}>
        {page.map(sec => (
          <div key={sec.id}>
            <LayerRow el={sec} depth={0} sel={sel} onSel={onSel} hov={hov} onHov={onHov} onToggle={onToggle} />
            {sec.children?.map(c => <LayerRow key={c.id} el={c} depth={1} sel={sel} onSel={onSel} hov={hov} onHov={onHov} onToggle={onToggle} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

const TYPE_ICON: Record<ElType, IconName> = { section: 'builder', text: 'pages', image: 'media', button: 'bolt' }
function LayerRow({ el, depth, sel, onSel, hov, onHov, onToggle }: { el: El; depth: number; sel: string | null; onSel: (id: string) => void; hov: string | null; onHov: (id: string | null) => void; onToggle: (id: string, k: 'hidden' | 'locked') => void }) {
  const on = sel === el.id
  return (
    <div onClick={() => onSel(el.id)} onMouseEnter={() => onHov(el.id)} onMouseLeave={() => onHov(null)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', paddingLeft: 10 + depth * 16, borderRadius: 7, cursor: 'pointer', background: on ? 'var(--st-accent-soft)' : hov === el.id ? 'var(--st-bg-3)' : 'transparent', color: on ? 'var(--st-text)' : 'var(--st-text-2)', opacity: el.hidden ? 0.45 : 1 }}>
      <Icon name={TYPE_ICON[el.type]} size={14} style={{ color: on ? 'var(--st-accent)' : 'var(--st-text-3)', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{el.name}</span>
      <button onClick={e => { e.stopPropagation(); onToggle(el.id, 'hidden') }} style={iconBtn} aria-label="Toggle visibility"><Icon name="eye" size={13} /></button>
    </div>
  )
}

function Properties({ el, onChange }: { el: El | null; onChange: (id: string, patch: Partial<El>) => void }) {
  return (
    <div style={{ width: 278, flexShrink: 0, background: 'var(--st-bg-1)', borderLeft: '1px solid var(--st-border)', display: 'flex', flexDirection: 'column' }}>
      <PanelHead title={el ? el.name : 'Properties'} sub={el?.type} />
      {!el ? (
        <div style={{ padding: 24, color: 'var(--st-text-3)', fontSize: 12.5, textAlign: 'center', marginTop: 20 }}>Select an element on the canvas to edit its properties.</div>
      ) : (
        <motion.div key={el.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ overflowY: 'auto', padding: 14 }}>
          {(el.type === 'text' || el.type === 'button') && (
            <Group title="Content">
              <textarea value={el.text} onChange={e => onChange(el.id, { text: e.target.value })} style={{ ...inp, minHeight: el.type === 'text' ? 54 : 34, resize: 'vertical' }} />
            </Group>
          )}
          {el.type === 'text' && (
            <Group title="Typography">
              <Slider label="Size" v={el.fontSize || 16} min={10} max={72} onV={v => onChange(el.id, { fontSize: v })} />
              <Seg label="Weight" v={String(el.weight || 400)} opts={[['400', 'Reg'], ['500', 'Med'], ['600', 'Bold']]} onV={v => onChange(el.id, { weight: Number(v) })} />
              <Seg label="Align" v={el.align || 'left'} opts={[['left', 'L'], ['center', 'C'], ['right', 'R']]} onV={v => onChange(el.id, { align: v as El['align'] })} />
              <ColorRow label="Color" v={el.color || '#fff'} onV={v => onChange(el.id, { color: v })} />
            </Group>
          )}
          {el.type === 'button' && (
            <Group title="Style">
              <ColorRow label="Background" v={el.bg || '#C9A86A'} onV={v => onChange(el.id, { bg: v })} />
              <ColorRow label="Text" v={el.color || '#fff'} onV={v => onChange(el.id, { color: v })} />
              <Slider label="Radius" v={el.radius || 8} min={0} max={26} onV={v => onChange(el.id, { radius: v })} />
              <Slider label="Text size" v={el.fontSize || 13} min={10} max={20} onV={v => onChange(el.id, { fontSize: v })} />
            </Group>
          )}
          {el.type === 'image' && (
            <Group title="Image">
              <Seg label="Fit" v={el.objectFit || 'cover'} opts={[['cover', 'Cover'], ['contain', 'Contain']]} onV={v => onChange(el.id, { objectFit: v as El['objectFit'] })} />
              <Slider label="Radius" v={el.radius || 0} min={0} max={30} onV={v => onChange(el.id, { radius: v })} />
              <Slider label="Opacity" v={Math.round((el.opacity ?? 1) * 100)} min={20} max={100} onV={v => onChange(el.id, { opacity: v / 100 })} />
            </Group>
          )}
          {el.type === 'section' && (
            <Group title="Layout">
              <ColorRow label="Background" v={el.bg || '#101013'} onV={v => onChange(el.id, { bg: v })} />
              <Slider label="Padding" v={el.padding || 24} min={0} max={100} onV={v => onChange(el.id, { padding: v })} />
              <Slider label="Min height" v={el.height || 240} min={120} max={600} onV={v => onChange(el.id, { height: v })} />
            </Group>
          )}
        </motion.div>
      )}
    </div>
  )
}

function PanelHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ height: 42, flexShrink: 0, borderBottom: '1px solid var(--st-border)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</span>
      {sub && <span style={{ fontSize: 10.5, color: 'var(--st-text-3)', textTransform: 'uppercase', letterSpacing: '.08em', border: '1px solid var(--st-border)', borderRadius: 5, padding: '1px 6px' }}>{sub}</span>}
    </div>
  )
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--st-text-3)', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  )
}
function Slider({ label, v, min, max, onV }: { label: string; v: number; min: number; max: number; onV: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ ...lab, width: 64 }}>{label}</span>
      <input type="range" min={min} max={max} value={v} onChange={e => onV(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--st-accent)' }} />
      <span className="st-mono" style={{ fontSize: 11.5, color: 'var(--st-text-2)', width: 30, textAlign: 'right' }}>{v}</span>
    </div>
  )
}
function Seg({ label, v, opts, onV }: { label: string; v: string; opts: [string, string][]; onV: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ ...lab, width: 64 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', background: 'var(--st-bg-3)', borderRadius: 7, padding: 2 }}>
        {opts.map(([val, txt]) => (
          <button key={val} onClick={() => onV(val)} style={{ flex: 1, height: 24, borderRadius: 5, fontSize: 11.5, color: v === val ? 'var(--st-text)' : 'var(--st-text-3)', background: v === val ? 'var(--st-bg-1)' : 'transparent' }}>{txt}</button>
        ))}
      </div>
    </div>
  )
}
function ColorRow({ label, v, onV }: { label: string; v: string; onV: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ ...lab, width: 64 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 7, padding: '4px 8px' }}>
        <input type="color" value={v} onChange={e => onV(e.target.value)} style={{ width: 20, height: 20, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }} />
        <span className="st-mono" style={{ fontSize: 11.5, color: 'var(--st-text-2)', textTransform: 'uppercase' }}>{v}</span>
      </div>
    </div>
  )
}
function Ruler({ horizontal }: { horizontal?: boolean }) {
  return (
    <div style={{ position: 'absolute', background: 'var(--st-bg-1)', borderColor: 'var(--st-border)', zIndex: 2, ...(horizontal ? { top: 0, left: 0, right: 0, height: 22, borderBottom: '1px solid var(--st-border)' } : { top: 22, left: 0, bottom: 0, width: 22, borderRight: '1px solid var(--st-border)' }) }} />
  )
}

const lab: CSSProperties = { fontSize: 12, color: 'var(--st-text-2)', flexShrink: 0 }
const inp: CSSProperties = { width: '100%', background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 7, color: 'var(--st-text)', fontSize: 12.5, padding: '8px 10px', outline: 'none', fontFamily: 'inherit' }
const iconBtn: CSSProperties = { width: 22, height: 22, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--st-text-3)' }
