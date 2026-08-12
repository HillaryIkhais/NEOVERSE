export default function Landing({ onEnter }) {
  return (
    <div className="screen">
      <header className="header">
        <div className="brand" aria-label="ARM-TRIAGE home">
          <svg width="25" height="25" viewBox="0 0 25 25">
            <clipPath id="circle-clip">
              <circle cx="12.5" cy="12.5" r="12.5" />
            </clipPath>
            <g clipPath="url(#circle-clip)">
              <circle cx="12.5" cy="12.5" r="12.5" fill="#ededed"/>
              <path d="M12.5 0 L25 12.5 L12.5 25 L0 12.5 Z" fill="#050606"/>
              <path d="M12.5 5 L20 12.5 L12.5 20 L5 12.5 Z" fill="#737778"/>
              <path d="M12.5 10 L15 12.5 L12.5 15 L10 12.5 Z" fill="#fafafa"/>
            </g>
          </svg>
        </div>
        
        <div className="time-panel">
          <span className="label">ARM-TRIAGE</span>
          <span className="value">Oracle Cloud Ampere A1</span>
        </div>
      </header>
      
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="line line-one"><span className="line-reveal">Stop Sending</span></span>
            <span className="line line-two"><span className="line-reveal">Everything To The Cloud.</span></span>
          </h1>
          <p className="hero-copy">
            Your inference queries are scattered across expensive endpoints.<br/>
            ARM-TRIAGE routes them locally to Arm64 first, so every<br/>
            decision is backed by efficiency you actually trust.
          </p>
          <button className="primary-cta" onClick={onEnter}>
            <span className="label">Enter Dashboard</span>
            <div className="arrow-box">
              <svg viewBox="0 0 14 14" width="14" height="14" stroke="white" strokeWidth="1.5" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4"/>
              </svg>
            </div>
          </button>
        </div>
        
        <article className="demo-card">
          <div className="demo-visual">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" alt="Abstract red and blue smoke" />
          </div>
        </article>
      </section>
    </div>
  )
}
