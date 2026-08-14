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
            Your LLM traffic is needlessly scattered across expensive cloud endpoints.<br/>
            NEOVERSE dynamically intercepts and processes edge workloads on<br/>
            Arm infrastructure, maximizing enterprise Performance-per-Watt.
          </p>
          <button className="primary-cta anim-fade-up" style={{ animationDelay: '1000ms' }} onClick={onEnter}>
            <div className="primary-cta-inner-bg"></div>
            <span className="label">Enter Dashboard</span>
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
            By deploying an Oracle Ampere A1 gateway in front of the cloud, <br/>
            we mathematically classify incoming API traffic. Trivial workloads <br/>
            are executed locally using an optimized INT4 model (via KleidiAI), <br/>
            while complex reasoning tasks are safely proxied to the cloud.
          </p>
          <button className="primary-cta anim-fade-up" style={{ animationDelay: '500ms' }} onClick={onEnter}>
            <div className="primary-cta-inner-bg"></div>
            <span className="label">Initialize Gateway</span>
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
            Routing to local Arm64 edge nodes eliminates API tokens for <br/>
            a massive subset of your traffic. Cache hits resolve in 0ms, and local <br/>
            generation resolves at hardware speed. You only pay for the deep <br/>
            reasoning tasks that actually require a cloud GPU.
          </p>
          <button className="primary-cta anim-fade-up" style={{ animationDelay: '500ms' }} onClick={onEnter}>
            <div className="primary-cta-inner-bg"></div>
            <span className="label">View Telemetry</span>
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
