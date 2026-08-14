import { useState, useEffect } from 'react'

const TypewriterText = ({ text }) => {
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    setDisplayedLength(0);
    const timer = setInterval(() => {
      setDisplayedLength(prev => {
        if (prev < text.length) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 15);
    return () => clearInterval(timer);
  }, [text]);

  return <>{text.substring(0, displayedLength)}</>;
}

export default function Dashboard({ onBack }) {
  const [prompt, setPrompt] = useState('')
  const [historyNaive, setHistoryNaive] = useState([])
  const [historyTriage, setHistoryTriage] = useState([])
  const [savings, setSavings] = useState(6240.50)
  const [isLoading, setIsLoading] = useState(false)
  const [bumpTicker, setBumpTicker] = useState(false)

  // Live global edge network simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate a global network intercepting requests: saves $0.02 - $0.08 every 800ms
      setSavings(prev => prev + (Math.random() * 0.06 + 0.02))
    }, 800)
    return () => clearInterval(interval)
  }, [])

  // Trigger ticker bump animation when user manually triggers a local save
  useEffect(() => {
    if (savings > 0) {
      setBumpTicker(true)
      const timer = setTimeout(() => setBumpTicker(false), 300)
      return () => clearTimeout(timer)
    }
  }, [bumpTicker])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    const currentPrompt = prompt
    setPrompt('')
    setIsLoading(true)

    // Optimistically add user messages
    const userMsg = { role: 'user', content: currentPrompt }
    setHistoryNaive(prev => [...prev, userMsg])
    setHistoryTriage(prev => [...prev, userMsg])

    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt })
      })

      if (!response.ok) {
        throw new Error('API Error')
      }

      const data = await response.json()
      
      // Update Savings (Add the user's specific local save to the global ticker)
      if (data.triage.cost_saved) {
        setSavings(prev => prev + data.triage.cost_saved)
        setBumpTicker(true) // trigger the flash animation manually
      }

      let triageMeta = ''
      let badgeClass = 'local'
      if (data.decision === 'LOCAL') {
        triageMeta = `Arm64 (${data.triage.engine}) | Latency: ${data.triage.latency_sec.toFixed(3)}s | ${data.triage.tps} TPS`
      } else if (data.decision === 'CACHE_HIT') {
        triageMeta = `CACHE_HIT (0ms)`
      } else if (data.decision === 'FALLBACK') {
        triageMeta = `Deterministic Rule: ${data.reasons[data.reasons.length - 1]}`
        badgeClass = 'fallback'
      } else {
        triageMeta = `CLOUD ROUTE: ${data.reasons[data.reasons.length - 1]}`
        badgeClass = 'cloud'
      }

      const naiveMeta = `Latency: ${data.naive.latency_sec.toFixed(2)}s`

      // Set Responses
      setHistoryNaive(prev => [...prev, {
        role: 'assistant',
        content: data.naive.text,
        meta: naiveMeta,
        badgeClass: 'cloud',
        badgeText: 'CLOUD',
        isError: false
      }])

      setHistoryTriage(prev => [...prev, {
        role: 'assistant',
        content: data.triage.text,
        meta: triageMeta,
        badgeClass: badgeClass,
        badgeText: data.decision,
        isError: data.decision === 'FALLBACK'
      }])

    } catch (error) {
      console.error(error)
      const errorMsg = {
        role: 'assistant',
        content: 'Connection to NEOVERSE API failed. Ensure the server is running.',
        meta: 'SYSTEM ERROR',
        badgeClass: 'fallback',
        badgeText: 'ERROR',
        isError: true
      }
      setHistoryNaive(prev => [...prev, errorMsg])
      setHistoryTriage(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header anim-fade" style={{ animationDelay: '0ms' }}>
        <div>
          <button className="back-button" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </button>
          <h1 className="dash-brand-title">NEOVERSE</h1>
          <p className="dash-brand-subtitle">Oracle Cloud Ampere A1 (aarch64) • vLLM • KleidiAI</p>
        </div>
        
        <div className={`savings-ticker ${bumpTicker ? 'bump' : ''}`}>
          <span className="ticker-label">Live Global Savings (Edge Network)</span>
          <span className="ticker-value">${savings.toLocaleString('en-US', {minimumFractionDigits: 4, maximumFractionDigits: 4})}</span>
        </div>
      </div>

      <div className="split-screen">
        {/* Naive Panel */}
        <div className="panel naive anim-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="panel-header naive-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
              Standard Cloud Gateway
            </h2>
            <p className="panel-subtitle">Unoptimized Direct-to-Cloud Routing (Baseline)</p>
          </div>
          
          <div className="chat-history">
            {historyNaive.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                </div>
                <h3>Standard Ingress (Unoptimized)</h3>
                <p>All inference requests bypass local edge infrastructure and route directly to primary cloud endpoints, resulting in maximum API spend and baseline network latency.</p>
                <div className="suggested-prompts">
                  <button className="suggested-btn" onClick={() => setPrompt('Extract the names and emails from this text block.')}>
                    "Extract the names and emails from this text block."
                  </button>
                  <button className="suggested-btn" onClick={() => setPrompt('Translate this welcome message to French.')}>
                    "Translate this welcome message to French."
                  </button>
                </div>
              </div>
            ) : (
              historyNaive.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="content">
                    {msg.role === 'assistant' ? <TypewriterText text={msg.content} /> : msg.content}
                  </div>
                  {msg.meta && (
                    <div className="meta">
                      <span className={`meta-badge ${msg.badgeClass}`}>{msg.badgeText}</span>
                      <span>{msg.meta}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Triage Panel */}
        <div className="panel triage anim-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="panel-header triage-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              NEOVERSE
            </h2>
            <p className="panel-subtitle">Intelligent Edge Inference & Cloud Fallback</p>
          </div>
          
          <div className="chat-history">
            {historyTriage.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <h3>NEOVERSE Edge Gateway</h3>
                <p>Incoming traffic is algorithmically classified. Trivial workloads are intercepted and processed on local Arm Neoverse cores with zero API cost. Complex workloads are seamlessly proxied to the cloud.</p>
                <div className="suggested-prompts">
                  <button className="suggested-btn" onClick={() => setPrompt('Format this JSON payload into a readable list.')}>
                    "Format this JSON payload into a readable list."
                  </button>
                  <button className="suggested-btn" onClick={() => setPrompt('Analyze the system architecture of our microservices and evaluate latency tradeoffs.')}>
                    "Analyze the system architecture of our microservices and evaluate latency tradeoffs."
                  </button>
                </div>
              </div>
            ) : (
              historyTriage.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role} ${msg.isError ? 'fallback' : ''}`}>
                  <div className="content">
                    {msg.role === 'assistant' ? <TypewriterText text={msg.content} /> : msg.content}
                  </div>
                  {msg.meta && (
                    <div className="meta">
                      <span className={`meta-badge ${msg.badgeClass}`}>{msg.badgeText}</span>
                      <span>{msg.meta}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="input-container anim-fade-up" style={{ animationDelay: '600ms' }}>
        <input 
          type="text" 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="Enter a natural language query or execution payload..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? <span className="spinner"></span> : 'Execute'}
        </button>
      </form>
    </div>
  )
}
