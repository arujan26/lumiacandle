import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Icon } from './icons'
import { adminSaveSettings } from '../lib/settings'

const card: CSSProperties = { background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', borderRadius: 'var(--st-r-md)', padding: 20 }
const fade = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } } }

function hexToRgb(h: string): [number, number, number] {
  const m = h.replace('#', '').match(/.{1,2}/g) || ['0', '0', '0']
  return [parseInt(m[0], 16) || 0, parseInt(m[1], 16) || 0, parseInt(m[2], 16) || 0]
}
const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
const rgbToHex = (r: number, g: number, b: number) => `#${toHex(r)}${toHex(g)}${toHex(b)}`
function mix(hex: string, target: [number, number, number], amt: number) {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r + (target[0] - r) * amt, g + (target[1] - g) * amt, b + (target[2] - b) * amt)
}
function lum(hex: string) {
  const c = hexToRgb(hex).map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
function contrast(a: string, b: string) {
  const L1 = lum(a), L2 = lum(b)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

const FONTS: { label: string; css: string }[] = [
  { label: 'Fraunces', css: "'Fraunces', serif" },
  { label: 'Cormorant', css: "'Cormorant Garamond', serif" },
  { label: 'Georgia', css: 'Georgia, serif' },
  { label: 'Inter', css: "'Inter', sans-serif" },
  { label: 'Jost', css: "'Jost', sans-serif" },
  { label: 'JetBrains Mono', css: "'JetBrains Mono', monospace" },
]

export default function StudioTheme() {
  const [tokens, setTokens] = useState({ accent: '#C9A86A', surface: '#15151B', text: '#F3F3F6', muted: '#A2A2AD' })
  const [base, setBase] = useState('#C9A86A')
  const [heading, setHeading] = useState(FONTS[0])
  const [body, setBody] = useState(FONTS[4])
  const [cFg, setCFg] = useState('#A2A2AD')
  const [cBg, setCBg] = useState('#15151B')
  const [applyMsg, setApplyMsg] = useState('')
  const [applying, setApplying] = useState(false)

  const apply = async () => {
    setApplying(true); setApplyMsg('')
    const { error } = await adminSaveSettings({ accent: tokens.accent })
    setApplying(false)
    setApplyMsg(error ? error : '✓ Applied — live on the store')
    setTimeout(() => setApplyMsg(''), 2500)
  }

  const W: [number, number, number] = [255, 255, 255], K: [number, number, number] = [10, 10, 12]
  const ramp = [mix(base, W, 0.82), mix(base, W, 0.55), mix(base, W, 0.28), base, mix(base, K, 0.22), mix(base, K, 0.45), mix(base, K, 0.66)]
  const ratio = contrast(cFg, cBg)

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} style={{ padding: '26px 30px', maxWidth: 1080, margin: '0 auto' }}>
      <motion.div variants={fade} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 600, margin: 0 }}>Theme Studio</h1>
          <p style={{ color: 'var(--st-text-3)', fontSize: 13, margin: '4px 0 0' }}>Design tokens, palette, type & accessibility.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {applyMsg && <span style={{ fontSize: 12, color: applyMsg.startsWith('✓') ? 'var(--st-live)' : 'var(--st-danger)' }}>{applyMsg}</span>}
          <button onClick={apply} disabled={applying} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 32, padding: '0 14px', borderRadius: 8, background: 'var(--st-accent)', color: '#1a1410', fontSize: 12.5, fontWeight: 500 }}>
            <Icon name="check" size={14} /> {applying ? 'Applying…' : 'Apply accent'}
          </button>
        </div>
      </motion.div>

      {/* Brand tokens */}
      <motion.div variants={fade} style={{ ...card, marginBottom: 14 }}>
        <SecTitle icon="theme" title="Brand tokens" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {([['accent', 'Accent'], ['surface', 'Surface'], ['text', 'Text'], ['muted', 'Muted']] as const).map(([k, lbl]) => (
            <div key={k} style={{ border: '1px solid var(--st-border)', borderRadius: 9, overflow: 'hidden' }}>
              <label style={{ display: 'block', height: 60, background: tokens[k], cursor: 'pointer', position: 'relative' }}>
                <input type="color" value={tokens[k]} onChange={e => setTokens(t => ({ ...t, [k]: e.target.value }))} style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
              </label>
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 12 }}>{lbl}</div>
                <div className="st-mono" style={{ fontSize: 11, color: 'var(--st-text-3)', textTransform: 'uppercase' }}>{tokens[k]}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Palette generator */}
        <motion.div variants={fade} style={card}>
          <SecTitle icon="sparkles" title="Palette generator" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--st-text-2)' }}>Base</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--st-bg-1)', border: '1px solid var(--st-border)', borderRadius: 7, padding: '4px 8px' }}>
              <input type="color" value={base} onChange={e => setBase(e.target.value)} style={{ width: 20, height: 20, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }} />
              <span className="st-mono" style={{ fontSize: 11.5, color: 'var(--st-text-2)', textTransform: 'uppercase' }}>{base}</span>
            </div>
          </div>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--st-border)' }}>
            {ramp.map((c, i) => (
              <div key={i} title={c} style={{ flex: 1, height: 52, background: c }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['50', '100', '200', '400', '600', '800', '900'].map(s => <span key={s} style={{ fontSize: 9.5, color: 'var(--st-text-3)' }}>{s}</span>)}
          </div>
        </motion.div>

        {/* Contrast checker */}
        <motion.div variants={fade} style={card}>
          <SecTitle icon="security" title="Contrast checker" />
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <ColorPick label="Text" v={cFg} onV={setCFg} />
            <ColorPick label="Background" v={cBg} onV={setCBg} />
          </div>
          <div style={{ background: cBg, borderRadius: 8, padding: '14px 16px', marginBottom: 12, border: '1px solid var(--st-border)' }}>
            <span style={{ color: cFg, fontSize: 15 }}>The quick brown fox</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="st-mono" style={{ fontSize: 22, fontWeight: 500 }}>{ratio.toFixed(2)}:1</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <Badge ok={ratio >= 4.5} t="AA" />
              <Badge ok={ratio >= 7} t="AAA" />
              <Badge ok={ratio >= 3} t="AA Large" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Font pairing */}
      <motion.div variants={fade} style={{ ...card, marginBottom: 14 }}>
        <SecTitle icon="pages" title="Font pairing" />
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <FontSelect label="Heading" v={heading} onV={setHeading} />
          <FontSelect label="Body" v={body} onV={setBody} />
        </div>
        <div style={{ borderTop: '1px solid var(--st-border)', paddingTop: 16 }}>
          <div style={{ fontFamily: heading.css, fontSize: 34, fontWeight: 500, marginBottom: 8, letterSpacing: '-.01em' }}>Candles inspired by emotions</div>
          <div style={{ fontFamily: body.css, fontSize: 14, color: 'var(--st-text-2)', lineHeight: 1.7, maxWidth: 520 }}>
            Hand-poured in small batches with a premium coconut-soy wax blend. Each candle is named after an emotion — a feeling you want to sit with, release, or step into.
          </div>
        </div>
      </motion.div>

      {/* Scales */}
      <motion.div variants={fade} style={card}>
        <SecTitle icon="builder" title="Scales" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <div>
            <Mini>Spacing</Mini>
            {[4, 8, 12, 16, 24, 32, 48].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{ height: 8, width: s, background: 'var(--st-accent)', borderRadius: 2 }} />
                <span className="st-mono" style={{ fontSize: 10.5, color: 'var(--st-text-3)' }}>{s}</span>
              </div>
            ))}
          </div>
          <div>
            <Mini>Radius</Mini>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[4, 7, 10, 14, 20].map(r => <div key={r} style={{ width: 38, height: 38, background: 'var(--st-bg-3)', border: '1px solid var(--st-border-2)', borderRadius: r }} />)}
            </div>
          </div>
          <div>
            <Mini>Elevation</Mini>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
              {['0 1px 2px rgba(0,0,0,.4)', '0 6px 16px rgba(0,0,0,.45)', '0 16px 40px rgba(0,0,0,.5)'].map((sh, i) => (
                <div key={i} style={{ width: 38, height: 38, background: 'var(--st-bg-3)', borderRadius: 9, boxShadow: sh }} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SecTitle({ icon, title }: { icon: 'theme' | 'sparkles' | 'security' | 'pages' | 'builder'; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
      <Icon name={icon} size={16} style={{ color: 'var(--st-accent)' }} />
      <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
    </div>
  )
}
function ColorPick({ label, v, onV }: { label: string; v: string; onV: (v: string) => void }) {
  return (
    <label style={{ flex: 1, background: 'var(--st-bg-1)', border: '1px solid var(--st-border)', borderRadius: 7, padding: '7px 9px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input type="color" value={v} onChange={e => onV(e.target.value)} style={{ width: 22, height: 22, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10.5, color: 'var(--st-text-3)' }}>{label}</div>
        <div className="st-mono" style={{ fontSize: 11.5, textTransform: 'uppercase' }}>{v}</div>
      </div>
    </label>
  )
}
function Badge({ ok, t }: { ok: boolean; t: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', borderRadius: 999, background: ok ? 'rgba(74,222,128,.12)' : 'rgba(240,114,107,.12)', color: ok ? 'var(--st-live)' : 'var(--st-danger)', border: `1px solid ${ok ? 'rgba(74,222,128,.25)' : 'rgba(240,114,107,.25)'}` }}>
      <Icon name={ok ? 'check' : 'arrowDown'} size={11} /> {t}
    </span>
  )
}
function FontSelect({ label, v, onV }: { label: string; v: { label: string; css: string }; onV: (f: { label: string; css: string }) => void }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10.5, color: 'var(--st-text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {FONTS.map(f => (
          <button key={f.label} onClick={() => onV(f)} style={{ fontFamily: f.css, fontSize: 13, padding: '6px 11px', borderRadius: 7, border: `1px solid ${v.label === f.label ? 'var(--st-accent)' : 'var(--st-border)'}`, color: v.label === f.label ? 'var(--st-text)' : 'var(--st-text-2)', background: v.label === f.label ? 'var(--st-accent-soft)' : 'transparent' }}>{f.label}</button>
        ))}
      </div>
    </div>
  )
}
const Mini = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--st-text-3)', marginBottom: 12 }}>{children}</div>
