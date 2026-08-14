import { useState } from 'react'

export default function Settings() {
  const [threshold, setThreshold] = useState(6.0)
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header anim-fade">
        <div>
          <h1 className="dash-brand-title">Settings</h1>
          <p className="dash-brand-subtitle">Configure the routing engine and fallback behavior.</p>
        </div>
      </div>
      
      <div className="split-screen">
        <div className="panel anim-fade-up">
          <div className="panel-header">
            <h2>Edge Routing Threshold</h2>
          </div>
          <div className="chat-history">
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              Set the maximum complexity score allowed for local execution. Higher thresholds will route more traffic to the edge node, but may increase the risk of hallucination on complex tasks.
            </p>
            
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Complexity Threshold</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{threshold.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="10.0" 
                step="0.1" 
                value={threshold} 
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                <span>Strict (More Cloud)</span>
                <span>Aggressive (More Edge)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel anim-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="panel-header">
            <h2>Cloud Fallback Providers</h2>
          </div>
          <div className="chat-history">
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
              Select which cloud provider NEOVERSE should fallback to when a query exceeds the complexity threshold.
            </p>
            
            <div className="setting-row">
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Primary Fallback</strong>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>OpenAI (gpt-4o-mini)</span>
              </div>
              <button className="settings-btn active">Active</button>
            </div>
            
            <div className="setting-row">
              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Secondary Fallback</strong>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Anthropic (claude-3-haiku)</span>
              </div>
              <button className="settings-btn">Enable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
