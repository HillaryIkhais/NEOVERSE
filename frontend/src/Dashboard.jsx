import { useState, useEffect } from 'react'

export default function Dashboard() {
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
      const response = await fetch('http://localhost:8000/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt })
      })

      if (!response.ok) {
        throw new Error('API Error')
      }

      const data = await response.json()
      
      // Update Savings
      if (data.triage.cost_saved) {
        setSavings(prev => prev + data.triage.cost_saved)
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
        content: 'Connection to ARM-TRIAGE API failed. Ensure the server is running.',
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
      <div className="dashboard-header">
        <div>
          <h1 className="dash-brand-title">ARM-TRIAGE</h1>
          <p className="dash-brand-subtitle">Oracle Cloud Ampere A1 (aarch64) • vLLM • KleidiAI</p>
        </div>
        
        <div className={`savings-ticker ${bumpTicker ? 'bump' : ''}`}>
          <span className="ticker-label">Cloud Cost Avoided</span>
          <span className="ticker-value">\${savings.toFixed(4)}</span>
        </div>
      </div>

      <div className="split-screen">
        {/* Naive Panel */}
        <div className="panel naive">
          <div className="panel-header naive-header">
            <h2>☁️ Naive Cloud Routing</h2>
            <p className="panel-subtitle">Sends everything to the cloud. High Cost, High Latency.</p>
          </div>
          
          <div className="chat-history">
            {historyNaive.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="content">{msg.content}</div>
                {msg.meta && (
                  <div className="meta">
                    <span className={`meta-badge ${msg.badgeClass}`}>{msg.badgeText}</span>
                    <span>{msg.meta}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Triage Panel */}
        <div className="panel triage">
          <div className="panel-header triage-header">
            <h2>⚡ ARM-TRIAGE</h2>
            <p className="panel-subtitle">Routes to local Arm64 node (INT4) first. Zero API cost.</p>
          </div>
          
          <div className="chat-history">
            {historyTriage.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role} ${msg.isError ? 'fallback' : ''}`}>
                <div className="content">{msg.content}</div>
                {msg.meta && (
                  <div className="meta">
                    <span className={`meta-badge ${msg.badgeClass}`}>{msg.badgeText}</span>
                    <span>{msg.meta}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="input-container">
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
