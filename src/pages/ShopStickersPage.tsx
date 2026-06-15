export default function ShopStickersPage() {
  return (
    <>
      <section style={{ background: 'var(--cream)', padding: '120px 0 72px', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>Coming Soon</span>
          <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: .95 }}>Shop Stickers</h1>
          <p className="lead" style={{ margin: '24px auto 0' }}>
            Affirmation stickers designed to inspire, remind, and uplift. Dropping soon.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)', textAlign: 'center' }}>
        <div className="wrap">
          <div style={{
            maxWidth: 480, margin: '0 auto',
            padding: '72px 40px', border: '1px solid var(--line)',
            background: 'var(--ivory)',
          }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 64, display: 'block', marginBottom: 28, color: 'var(--champagne)', lineHeight: 1 }}>✦</span>
            <h2 style={{ fontSize: 32, marginBottom: 16 }}>Something beautiful is on its way.</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 36 }}>
              Our sticker collection is being crafted with care. Follow us on Instagram and TikTok{' '}
              <strong>@lumiacandles</strong> to be the first to know when they drop.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <a
                href="https://instagram.com/lumiacandles"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark"
              >Instagram</a>
              <a
                href="https://tiktok.com/@lumiacandles"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >TikTok</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
