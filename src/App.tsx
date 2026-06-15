import { useState } from 'react'
import './index.css'
import { cart } from './lib/cart'
import Header from './components/Header'
import Hero from './components/Hero'
import ProductCard from './components/ProductCard'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import { PRODUCTS } from './lib/products'
import type { Product } from './types'

const EMOTIONS = [
  { label: 'I need to let go', sub: 'Release · Strawberry Guava & Coconut Lime', idx: 0 },
  { label: 'I need clarity', sub: 'Clarity · Sea Salt Orchid & Magnolia Peony', idx: 1 },
  { label: 'I need a fresh start', sub: 'Renewal · Lemongrass Lime & Garden Mint', idx: 2 },
  { label: 'I need to feel enough', sub: 'Self-Worth · Papaya Paradise & Mango', idx: 3 },
]

const REVIEWS = [
  { text: '"Let Go changed my entire evening ritual. I light it after hard days and it genuinely helps me release."', author: 'Sofia M. — Miami, FL', stars: 5 },
  { text: '"I Am Sage is the most beautiful scent I\'ve ever experienced. It smells like clarity feels."', author: 'Kezia A. — Brooklyn, NY', stars: 5 },
  { text: '"New Beginning got me through my divorce. Sounds dramatic but it\'s true. Every first morning with that candle."', author: 'Rachel T. — Austin, TX', stars: 5 },
]

const WHY_ITEMS = [
  { num: '01', title: 'Emotion-First Design', text: 'Every scent is built around a specific emotional state — not just a fragrance profile. We start with how you want to feel.' },
  { num: '02', title: 'Clean, Intentional Craft', text: 'Small-batch, hand-poured in premium wax with wood wicks for a cleaner, quieter burn.' },
  { num: '03', title: 'Ritual, Not Decoration', text: 'These candles are made to be used as tools for your emotional life. Light one with intention.' },
]

const FAQS = [
  { q: 'How much is each candle?', a: 'Each candle is $35. All four emotional candles — Let Go, I Am Sage, New Beginning, and You Are Enough — are the same price.' },
  { q: 'What wax and wick are used?', a: 'Lumia candles are made with a premium wax blend and wood wicks for a clean, slow, quiet burn. Each candle is 7 oz / 198g and hand-poured in small batches.' },
  { q: 'How long do they burn?', a: 'Each candle burns for approximately 45–55 hours with proper care. Always allow the wax to pool to the edges on the first burn.' },
  { q: 'Do you ship internationally?', a: 'We ship to the US and select international destinations. Shipping costs are confirmed with you before your order is processed.' },
  { q: 'Can I customize a candle?', a: 'Yes — use the Custom Candle Builder above to create a personalized candle with your choice of scent, vessel, and label.' },
]

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null)
  const [modal, setModal] = useState<Product | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleCheckout = () => {
    setCartOpen(false)
    setTimeout(() => setCheckoutOpen(true), 350)
  }

  return (
    <>
      <Header onCartOpen={() => setCartOpen(true)} />

      <main>
        <Hero />

        {/* Shop */}
        <section id="shop" className="section" style={{ background:'var(--white)' }}>
          <div className="wrap">
            <div className="products-header" style={{ textAlign:'center', maxWidth:560, margin:'0 auto 72px' }}>
              <span className="eyebrow" style={{ marginBottom:16, display:'block' }}>The Collection</span>
              <h2 style={{ marginBottom:20 }}>Four candles. Four feelings.</h2>
              <p>Each Lumia candle is designed around a specific emotional state — a feeling you're ready to invite in, or finally ready to release.</p>
            </div>
            <div className="products-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
              {PRODUCTS.map(p => (
                <ProductCard key={p.id} product={p} onOpenModal={setModal} />
              ))}
            </div>
          </div>
        </section>

        {/* Emotion Finder */}
        <section id="emotions" className="section" style={{ background:'var(--cream)' }}>
          <div className="wrap">
            <div style={{ maxWidth:780, margin:'0 auto', textAlign:'center' }}>
              <span className="eyebrow" style={{ marginBottom:16, display:'block' }}>Find Your Scent</span>
              <h2 style={{ marginBottom:16 }}>What are you feeling right now?</h2>
              <p style={{ marginBottom:52 }}>Don't choose a fragrance — choose a feeling. We'll match you to the right candle.</p>
              <div className="emotion-options" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:48 }}>
                {EMOTIONS.map(e => (
                  <button key={e.idx}
                    onClick={() => setSelectedEmotion(e.idx === selectedEmotion ? null : e.idx)}
                    style={{
                      padding:'22px 24px', fontFamily:'var(--serif)', fontSize:20, cursor:'pointer',
                      textAlign:'left', transition:'all .3s var(--ease)',
                      background: selectedEmotion === e.idx ? 'var(--ink)' : 'var(--ivory)',
                      color: selectedEmotion === e.idx ? 'var(--white)' : 'var(--ink)',
                      border: `1px solid ${selectedEmotion === e.idx ? 'var(--ink)' : 'var(--line)'}`,
                      transform: selectedEmotion === e.idx ? 'none' : undefined,
                    }}
                  >
                    {e.label}
                    <small style={{ display:'block', fontFamily:'var(--sans)', fontSize:11, color: selectedEmotion === e.idx ? 'var(--champagne)' : 'var(--gold)', letterSpacing:'.1em', marginTop:4, fontWeight:400 }}>
                      {e.sub}
                    </small>
                  </button>
                ))}
              </div>
              {selectedEmotion !== null && (
                <div style={{ background:'var(--white)', border:'1px solid var(--line)', padding:36, textAlign:'left', animation:'fadeIn .4s var(--ease)' }}>
                  <div style={{ display:'flex', gap:32, alignItems:'center' }}>
                    <div style={{ width:160, height:200, flexShrink:0, background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontFamily:'var(--serif)', fontSize:64, color:'var(--champagne)', opacity:.4 }}>✦</span>
                    </div>
                    <div>
                      <h3 style={{ marginBottom:8 }}>{PRODUCTS[selectedEmotion].name}</h3>
                      <p style={{ fontSize:11, color:'var(--gold)', letterSpacing:'.1em', marginBottom:12, fontWeight:400 }}>{PRODUCTS[selectedEmotion].fragrance}</p>
                      <p style={{ marginBottom:20, fontSize:14 }}>{PRODUCTS[selectedEmotion].description}</p>
                      <button className="btn btn-dark" onClick={() => setModal(PRODUCTS[selectedEmotion])}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why Lumia */}
        <section id="why" className="section" style={{ background:'var(--ink)', color:'var(--white)' }}>
          <div className="wrap">
            <span className="eyebrow" style={{ color:'var(--champagne)', marginBottom:16, display:'block' }}>Why Lumia</span>
            <h2 style={{ color:'var(--white)', maxWidth:500 }}>Candles made with purpose, not just fragrance.</h2>
            <div className="why-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'rgba(255,253,248,.08)', marginTop:60 }}>
              {WHY_ITEMS.map(w => (
                <div key={w.num} style={{ background:'var(--ink)', padding:'44px 36px' }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:56, color:'var(--champagne)', opacity:.4, marginBottom:16, lineHeight:1 }}>{w.num}</div>
                  <h4 style={{ color:'var(--white)', marginBottom:12, fontSize:22 }}>{w.title}</h4>
                  <p style={{ color:'rgba(255,253,248,.65)' }}>{w.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews" className="section" style={{ background:'var(--cream)' }}>
          <div className="wrap">
            <div className="reviews-header" style={{ textAlign:'center', maxWidth:520, margin:'0 auto 60px' }}>
              <span className="eyebrow" style={{ marginBottom:16, display:'block' }}>Real Stories</span>
              <h2>What they're feeling</h2>
            </div>
            <div className="reviews-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
              {REVIEWS.map((r, i) => (
                <div key={i} style={{ background:'var(--white)', padding:36, border:'1px solid var(--line)' }}>
                  <div style={{ color:'var(--gold)', letterSpacing:2, marginBottom:16, fontSize:14 }}>{'★'.repeat(r.stars)}</div>
                  <p style={{ fontFamily:'var(--serif)', fontSize:20, lineHeight:1.4, color:'var(--ink)', marginBottom:20, fontStyle:'italic' }}>{r.text}</p>
                  <p style={{ fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--muted)', fontWeight:500 }}>{r.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shipping */}
        <section id="shipping" className="section" style={{ background:'var(--white)' }}>
          <div className="wrap">
            <div className="shipping-inner" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'start' }}>
              <div>
                <span className="eyebrow" style={{ marginBottom:16, display:'block' }}>Shipping</span>
                <h2 style={{ marginBottom:20 }}>Delivered with care</h2>
                <p>All orders are hand-packed and shipped with care. Shipping costs are calculated based on your location and confirmed before your order is processed.</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:36 }}>
                {[
                  { icon:'📦', title:'Standard Shipping', desc:'5–8 business days · Cost confirmed at checkout' },
                  { icon:'⚡', title:'Expedited Shipping', desc:'2–3 business days · Available for most US locations' },
                  { icon:'🌍', title:'International', desc:'10–21 business days · Select countries' },
                ].map(s => (
                  <div key={s.title} style={{ display:'flex', gap:20, padding:20, border:'1px solid var(--line)', background:'var(--ivory)' }}>
                    <div style={{ width:40, height:40, background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>{s.icon}</div>
                    <div>
                      <h4 style={{ fontSize:16, marginBottom:4 }}>{s.title}</h4>
                      <p style={{ fontSize:13 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section" style={{ background:'var(--ivory)' }}>
          <div className="wrap">
            <div className="faq-inner" style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:80, alignItems:'start' }}>
              <div>
                <span className="eyebrow" style={{ marginBottom:16, display:'block' }}>FAQ</span>
                <h2>Questions</h2>
              </div>
              <div>
                {FAQS.map((faq, i) => (
                  <div key={i} style={{ borderBottom:'1px solid var(--line)' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{ width:'100%', textAlign:'left', padding:'20px 0', fontFamily:'var(--serif)', fontSize:20, color:'var(--ink)', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', fontWeight:400 }}
                    >
                      {faq.q}
                      <span style={{ fontSize:22, color:'var(--champagne)', transition:'transform .3s', transform: openFaq === i ? 'rotate(45deg)' : 'none', flexShrink:0 }}>+</span>
                    </button>
                    {openFaq === i && (
                      <div style={{ padding:'0 0 20px', fontSize:14, color:'var(--muted)', lineHeight:1.75 }}>{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Care */}
        <section id="care" className="section" style={{ background:'var(--cream)' }}>
          <div className="wrap">
            <div style={{ textAlign:'center', maxWidth:520, margin:'0 auto 16px' }}>
              <span className="eyebrow" style={{ marginBottom:16, display:'block' }}>Candle Care</span>
              <h2>How to love your candle</h2>
            </div>
            <div className="care-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, marginTop:56 }}>
              {[
                { icon:'🕯', title:'First Burn Matters', text:'Allow wax to melt fully to the edges on the first burn. Prevents tunneling and extends life.' },
                { icon:'🔥', title:'Trim the Wick', text:'Trim to ¼ inch before each burn. A long wick causes mushrooming, soot, and uneven burning.' },
                { icon:'⏱', title:'Burn Time', text:'Burn no more than 4 hours at a time. Let the candle cool fully before re-lighting.' },
                { icon:'🌿', title:'Safe Extinguishing', text:"Use a snuffer to extinguish — never blow out. Keeps wick centered and prevents hot wax splatter." },
              ].map(c => (
                <div key={c.title} style={{ padding:'28px 24px', background:'var(--white)', border:'1px solid var(--line)' }}>
                  <div style={{ fontSize:28, marginBottom:16 }}>{c.icon}</div>
                  <h4 style={{ fontSize:18, marginBottom:10 }}>{c.title}</h4>
                  <p style={{ fontSize:14 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background:'var(--ink)', color:'var(--white)', padding:'60px 0' }}>
          <div className="wrap" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:24 }}>
            <div>
              <div style={{ fontFamily:'var(--serif)', fontSize:24, letterSpacing:'.14em', marginBottom:8 }}>Lumia</div>
              <p style={{ fontSize:12, color:'rgba(255,253,248,.5)', maxWidth:280 }}>Hand-poured emotional candles for intentional moments.</p>
            </div>
            <div style={{ display:'flex', gap:32 }}>
              {['#shop','#emotions','#why','#shipping','#faq'].map((href, i) => (
                <a key={href} href={href} style={{ fontSize:10, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,253,248,.55)', fontWeight:500 }}>
                  {['Shop','Find Yours','Why Lumia','Shipping','FAQ'][i]}
                </a>
              ))}
            </div>
          </div>
          <div className="wrap" style={{ marginTop:40, paddingTop:24, borderTop:'1px solid rgba(255,253,248,.1)', textAlign:'center' }}>
            <p style={{ fontSize:11, color:'rgba(255,253,248,.35)' }}>© 2025 Lumia Candles. All rights reserved.</p>
          </div>
        </footer>
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Product Modal */}
      {modal && (
        <>
          <div onClick={() => setModal(null)} style={{ position:'fixed', inset:0, zIndex:970, background:'rgba(26,20,16,.55)', backdropFilter:'blur(6px)' }}/>
          <div style={{ position:'fixed', inset:0, zIndex:975, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
            <div style={{ background:'var(--white)', width:'100%', maxWidth:900, maxHeight:'90vh', overflowY:'auto', display:'grid', gridTemplateColumns:'1fr 1fr', position:'relative' }}>
              <button onClick={() => setModal(null)} style={{
                position:'absolute', top:16, right:16, zIndex:2, width:36, height:36,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'var(--white)', border:'1px solid var(--line)', cursor:'pointer', fontSize:20, color:'var(--muted)',
              }}>✕</button>

              <div style={{ background:'var(--cream)', minHeight:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontFamily:'var(--serif)', fontSize:80, color:'var(--champagne)', opacity:.3 }}>✦</span>
              </div>

              <div style={{ padding:'44px 40px', overflowY:'auto' }}>
                <span style={{ color:'var(--gold)', fontSize:10, letterSpacing:'.25em', textTransform:'uppercase', fontWeight:500, marginBottom:10, display:'block' }}>
                  {modal.emotion}
                </span>
                <h2 style={{ fontFamily:'var(--serif)', fontSize:44, lineHeight:.95, marginBottom:8, letterSpacing:'-.025em' }}>{modal.name}</h2>
                <p style={{ fontSize:13, color:'var(--gold)', letterSpacing:'.08em', marginBottom:20 }}>{modal.fragrance}</p>
                <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.75, marginBottom:28 }}>{modal.description}</p>

                {modal.for_text && (
                  <>
                    <p style={{ fontSize:10, letterSpacing:'.2em', textTransform:'uppercase', fontWeight:500, color:'var(--muted)', marginBottom:10 }}>This candle is for</p>
                    <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.65, marginBottom:24 }}>{modal.for_text}</p>
                  </>
                )}

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24 }}>
                  {[
                    ['Weight', modal.size || '7 oz / 198g'],
                    ['Burn Time', modal.burn_time || '~45–55 hrs'],
                    ['Wax', modal.wax || 'Premium Blend'],
                    ['Made', 'Hand-Poured'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background:'var(--cream)', padding:'10px 14px' }}>
                      <span style={{ fontSize:9, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--muted)', fontWeight:500, display:'block', marginBottom:3 }}>{label}</span>
                      <strong style={{ fontSize:13, color:'var(--ink)', fontWeight:400 }}>{val}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, paddingTop:20, borderTop:'1px solid var(--line)' }}>
                  <span style={{ fontFamily:'var(--serif)', fontSize:34 }}>${modal.price}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <button className="btn btn-gold" style={{ width:'100%' }} onClick={() => { cart.add(modal); setModal(null) }}>
                    Add to Cart — ${modal.price}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
