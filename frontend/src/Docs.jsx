export default function Docs() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header anim-fade">
        <div>
          <h1 className="dash-brand-title">Documentation</h1>
          <p className="dash-brand-subtitle">Integrate NEOVERSE into your existing application.</p>
        </div>
      </div>
      <div className="panel anim-fade-up">
        <div className="panel-header">
          <h2>Quick Start Integration</h2>
        </div>
        <div className="chat-history">
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
            NEOVERSE acts as a drop-in replacement for the OpenAI API. You do not need to change any of your existing inference code. Simply swap the base URL and API key.
          </p>
          
          <div className="code-block">
            <div className="code-header">Python (OpenAI SDK)</div>
            <pre><code>{`from openai import OpenAI

client = OpenAI(
    api_key="nv_live_8f72a9...", 
    base_url="https://api.your-neoverse-domain.com/v1"
)

# This request will now be automatically routed by NEOVERSE
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Extract emails from this text."}
    ]
)`}</code></pre>
          </div>
        </div>
      </div>
    </div>
  )
}
