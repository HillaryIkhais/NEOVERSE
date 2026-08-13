import { useState, useEffect } from 'react'

export default function Dashboard({ onBack }) {
  const [prompt, setPrompt] = useState('')
  const [historyNaive, setHistoryNaive] = useState([])
  const [historyTriage, setHistoryTriage] = useState([])
  const [savings, setSavings] = useState(0.0)
  const [isLoading, setIsLoading] = useState(false)
  const [bumpTicker, setBumpTicker] = useState(false)

  // Trigger ticker bump animation when savings change
  useEffect(() => {
    if (savings > 0) {
      setBumpTicker(true)
      const timer = setTimeout(() => setBumpTicker(false), 300)
      return () => clearTimeout(timer)
    }
  }, [savings])

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
      
      // Update Savings (Simulated at Enterprise Scale: 1 Million Requests/Day for 30 Days)
      if (data.triage.cost_saved) {
        setSavings(prev => prev + (data.triage.cost_saved * 30000000))
      }

      // Format Meta Strings
      let triageMeta = ''
      let badgeClass = 'local'
      if (data.decision === 'LOCAL') {
        triageMeta = `Arm64 (${data.triage.engine}) | Latency: ${data.triage.latency_sec.toFixed(3)}s | ${data.triage.tps} TPS | Saved: $${data.triage.cost_saved.toFixed(4)}`
      } else if (data.decision === 'CACHE_HIT') {
        triageMeta = `CACHE_HIT (0ms) | Saved: $${data.triage.cost_saved.toFixed(4)}`
      } else if (data.decision === 'FALLBACK') {
        triageMeta = `Deterministic Rule: ${data.reasons[data.reasons.length - 1]}`
        badgeClass = 'fallback'
      } else {
        triageMeta = `CLOUD ROUTE: ${data.reasons[data.reasons.length - 1]}`
        badgeClass = 'cloud'
      }

      const naiveMeta = `Latency: ${data.naive.latency_sec.toFixed(2)}s | Cost: $${data.naive.cost.toFixed(4)}`

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
          <span className="ticker-label">Projected Enterprise Savings (Monthly)</span>
          <span className="ticker-value">${savings.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
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
            <p className="panel-subtitle">Sends everything to the cloud. High Cost, High Latency.</p>
          </div>
          
          <div className="chat-history">
            {historyNaive.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                </div>
                <h3>Standard Cloud Gateway</h3>
                <p>See how a standard cloud endpoint handles your query in terms of latency and cost.</p>
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
                  <div className="content">{msg.content}</div>
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
            <p className="panel-subtitle">Routes to local Arm64 node (INT4) first. Zero API cost.</p>
          </div>
          
          <div className="chat-history">
            {historyTriage.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <h3>Test the Router</h3>
                <p>Send a prompt to see if NEOVERSE can intercept it locally, or if it routes it to the cloud.</p>
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
                  <div className="content">{msg.content}</div>
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
          placeholder="Enter a complex reasoning prompt or simple query..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? <span className="spinner"></span> : 'Execute'}
        </button>
      </form>
    </div>
  )
}
