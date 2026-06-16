import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import './theme.css'
import { Icon } from './icons'
import { NAV, type NavItem } from './mock'
import StudioHome from './StudioHome'
import StudioBuilder from './StudioBuilder'
import CommandPalette from './CommandPalette'

export default function StudioShell() {
  const [active, setActive] = useState('home')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(o => !o) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const item = NAV.find(n => n.id === active) || NAV[0]

  return (
    <div className="studio" style={{ display: 'flex', height: '100svh', overflow: 'hidden' }}>
      <Rail active={active} onSelect={setActive} onSearch={() => setPaletteOpen(true)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar item={item} onSearch={() => setPaletteOpen(true)} />
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {active === 'home' ? <StudioHome />
            : active === 'builder' ? <StudioBuilder device={device} zoom={zoom} />
              : <Placeholder key={active} item={item} />}
        </div>
        <BottomBar device={device} setDevice={setDevice} zoom={zoom} setZoom={setZoom} />
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={id => setActive(id)} />
    </div>
  )
}

function Rail({ active, onSelect, onSearch }: { active: string; onSelect: (id: string) => void; onSearch: () => void }) {
  return (
    <div style={{ width: 62, flexShrink: 0, background: 'var(--st-bg-1)', borderRight: '1px solid var(--st-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0' }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--st-accent)', color: '#1a1410', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 600, marginBottom: 14 }}>L</div>
      <button className="st-rail-btn" onClick={onSearch} style={railBtn(false)} aria-label="Search">
        <Icon name="search" size={18} />
        <span className="st-tip">Search · ⌘K</span>
      </button>
      <div style={{ width: 24, height: 1, background: 'var(--st-border)', margin: '8px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {NAV.map(n => {
          const on = active === n.id
          return (
            <button key={n.id} className="st-rail-btn" onClick={() => onSelect(n.id)} style={railBtn(on)} aria-label={n.label}>
              {on && <span style={{ position: 'absolute', left: -13, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, background: 'var(--st-accent)', borderRadius: 3 }} />}
              <Icon name={n.icon} size={18} />
              <span className="st-tip">{n.label}</span>
            </button>
          )
        })}
      </div>
      <button className="st-rail-btn" style={railBtn(false)} aria-label="Account">
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#2a2a31', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--st-text-2)' }}>LM</div>
        <span className="st-tip">Account</span>
      </button>
    </div>
  )
}

function railBtn(on: boolean): React.CSSProperties {
  return {
    width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: on ? 'var(--st-accent)' : 'var(--st-text-3)', background: on ? 'var(--st-accent-soft)' : 'transparent',
    transition: 'color .12s, background .12s',
  }
}

function Topbar({ item, onSearch }: { item: NavItem; onSearch: () => void }) {
  return (
    <div style={{ height: 52, flexShrink: 0, borderBottom: '1px solid var(--st-border)', background: 'rgba(16,16,19,.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--st-text-3)' }}>
        <span>Lumia</span>
        <Icon name="chevronRight" size={13} />
        <span style={{ color: 'var(--st-text)' }}>{item.label}</span>
      </div>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--st-pending)', background: 'rgba(230,180,80,.1)', border: '1px solid rgba(230,180,80,.22)', borderRadius: 999, padding: '4px 10px' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-pending)' }} /> Changes pending
      </span>

      <div style={{ flex: 1 }} />

      <button onClick={onSearch} className="st-hover" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 10px 0 11px', borderRadius: 8, border: '1px solid var(--st-border)', color: 'var(--st-text-3)', fontSize: 12.5 }}>
        <Icon name="search" size={14} /> Search
        <kbd style={{ fontFamily: 'var(--st-mono)', fontSize: 10.5, background: 'var(--st-bg-3)', borderRadius: 5, padding: '1px 5px', marginLeft: 4 }}>⌘K</kbd>
      </button>
      <button className="st-hover st-rail-btn" style={{ width: 32, height: 32, borderRadius: 8, color: 'var(--st-text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Notifications">
        <Icon name="bell" size={16} />
      </button>
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 32, padding: '0 14px', borderRadius: 8, background: 'var(--st-accent)', color: '#1a1410', fontSize: 12.5, fontWeight: 500 }}>
        <Icon name="bolt" size={14} /> Publish
      </button>
    </div>
  )
}

function BottomBar({ device, setDevice, zoom, setZoom }: { device: string; setDevice: (d: 'desktop' | 'mobile') => void; zoom: number; setZoom: (z: number) => void }) {
  return (
    <div style={{ height: 38, flexShrink: 0, borderTop: '1px solid var(--st-border)', background: 'var(--st-bg-1)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', fontSize: 12 }}>
      <div style={{ display: 'flex', background: 'var(--st-bg-3)', borderRadius: 7, padding: 2 }}>
        {(['desktop', 'mobile'] as const).map(d => (
          <button key={d} onClick={() => setDevice(d)} style={{ width: 30, height: 22, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: device === d ? 'var(--st-text)' : 'var(--st-text-3)', background: device === d ? 'var(--st-bg-1)' : 'transparent' }} aria-label={d}>
            <Icon name={d === 'desktop' ? 'monitor' : 'mobile'} size={14} />
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--st-text-2)' }}>
        <button className="st-hover" onClick={() => setZoom(Math.max(25, zoom - 25))} style={zBtn} aria-label="Zoom out"><Icon name="zoomOut" size={14} /></button>
        <span className="st-mono" style={{ width: 38, textAlign: 'center', fontSize: 11.5 }}>{zoom}%</span>
        <button className="st-hover" onClick={() => setZoom(Math.min(200, zoom + 25))} style={zBtn} aria-label="Zoom in"><Icon name="zoomIn" size={14} /></button>
      </div>
      <div style={{ flex: 1 }} />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--st-text-3)' }}>
        <Icon name="check" size={13} style={{ color: 'var(--st-live)' }} /> All changes saved · autosave on
      </span>
    </div>
  )
}
const zBtn: React.CSSProperties = { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--st-text-2)' }

function Placeholder({ item }: { item: NavItem }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--st-bg-2)', border: '1px solid var(--st-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--st-accent)', marginBottom: 18 }}>
        <Icon name={item.icon} size={26} />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 6px' }}>{item.label}</h2>
      <p style={{ color: 'var(--st-text-3)', fontSize: 13, maxWidth: 360, margin: '0 0 22px' }}>
        This screen is part of Lumia Studio. The premium UI is in place — content gets wired to your live data in the next phase.
      </p>
      <div style={{ width: 'min(440px, 80%)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[100, 78, 88].map((w, i) => <div key={i} className="st-skel" style={{ height: i === 0 ? 44 : 14, width: `${w}%` }} />)}
      </div>
    </motion.div>
  )
}
