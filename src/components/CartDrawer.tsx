import { useCart, cart } from '../lib/cart'

interface Props {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}

export default function CartDrawer({ open, onClose, onCheckout }: Props) {
  const items = useCart()
  const total = cart.total()

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, zIndex:980,
          background:'rgba(26,20,16,.45)', backdropFilter:'blur(4px)',
          opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
          transition:'opacity .35s',
        }}
      />
      <aside style={{
        position:'fixed', top:0, right:0, bottom:0, zIndex:990,
        width:'min(440px,100vw)', background:'var(--white)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform .45s var(--ease)',
        display:'flex', flexDirection:'column',
        boxShadow:'-20px 0 80px rgba(26,20,16,.15)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 28px', borderBottom:'1px solid var(--line)' }}>
          <h3 style={{ fontSize:22 }}>Your Cart</h3>
          <button onClick={onClose} style={{
            width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center',
            border:'1px solid var(--line)', background:'none', cursor:'pointer', fontSize:18, color:'var(--muted)',
          }}>✕</button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
          {items.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16, textAlign:'center', color:'var(--muted)' }}>
              <span style={{ fontSize:48, opacity:.3 }}>🕯</span>
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} style={{ display:'flex', gap:16, padding:'20px 0', borderBottom:'1px solid var(--line)' }}>
                <div style={{
                  width:72, height:90, flexShrink:0,
                  backgroundColor: 'var(--cream)',
                  backgroundImage: item.product.image_url ? `url(${item.product.image_url})` : 'none',
                  backgroundSize:'cover', backgroundPosition:'center',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {!item.product.image_url && <span style={{ fontFamily:'var(--serif)', fontSize:24, color:'var(--champagne)', opacity:.5 }}>✦</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:20, marginBottom:2 }}>{item.product.name}</div>
                  <div style={{ fontSize:11, color:'var(--gold)', letterSpacing:'.08em', marginBottom:8 }}>{item.product.fragrance}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontFamily:'var(--serif)', fontSize:18 }}>${item.product.price * item.quantity}</span>
                    <div style={{ display:'flex', alignItems:'center', border:'1px solid var(--line)' }}>
                      <button style={{ width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', fontSize:14, cursor:'pointer' }}
                        onClick={() => cart.updateQty(item.product.id, item.quantity - 1)}>−</button>
                      <span style={{ width:26, height:26, lineHeight:'26px', textAlign:'center', fontSize:12 }}>{item.quantity}</span>
                      <button style={{ width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'none', fontSize:14, cursor:'pointer' }}
                        onClick={() => cart.updateQty(item.product.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button
                    onClick={() => cart.remove(item.product.id)}
                    style={{ fontSize:10, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--muted-light)', cursor:'pointer', background:'none', border:'none', marginTop:8, display:'block' }}
                  >Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding:'24px 28px', borderTop:'1px solid var(--line)' }}>
            <div style={{ background:'var(--cream)', padding:'12px 16px', fontSize:12, color:'var(--muted)', marginBottom:20, lineHeight:1.6 }}>
              📦 Shipping is paid separately — we'll confirm the cost before processing.
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:16 }}>
              <span style={{ fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--muted)', fontWeight:500 }}>Subtotal</span>
              <strong style={{ fontFamily:'var(--serif)', fontSize:28 }}>${total}</strong>
            </div>
            <button className="btn btn-gold" style={{ width:'100%', marginBottom:10 }} onClick={onCheckout}>
              Proceed to Checkout
            </button>
            <button className="continue-shopping" onClick={onClose}
              style={{ fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--muted)', textAlign:'center', display:'block', cursor:'pointer', background:'none', border:'none', width:'100%' }}>
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
