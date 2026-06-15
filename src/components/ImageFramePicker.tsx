import { useRef } from 'react'

interface Props {
  label: string
  url: string
  position: string                 // "50% 50%"
  onPosition: (pos: string) => void
  onUpload: (file: File) => void
  onRemove?: () => void
  uploading?: boolean
  recommend: string                // ideal size help text
  desktopAspect: string            // e.g. "16 / 7"
  mobileAspect?: string            // e.g. "4 / 5" (shows a 2nd preview)
}

function parse(pos: string): [number, number] {
  const m = (pos || '50% 50%').match(/(-?\d+(?:\.\d+)?)\s*%?\s+(-?\d+(?:\.\d+)?)\s*%?/)
  return m ? [Number(m[1]), Number(m[2])] : [50, 50]
}

function Frame({ url, pos, aspect, tag, w }: { url: string; pos: string; aspect: string; tag: string; w: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: w, aspectRatio: aspect, margin: '0 auto', background: 'var(--cream)',
        border: '1px solid var(--line)', position: 'relative', overflow: 'hidden',
      }}>
        {url
          ? <img src={url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--champagne)', fontFamily: 'var(--serif)', fontSize: 30 }}>✦</div>}
        {/* center guides */}
        {url && <>
          <span style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,.35)' }} />
          <span style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,.35)' }} />
        </>}
      </div>
      {tag && <span style={{ fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted-light)', display: 'block', marginTop: 6 }}>{tag}</span>}
    </div>
  )
}

export default function ImageFramePicker({ label, url, position, onPosition, onUpload, onRemove, uploading, recommend, desktopAspect, mobileAspect }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [x, y] = parse(position)

  return (
    <div style={{ border: '1px solid var(--line)', padding: 18, marginBottom: 16, background: 'var(--white)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>📐 {recommend}</div>

      {/* Live previews (exactly how it crops) */}
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center', marginBottom: url ? 14 : 4 }}>
        <Frame url={url} pos={position} aspect={desktopAspect} tag={mobileAspect ? 'Desktop' : ''} w={mobileAspect ? 240 : 220} />
        {mobileAspect && <Frame url={url} pos={position} aspect={mobileAspect} tag="Mobile" w={120} />}
      </div>

      {/* Position sliders */}
      {url && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: 'var(--muted)' }}>
            Horizontal ({Math.round(x)}%)
            <input type="range" min={0} max={100} value={x} onChange={e => onPosition(`${Number(e.target.value)}% ${y}%`)} style={{ width: '100%', accentColor: 'var(--gold)' }} />
          </label>
          <label style={{ fontSize: 11, color: 'var(--muted)' }}>
            Vertical ({Math.round(y)}%)
            <input type="range" min={0} max={100} value={y} onChange={e => onPosition(`${x}% ${Number(e.target.value)}%`)} style={{ width: '100%', accentColor: 'var(--gold)' }} />
          </label>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={pill}>
          {uploading ? 'Uploading…' : url ? 'Replace photo' : 'Upload photo'}
        </button>
        {url && <button type="button" onClick={() => onPosition('50% 50%')} style={pill}>Center</button>}
        {url && onRemove && <button type="button" onClick={onRemove} style={{ ...pill, color: '#c04a3a' }}>Remove</button>}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = '' }} />
      </div>
    </div>
  )
}

const pill: React.CSSProperties = {
  fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', padding: '8px 14px',
  border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--ink)', fontWeight: 500,
}
