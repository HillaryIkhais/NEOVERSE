import { useState } from 'react'

export default function Landing({ onEnter }) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="screen">
      <header className="header anim-fade-up" style={{ animationDelay: '0ms' }}>
        <nav className="nav">
          <a href="#" className={activeTab === 'overview' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('overview') }}>Overview</a>
          <a href="#" className={activeTab === 'architecture' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('architecture') }}>Architecture</a>
          <a href="#" className={activeTab === 'benchmarks' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('benchmarks') }}>Benchmarks</a>
          <a href="#">GitHub</a>
        </nav>
        
        <div className="time-panel">
          <span className="label">NEOVERSE</span>
          <span className="value">Oracle Cloud Ampere A1</span>
        </div>
      </header>
      
      <section className="hero tab-container">
        {/* OVERVIEW TAB */}
        <div className={`hero-content tab-content ${activeTab === 'overview' ? 'tab-active' : 'tab-hidden'}`}>
          <h1 className="hero-title">
            <span className="line line-one" style={{ overflow: 'hidden' }}><span className="line-reveal anim-text-reveal" style={{ display: 'inline-block', animationDelay: '300ms' }}>Stop Sending</span></span>
            <span className="line line-two" style={{ overflow: 'hidden' }}><span className="line-reveal anim-text-reveal" style={{ display: 'inline-block', animationDelay: '500ms' }}>Everything To The Cloud.</span></span>
          </h1>
          <p className="hero-copy anim-fade-up" style={{ animationDelay: '800ms' }}>
            Your API queries are currently being routed to expensive cloud models.<br/>
            NEOVERSE intercepts simple queries and runs them locally on an Arm node,<br/>
            saving you money and reducing latency.
          </p>
          <button className="primary-cta anim-fade-up" style={{ animationDelay: '1000ms' }} onClick={onEnter}>
            <div className="primary-cta-inner-bg"></div>
            <span className="label">Open Dashboard</span>
            <div className="arrow-box">
              <svg viewBox="0 0 14 14" width="14" height="14" stroke="black" strokeWidth="1.5" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4"/>
              </svg>
            </div>
          </button>
        </div>

        {/* ARCHITECTURE TAB */}
        <div className={`hero-content tab-content ${activeTab === 'architecture' ? 'tab-active' : 'tab-hidden'}`}>
          <h1 className="hero-title" style={{ fontSize: '3rem' }}>
            <span className="line line-one" style={{ overflow: 'hidden' }}><span className="line-reveal anim-text-reveal" style={{ display: 'inline-block', animationDelay: '100ms' }}>Intelligent Interception.</span></span>
          </h1>
          <p className="hero-copy anim-fade-up" style={{ animationDelay: '300ms' }}>
            By placing an Arm node in front of the cloud, we instantly check if a<br/>
            query is simple or complex. Simple queries are handled locally for free,<br/>
            and complex ones are seamlessly passed to the cloud.
          </p>
          <button className="primary-cta anim-fade-up" style={{ animationDelay: '500ms' }} onClick={onEnter}>
            <div className="primary-cta-inner-bg"></div>
            <span className="label">Test the Router</span>
            <div className="arrow-box">
              <svg viewBox="0 0 14 14" width="14" height="14" stroke="black" strokeWidth="1.5" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4"/>
              </svg>
            </div>
          </button>
        </div>

        {/* BENCHMARKS TAB */}
        <div className={`hero-content tab-content ${activeTab === 'benchmarks' ? 'tab-active' : 'tab-hidden'}`}>
          <h1 className="hero-title" style={{ fontSize: '3rem' }}>
            <span className="line line-one" style={{ overflow: 'hidden' }}><span className="line-reveal anim-text-reveal" style={{ display: 'inline-block', animationDelay: '100ms' }}>Zero API Cost.</span></span>
          </h1>
          <p className="hero-copy anim-fade-up" style={{ animationDelay: '300ms' }}>
            Running inference locally on an Arm node completely eliminates API costs<br/>
            for many of your queries. Cache hits resolve in 0ms, and local generation<br/>
            is incredibly fast. You only pay for what you actually need to send to the cloud.
          </p>
          <button className="primary-cta anim-fade-up" style={{ animationDelay: '500ms' }} onClick={onEnter}>
            <div className="primary-cta-inner-bg"></div>
            <span className="label">See The Savings</span>
            <div className="arrow-box">
              <svg viewBox="0 0 14 14" width="14" height="14" stroke="black" strokeWidth="1.5" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4"/>
              </svg>
            </div>
          </button>
        </div>
      </section>
    </div>
  )
}
