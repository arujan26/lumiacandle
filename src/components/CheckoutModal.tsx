import { useState } from 'react'
import { useCart, cart } from '../lib/cart'
import { submitOrder } from '../lib/orders'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CheckoutModal({ open, onClose }: Props) {
  const items = useCart()
  const total = cart.total()
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const get = (k: string) => (fd.get(k) as string) || ''

    if (!get('name') || !get('email') || !get('address') || !get('city') || !get('zip')) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError('')

    const { error: submitError } = await submitOrder({
      name: get('name'),
      email: get('email'),
      phone: get('phone'),
      preferred_contact: get('contact') || 'Email',
      address: get('address'),
      city: get('city'),
      state: get('state'),
      zip: get('zip'),
      country: get('country') || 'United States',
      notes: get('notes'),
      items,
      subtotal: total,
    })

    setLoading(false)

    if (submitError) {
      setError('Something went wrong. Please try again or contact us directly.')
      return
    }

    cart.clear()
    setSuccess(true)
  }

  const handleClose = () => {
    setSuccess(false)
    setError('')
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div onClick={handleClose} style={{
        position:'fixed', inset:0, zIndex:985,
        background:'rgba(26,20,16,.6)', backdropFilter:'blur(8px)',
      }}/>
      <div style={{
        position:'fixed', inset:0, zIndex:990,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:24, overflowY:'auto',
      }}>
        <div style={{
          background:'var(--white)', width:'100%', maxWidth:700,
          padding:52, position:'relative', maxHeight:'90vh', overflowY:'auto',
        }}>
          <button onClick={handleClose} style={{
            position:'absolute', top:20, right:20, width:36, height:36,
            display:'flex', alignItems:'center', justifyContent:'center',
            border:'1px solid var(--line)', background:'none', cursor:'pointer',
            fontSize:20, color:'var(--muted)',
          }}>✕</button>

          {success ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div style={{ fontSize:64, marginBottom:24, opacity:.7 }}>✦</div>
              <h3 style={{ fontSize:36, marginBottom:16 }}>Order Received</h3>
              <p style={{ marginBottom:28 }}>
                Thank you! We'll reach out to confirm shipping and payment details before processing your order.
              </p>
              <button className="btn btn-gold" onClick={handleClose}>Continue Shopping</button>
            </div>
          ) : (
            <>
              <h2 style={{ marginBottom:8, fontSize:42 }}>Your Order</h2>
              <p style={{ marginBottom:36 }}>Fill in your details and we'll confirm shipping before charging.</p>

              <div style={{ background:'var(--cream)', padding:24, marginBottom:28 }}>
                <h4 style={{ marginBottom:16, fontSize:18 }}>Order Summary</h4>
                {items.map(item => (
                  <div key={item.product.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(90,65,45,.1)', fontSize:14 }}>
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>${item.product.price * item.quantity}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', paddingTop:14, borderTop:'1px solid var(--line)', fontFamily:'var(--serif)', fontSize:24 }}>
                  <span>Subtotal</span>
                  <span>${total}</span>
                </div>
              </div>

              <div style={{ fontSize:12, color:'var(--muted)', background:'rgba(180,148,90,.08)', border:'1px solid rgba(180,148,90,.2)', padding:'12px 16px', marginBottom:20, lineHeight:1.6 }}>
                📦 Shipping is paid by the customer and confirmed separately. You will not be charged until we contact you with the final shipping cost.
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                  {[
                    { id:'name', label:'Full Name *', type:'text', placeholder:'Your full name', required:true, colSpan:false },
                    { id:'email', label:'Email Address *', type:'email', placeholder:'you@email.com', required:true, colSpan:false },
                    { id:'phone', label:'Phone Number', type:'tel', placeholder:'(000) 000-0000', required:false, colSpan:false },
                  ].map(f => (
                    <div key={f.id} style={f.colSpan ? { gridColumn:'1/-1' } : {}}>
                      <label style={{ fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', fontWeight:500, color:'var(--muted)', display:'block', marginBottom:6 }}>{f.label}</label>
                      <input name={f.id} id={f.id} type={f.type} placeholder={f.placeholder} required={f.required}
                        style={{ width:'100%', padding:'12px 14px', border:'1px solid var(--line)', background:'var(--ivory)', fontSize:14, fontWeight:300, color:'var(--ink)', outline:'none', borderRadius:0, fontFamily:'var(--sans)' }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', fontWeight:500, color:'var(--muted)', display:'block', marginBottom:6 }}>Preferred Contact</label>
                    <select name="contact" style={{ width:'100%', padding:'12px 14px', border:'1px solid var(--line)', background:'var(--ivory)', fontSize:14, color:'var(--ink)', outline:'none', borderRadius:0, appearance:'none' }}>
                      <option>Email</option>
                      <option>Phone / SMS</option>
                      <option>Instagram DM</option>
                    </select>
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={{ fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', fontWeight:500, color:'var(--muted)', display:'block', marginBottom:6 }}>Shipping Address *</label>
                    <input name="address" type="text" required placeholder="Street address"
                      style={{ width:'100%', padding:'12px 14px', border:'1px solid var(--line)', background:'var(--ivory)', fontSize:14, fontWeight:300, color:'var(--ink)', outline:'none', borderRadius:0, fontFamily:'var(--sans)' }}
                    />
                  </div>
                  {[
                    { id:'city', label:'City *', placeholder:'City', required:true },
                    { id:'state', label:'State', placeholder:'State', required:false },
                    { id:'zip', label:'ZIP Code *', placeholder:'ZIP', required:true },
                    { id:'country', label:'Country', placeholder:'Country', required:false },
                  ].map(f => (
                    <div key={f.id}>
                      <label style={{ fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', fontWeight:500, color:'var(--muted)', display:'block', marginBottom:6 }}>{f.label}</label>
                      <input name={f.id} type="text" required={f.required} placeholder={f.placeholder} defaultValue={f.id === 'country' ? 'United States' : ''}
                        style={{ width:'100%', padding:'12px 14px', border:'1px solid var(--line)', background:'var(--ivory)', fontSize:14, fontWeight:300, color:'var(--ink)', outline:'none', borderRadius:0, fontFamily:'var(--sans)' }}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={{ fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', fontWeight:500, color:'var(--muted)', display:'block', marginBottom:6 }}>Order Notes</label>
                    <textarea name="notes" placeholder="Gift message, special instructions, or questions..." rows={3}
                      style={{ width:'100%', padding:'12px 14px', border:'1px solid var(--line)', background:'var(--ivory)', fontSize:14, fontWeight:300, color:'var(--ink)', outline:'none', borderRadius:0, fontFamily:'var(--sans)', resize:'vertical' }}
                    />
                  </div>
                </div>

                {error && <p style={{ color:'#c04a3a', fontSize:13, marginBottom:12 }}>{error}</p>}

                <button className="btn btn-gold" type="submit" style={{ width:'100%' }} disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit Order Request'}
                </button>
                <p style={{ fontSize:12, color:'var(--muted-light)', textAlign:'center', marginTop:12, lineHeight:1.6 }}>
                  By submitting, you confirm your order request. We will contact you to confirm shipping and payment before processing.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
