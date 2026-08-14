export default function ApiKeys() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header anim-fade">
        <div>
          <h1 className="dash-brand-title">API Keys</h1>
          <p className="dash-brand-subtitle">Manage your NEOVERSE access tokens.</p>
        </div>
        <button className="primary-cta" style={{ width: 'auto', minWidth: '0' }}>
          <span className="label" style={{ paddingRight: '12px' }}>Generate New Key</span>
        </button>
      </div>
      <div className="panel anim-fade-up">
        <div className="panel-header">
          <h2>Active Keys</h2>
        </div>
        <div className="chat-history">
          <table className="settings-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Secret Key</th>
                <th>Created</th>
                <th>Last Used</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Production Main</td>
                <td style={{ fontFamily: 'monospace' }}>nv_live_8f72a...</td>
                <td>Aug 10, 2026</td>
                <td style={{ color: 'var(--accent-green)' }}>2 minutes ago</td>
              </tr>
              <tr>
                <td>Staging Environment</td>
                <td style={{ fontFamily: 'monospace' }}>nv_test_4c91b...</td>
                <td>Aug 12, 2026</td>
                <td>Never</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
