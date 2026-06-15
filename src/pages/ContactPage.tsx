export default function ContactPage() {
  return (
    <>
      <section style={{ background: 'var(--cream)', padding: '120px 0 80px', textAlign: 'center' }}>
        <div className="wrap">
          <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>Get in Touch</span>
          <h1 style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: .95 }}>Contact</h1>
          <p className="lead" style={{ margin: '24px auto 0' }}>
            We'd love to hear from you. Reach us anytime.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="wrap" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, marginBottom: 80 }}>
            {[
              {
                icon: '✉',
                label: 'Email',
                value: 'lumiacandles@gmail.com',
                href: 'mailto:lumiacandles@gmail.com',
                cta: 'Send an email',
              },
              {
                icon: '◎',
                label: 'TikTok',
                value: '@lumiacandles',
                href: 'https://tiktok.com/@lumiacandles',
                cta: 'Follow on TikTok',
              },
              {
                icon: '◈',
                label: 'Instagram',
                value: '@lumiacandles',
                href: 'https://instagram.com/lumiacandles',
                cta: 'Follow on Instagram',
              },
            ].map(c => (
              <div key={c.label} style={{
                background: 'var(--ivory)', border: '1px solid var(--line)',
                padding: '48px 32px', textAlign: 'center',
              }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 36, display: 'block', marginBottom: 20, color: 'var(--champagne)' }}>
                  {c.icon}
                </span>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 8 }}>{c.label}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.5 }}>{c.value}</p>
                <a
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="btn btn-outline"
                  style={{ display: 'inline-block', fontSize: 9, padding: '10px 20px' }}
                >
                  {c.cta}
                </a>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid var(--line)', paddingTop: 72, textAlign: 'center',
          }}>
            <span className="eyebrow" style={{ marginBottom: 16, display: 'block' }}>Response Time</span>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', marginBottom: 20 }}>We reply within 24–48 hours.</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto' }}>
              For order questions, wholesale inquiries, or just to say hi — we're here. Every message is read and replied to personally.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
