import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <>
      <section style={{ background: 'var(--cream)', padding: '120px 0 80px', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>Our Story</span>
          <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: .95 }}>About Us</h1>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="wrap" style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="about-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start', marginBottom: 96 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(32px,3.5vw,48px)', marginBottom: 28, lineHeight: 1 }}>
                We believe a candle can hold space for a feeling.
              </h2>
            </div>
            <div>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 20 }}>
                Lumia was born from a simple belief: that scent has the power to hold space for a feeling. Every candle in our collection is named after an emotion — a feeling you want to sit with, release, or step into.
              </p>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8 }}>
                We hand-pour every candle in small batches using a premium coconut-soy wax blend and wooden wicks. No shortcuts. No fillers. Just intentional, slow-crafted scent experiences designed to support you through your most meaningful moments.
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 80, marginBottom: 80 }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span className="eyebrow" style={{ marginBottom: 12, display: 'block' }}>What We Stand For</span>
              <h2 style={{ fontSize: 'clamp(28px,3.5vw,42px)' }}>Made with intention.</h2>
            </div>
            <div className="about-pillars" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
              {[
                { label: 'Small-Batch Crafted', body: 'Every candle is hand-poured in small batches to ensure quality and care in every pour.' },
                { label: 'Clean Ingredients', body: 'We use a premium coconut-soy wax blend with wooden wicks — no paraffin, no compromise.' },
                { label: 'Emotion-Led Design', body: 'Each scent is intentionally named and blended around a feeling — because how a candle makes you feel matters most.' },
              ].map(item => (
                <div key={item.label}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 40, color: 'var(--champagne)', display: 'block', marginBottom: 20, lineHeight: 1 }}>✦</span>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 12 }}>{item.label}</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="about-split" style={{
            borderTop: '1px solid var(--line)', paddingTop: 80,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
          }}>
            <div>
              <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>The Vision</span>
              <h2 style={{ fontSize: 'clamp(28px,3.5vw,42px)', marginBottom: 24 }}>
                Light one. Feel something.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 20 }}>
                Lumia is more than a candle brand — it's a reminder that your emotions deserve to be honored. Whether you're releasing what no longer serves you, finding safety in the present, affirming your worth, or stepping into a new chapter — there is a candle for that moment.
              </p>
              <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 36 }}>
                We exist to turn ordinary moments into rituals of self-care, healing, and intention.
              </p>
              <Link to="/shop/candles" className="btn btn-dark">Shop the Collection</Link>
            </div>
            <div style={{ background: 'var(--cream)', padding: 48, textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 80, color: 'var(--champagne)', display: 'block', lineHeight: 1, marginBottom: 20 }}>Lumia</span>
              <p style={{ fontSize: 12, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Hand-poured · Small-batch · Intentional
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
