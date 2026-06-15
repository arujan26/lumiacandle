import { useEffect, useState } from 'react'
import {
  adminListProducts, adminUpsertProduct, adminDeleteProduct,
  uploadProductImage, emptyProduct,
  type DbProduct, type ProductType,
} from '../../lib/productsApi'
import ImageFramePicker from '../../components/ImageFramePicker'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminProducts() {
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<DbProduct | null>(null)
  const [isNew, setIsNew] = useState(false)

  const load = () => {
    setLoading(true)
    adminListProducts().then(p => { setProducts(p); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  const startAdd = (type: ProductType) => { setEditing(emptyProduct(type)); setIsNew(true) }
  const startEdit = (p: DbProduct) => { setEditing({ ...p }); setIsNew(false) }

  const candles = products.filter(p => p.type === 'candle')
  const stickers = products.filter(p => p.type === 'sticker')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(28px,3.5vw,40px)', marginBottom: 4 }}>Products</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Add, edit, hide or remove candles & stickers.</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : (
        <>
          <Section title="Candles" onAdd={() => startAdd('candle')} items={candles} onEdit={startEdit} onChanged={load} />
          <Section title="Stickers" onAdd={() => startAdd('sticker')} items={stickers} onEdit={startEdit} onChanged={load} />
        </>
      )}

      {editing && (
        <ProductEditor
          product={editing}
          isNew={isNew}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function Section({ title, items, onAdd, onEdit, onChanged }: {
  title: string; items: DbProduct[]; onAdd: () => void
  onEdit: (p: DbProduct) => void; onChanged: () => void
}) {
  const del = async (p: DbProduct) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    const { error } = await adminDeleteProduct(p.id)
    if (error) alert(error); else onChanged()
  }
  const toggleActive = async (p: DbProduct) => {
    const { error } = await adminUpsertProduct({ ...p, active: !p.active })
    if (error) alert(error); else onChanged()
  }

  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
        <h2 style={{ fontSize: 22 }}>{title} <span style={{ fontSize: 13, color: 'var(--muted-light)', fontFamily: 'var(--sans)' }}>({items.length})</span></h2>
        <button className="btn btn-dark" style={{ padding: '9px 16px', fontSize: 9 }} onClick={onAdd}>+ Add {title.slice(0, -1)}</button>
      </div>

      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0' }}>None yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {items.map(p => (
            <div key={p.id} style={{ border: '1px solid var(--line)', background: 'var(--white)', opacity: p.active ? 1 : 0.55 }}>
              <div style={{ aspectRatio: '4/5', background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.image_position || '50% 50%' }} />
                  : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--champagne)', fontFamily: 'var(--serif)', fontSize: 40 }}>✦</div>}
                {!p.active && <span style={{ position: 'absolute', top: 10, left: 10, background: 'var(--ink)', color: 'white', fontSize: 8, letterSpacing: '.15em', padding: '4px 8px', textTransform: 'uppercase' }}>Hidden</span>}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 19, marginBottom: 2 }}>{p.name || '(no name)'}</div>
                <div style={{ fontSize: 13, color: 'var(--gold)', marginBottom: 8 }}>${Number(p.price)}</div>
                <div style={{ fontSize: 11, marginBottom: 12, color: p.stock_qty === 0 ? '#c04a3a' : 'var(--muted)' }}>
                  {p.stock_qty == null ? 'In stock · unlimited' : p.stock_qty === 0 ? '● Sold out' : `${p.stock_qty} in stock`}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => onEdit(p)} style={btnSm}>Edit</button>
                  <button onClick={() => toggleActive(p)} style={btnSm}>{p.active ? 'Hide' : 'Show'}</button>
                  <button onClick={() => del(p)} style={{ ...btnSm, color: '#c04a3a', borderColor: 'rgba(192,74,58,.3)' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

const btnSm: React.CSSProperties = {
  fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', padding: '6px 10px',
  border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--ink)',
}

function ProductEditor({ product, isNew, onClose, onSaved }: {
  product: DbProduct; isNew: boolean; onClose: () => void; onSaved: () => void
}) {
  const [p, setP] = useState<DbProduct>(product)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof DbProduct, v: unknown) => setP(prev => ({ ...prev, [k]: v }))

  const handleImageFile = async (file: File) => {
    setUploading(true); setError('')
    try {
      set('image_url', await uploadProductImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally { setUploading(false) }
  }

  const save = async () => {
    const id = (p.id || slugify(p.name)).trim()
    if (!id) { setError('Name is required.'); return }
    if (!p.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError('')
    const { error: saveErr } = await adminUpsertProduct({ ...p, id, price: Number(p.price) || 0 })
    setSaving(false)
    if (saveErr) setError(saveErr); else onSaved()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(26,20,16,.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: 24 }} onClick={onClose}>
      <div style={{ background: 'var(--white)', width: '100%', maxWidth: 640, margin: 'auto', padding: 36 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 28 }}>{isNew ? `New ${p.type}` : `Edit ${p.name}`}</h2>
          <button onClick={onClose} style={{ ...btnSm, border: 'none', fontSize: 18 }}>✕</button>
        </div>

        {/* Photo with framing */}
        <ImageFramePicker
          label="Product photo"
          url={p.image_url || ''}
          position={p.image_position || '50% 50%'}
          onPosition={pos => set('image_position', pos)}
          onUpload={handleImageFile}
          onRemove={() => set('image_url', '')}
          uploading={uploading}
          recommend="Portrait 4:5 — ideal 1200 × 1500 px. Looks identical on mobile & desktop. JPG, PNG or WebP."
          desktopAspect="4 / 5"
        />

        <Field label="Name"><input style={inp} value={p.name} onChange={e => set('name', e.target.value)} /></Field>
        {isNew && <Field label="Slug / ID (URL)"><input style={inp} value={p.id} placeholder={slugify(p.name) || 'auto from name'} onChange={e => set('id', e.target.value)} /></Field>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Price (USD)"><input style={inp} type="number" value={p.price} onChange={e => set('price', e.target.value)} /></Field>
          <Field label="Badge"><input style={inp} value={p.badge ?? ''} onChange={e => set('badge', e.target.value)} placeholder="e.g. Release" /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Emotion"><input style={inp} value={p.emotion ?? ''} onChange={e => set('emotion', e.target.value)} /></Field>
          <Field label="Fragrance"><input style={inp} value={p.fragrance ?? ''} onChange={e => set('fragrance', e.target.value)} /></Field>
        </div>
        <Field label="Short description"><input style={inp} value={p.description ?? ''} onChange={e => set('description', e.target.value)} /></Field>
        <Field label="Long description"><textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} value={p.long_description ?? ''} onChange={e => set('long_description', e.target.value)} /></Field>
        <Field label="“This is for…” text"><textarea style={{ ...inp, minHeight: 50, resize: 'vertical' }} value={p.for_text ?? ''} onChange={e => set('for_text', e.target.value)} /></Field>

        {p.type === 'candle' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Burn time"><input style={inp} value={p.burn_time ?? ''} onChange={e => set('burn_time', e.target.value)} /></Field>
            <Field label="Wax"><input style={inp} value={p.wax ?? ''} onChange={e => set('wax', e.target.value)} /></Field>
            <Field label="Size"><input style={inp} value={p.size ?? ''} onChange={e => set('size', e.target.value)} /></Field>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="Sort order"><input style={inp} type="number" value={p.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></Field>
          <Field label="Stock (empty = unlimited)">
            <input style={inp} type="number" min={0} placeholder="∞" value={p.stock_qty ?? ''} onChange={e => set('stock_qty', e.target.value === '' ? null : Math.max(0, Number(e.target.value)))} />
          </Field>
          <Field label="Visible on store">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, paddingTop: 10 }}>
              <input type="checkbox" checked={p.active} onChange={e => set('active', e.target.checked)} /> {p.active ? 'Visible' : 'Hidden'}
            </label>
          </Field>
        </div>

        {error && <p style={{ color: '#c04a3a', fontSize: 13, margin: '8px 0' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-dark" style={{ flex: 1 }} onClick={save} disabled={saving || uploading}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 5, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid var(--line)',
  background: 'var(--ivory)', fontSize: 14, color: 'var(--ink)', outline: 'none',
  borderRadius: 0, fontFamily: 'var(--sans)',
}
