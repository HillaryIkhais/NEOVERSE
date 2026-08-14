import { useState, useEffect, useRef } from 'react'
import Landing from './Landing'
import Dashboard from './Dashboard'
import Analytics from './Analytics'
import ApiKeys from './ApiKeys'
import Settings from './Settings'
import Docs from './Docs'

function App() {
  const [activeView, setActiveView] = useState('landing') // 'landing' or 'app'
  const [activeTab, setActiveTab] = useState('playground')
  const [motionPending, setMotionPending] = useState(true)

  useEffect(() => {
    // Entrance motion fallback
    const timer = setTimeout(() => setMotionPending(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Background Video */}
      <video 
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4" 
        autoPlay muted defaultMuted loop playsInline disablePictureInPicture aria-hidden="true"
        className="background"
      />
      
      <div className={`viewport ${motionPending ? 'motion-pending' : ''}`}>
        
        {/* LANDING PAGE */}
        <div className={`view-transition ${activeView === 'landing' ? 'view-active' : 'view-hidden'}`}>
          <Landing onEnter={() => setActiveView('app')} />
        </div>

        {/* MAIN APP LAYOUT */}
        <div className={`view-transition ${activeView === 'app' ? 'view-active' : 'view-hidden'}`} style={{ display: 'flex', width: '100%', height: '100%' }}>
          
          {/* SIDEBAR NAVIGATION */}
          <div className="sidebar anim-fade">
            <div className="sidebar-brand">
              <h2>NEOVERSE</h2>
            </div>
            <nav className="sidebar-nav">
              <a href="#" className={activeTab === 'playground' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('playground') }}>
                Router Playground
              </a>
              <a href="#" className={activeTab === 'analytics' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('analytics') }}>
                Analytics
              </a>
              <a href="#" className={activeTab === 'apikeys' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('apikeys') }}>
                API Keys
              </a>
              <a href="#" className={activeTab === 'settings' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('settings') }}>
                Settings
              </a>
              <a href="#" className={activeTab === 'docs' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('docs') }}>
                Documentation
              </a>
            </nav>
            <div className="sidebar-footer">
              <button className="back-button" onClick={() => setActiveView('landing')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Log Out
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="main-content">
            {activeTab === 'playground' && <Dashboard onBack={() => setActiveView('landing')} hideBackBtn={true} />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'apikeys' && <ApiKeys />}
            {activeTab === 'settings' && <Settings />}
            {activeTab === 'docs' && <Docs />}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
