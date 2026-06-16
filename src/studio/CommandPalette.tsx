import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon, type IconName } from './icons'
import { NAV } from './mock'

interface Cmd { id: string; label: string; icon: IconName; hint: string; action: () => void }

export default function CommandPalette({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (id: string) => void }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const cmds: Cmd[] = useMemo(() => [
    ...NAV.map(n => ({ id: n.id, label: `Go to ${n.label}`, icon: n.icon, hint: 'Navigate', action: () => onNavigate(n.id) })),
    { id: 'publish', label: 'Publish changes', icon: 'bolt', hint: 'Action', action: () => onNavigate('home') },
    { id: 'live', label: 'Open live site', icon: 'external', hint: 'Action', action: () => window.open('https://lumiacandle.com', '_blank') },
  ], [onNavigate])

  const filtered = useMemo(() => cmds.filter(c => c.label.toLowerCase().includes(q.toLowerCase())), [cmds, q])

  useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 30) } }, [open])
  useEffect(() => { setActive(0) }, [q])

  const run = (c?: Cmd) => { if (c) { c.action(); onClose() } }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); run(filtered[active]) }
    else if (e.key === 'Escape') { onClose() }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '13vh' }}>
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()} onKeyDown={onKey}
            style={{ width: 'min(580px, 92vw)', background: 'rgba(22,22,26,.92)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1px solid var(--st-border-2)', borderRadius: 14, boxShadow: '0 24px 70px rgba(0,0,0,.6)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--st-border)' }}>
              <Icon name="search" size={17} style={{ color: 'var(--st-text-3)' }} />
              <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Search or jump to…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--st-text)', fontSize: 15 }} />
              <kbd style={kbd}>esc</kbd>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: 6 }}>
              {filtered.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--st-text-3)', fontSize: 13 }}>No results</div>}
              {filtered.map((c, i) => (
                <button key={c.id} onMouseEnter={() => setActive(i)} onClick={() => run(c)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 9, textAlign: 'left', background: i === active ? 'var(--st-accent-soft)' : 'transparent', color: i === active ? 'var(--st-text)' : 'var(--st-text-2)', transition: 'background .08s' }}>
                  <Icon name={c.icon} size={16} style={{ color: i === active ? 'var(--st-accent)' : 'var(--st-text-3)' }} />
                  <span style={{ flex: 1, fontSize: 13.5 }}>{c.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--st-text-3)' }}>{c.hint}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14, padding: '9px 16px', borderTop: '1px solid var(--st-border)', fontSize: 11, color: 'var(--st-text-3)' }}>
              <span><kbd style={kbd}>↑</kbd><kbd style={kbd}>↓</kbd> navigate</span>
              <span><kbd style={kbd}>↵</kbd> select</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const kbd: React.CSSProperties = { fontFamily: 'var(--st-mono)', fontSize: 10.5, background: 'var(--st-bg-3)', border: '1px solid var(--st-border)', borderRadius: 5, padding: '2px 5px', color: 'var(--st-text-2)', marginRight: 3 }
