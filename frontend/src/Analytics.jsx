export default function Analytics() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header anim-fade">
        <div>
          <h1 className="dash-brand-title">Analytics</h1>
          <p className="dash-brand-subtitle">System-wide routing telemetry and performance metrics.</p>
        </div>
      </div>
      <div className="split-screen">
        <div className="panel anim-fade-up">
          <div className="panel-header">
            <h2>Cost Savings</h2>
          </div>
          <div className="chat-history empty-state">
            <div className="empty-state-metrics" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
              <div className="metric-item green">
                <span className="metric-value">$6,240.50</span>
                <span className="metric-label">Total Saved (30d)</span>
              </div>
              <div className="metric-item blue">
                <span className="metric-value">68.4%</span>
                <span className="metric-label">Edge Offload Rate</span>
              </div>
            </div>
            <p style={{ marginTop: '2rem' }}>You are routing 68.4% of traffic to the local Arm edge node, effectively eliminating API token costs for those queries.</p>
          </div>
        </div>
        <div className="panel anim-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="panel-header">
            <h2>Latency Improvements</h2>
          </div>
          <div className="chat-history empty-state">
            <div className="empty-state-metrics" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
              <div className="metric-item green">
                <span className="metric-value">14ms</span>
                <span className="metric-label">Avg Edge TTFT</span>
              </div>
              <div className="metric-item blue">
                <span className="metric-value">480ms</span>
                <span className="metric-label">Avg Cloud TTFT</span>
              </div>
            </div>
            <p style={{ marginTop: '2rem' }}>Local inference on the Arm Neoverse cores is responding 34x faster than the primary cloud API endpoints.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
