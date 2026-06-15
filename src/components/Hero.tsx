export default function Hero() {
  return (
    <section id="hero" style={{
      position:'relative', minHeight:'100svh',
      display:'flex', alignItems:'center', overflow:'hidden',
    }}>
      {/* Hero background photo */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:'url(/hero.jpg)',
        backgroundSize:'cover',
        backgroundPosition:'center 40%',
      }}/>
      {/* Dark overlay — left-heavy so text stays readable */}
      <div style={{
        position:'absolute', inset:0,
        background:'linear-gradient(100deg,rgba(26,20,16,.72) 0%,rgba(26,20,16,.45) 50%,rgba(26,20,16,.15) 100%)',
      }}/>

      <div className="wrap" style={{ position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:760, padding:'clamp(100px,14vw,180px) 0 clamp(80px,10vw,140px)' }}>
          <span className="eyebrow" style={{ color:'var(--champagne)', marginBottom:24, display:'block' }}>
            Lumia Candles
          </span>
          <h1 style={{ color:'var(--white)', marginBottom:28, lineHeight:.92 }}>
            Candles for the<br/>
            <em style={{ fontStyle:'italic', color:'var(--champagne)' }}>feeling</em> you're ready<br/>
            to step into.
          </h1>
          <p style={{
            color:'rgba(255,253,248,.78)', fontSize:'clamp(15px,1.6vw,19px)',
            lineHeight:1.75, maxWidth:480, fontWeight:300, marginBottom:44,
          }}>
            Luxury scented candles designed around emotions, soft rituals, and intentional moments.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
            <a href="#shop" className="btn btn-ghost">Shop All Candles</a>
            <a href="#emotions" className="btn btn-outline" style={{ color:'var(--white)', borderColor:'rgba(255,255,255,.4)' }}>
              Find Your Scent
            </a>
          </div>
        </div>
      </div>

      <div style={{
        position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)', zIndex:1,
        display:'flex', flexDirection:'column', alignItems:'center', gap:8,
        color:'rgba(255,253,248,.55)', fontSize:9, letterSpacing:'.25em', textTransform:'uppercase',
      }}>
        Scroll
        <span style={{ display:'block', width:1, height:40, background:'rgba(255,253,248,.35)' }}/>
      </div>
    </section>
  )
}
