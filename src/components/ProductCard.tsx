import { useState } from 'react'
import type { Product } from '../types'
import { cart } from '../lib/cart'

interface Props {
  product: Product
  onOpenModal: (p: Product) => void
}

export default function ProductCard({ product, onOpenModal }: Props) {
  const [qty, setQty] = useState(1)

  const imgStyle: React.CSSProperties = product.image_url
    ? { backgroundImage: `url(${product.image_url})` }
    : { background: 'linear-gradient(145deg, var(--cream) 0%, var(--parchment) 100%)' }

  return (
    <article
      style={{
        background:'var(--ivory)', border:'1px solid var(--line)', overflow:'hidden',
        transition:'transform .4s var(--ease), box-shadow .4s var(--ease)', cursor:'pointer', position:'relative',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-6px)'
        el.style.boxShadow = '0 32px 80px rgba(26,20,16,.12)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
      onClick={() => onOpenModal(product)}
    >
      <div style={{ position:'relative', overflow:'hidden', aspectRatio:'4/5' }}>
        <div style={{
          width:'100%', height:'100%', backgroundSize:'cover', backgroundPosition:'center 55%',
          transition:'transform .6s var(--ease)',
          display:'flex', alignItems:'center', justifyContent:'center',
          ...imgStyle,
        }}>
          {!product.image_url && (
            <span style={{ fontFamily:'var(--serif)', fontSize:48, color:'var(--champagne)', opacity:.4 }}>✦</span>
          )}
        </div>
        {product.badge && (
          <span style={{
            position:'absolute', top:16, left:16, zIndex:2,
            background:'var(--gold)', color:'white', fontSize:8,
            letterSpacing:'.2em', textTransform:'uppercase', padding:'5px 10px', fontWeight:500,
          }}>{product.badge}</span>
        )}
      </div>

      <div style={{ padding:24 }}>
        <h3 style={{ fontFamily:'var(--serif)', fontSize:26, marginBottom:6, lineHeight:1.1 }}>
          {product.name}
        </h3>
        <p style={{ fontSize:11, color:'var(--gold)', letterSpacing:'.1em', marginBottom:10, fontWeight:400 }}>
          {product.fragrance}
        </p>
        <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6, marginBottom:18, minHeight:52 }}>
          {product.description.split('.')[0]}.
        </p>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <span style={{ fontFamily:'var(--serif)', fontSize:22, color:'var(--ink)' }}>
            ${product.price}
          </span>
          <div style={{ display:'flex', alignItems:'center', border:'1px solid var(--line)' }} onClick={e => e.stopPropagation()}>
            <button
              style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', fontSize:16, color:'var(--ink)', cursor:'pointer' }}
              onClick={() => setQty(q => Math.max(1, q - 1))}
            >−</button>
            <span style={{ width:30, height:30, textAlign:'center', lineHeight:'30px', fontSize:13, fontWeight:500 }}>{qty}</span>
            <button
              style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', fontSize:16, color:'var(--ink)', cursor:'pointer' }}
              onClick={() => setQty(q => q + 1)}
            >+</button>
          </div>
        </div>

        <div style={{ display:'flex', gap:8 }} onClick={e => e.stopPropagation()}>
          <button
            className="btn btn-dark"
            style={{ flex:1, padding:'11px 8px', fontSize:9 }}
            onClick={() => { cart.add(product, qty); setQty(1) }}
          >Add to Cart</button>
          <button
            className="btn btn-outline"
            style={{ flex:1, padding:'11px 8px', fontSize:9 }}
            onClick={() => onOpenModal(product)}
          >Details</button>
        </div>
      </div>
    </article>
  )
}
