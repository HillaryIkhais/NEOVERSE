import { useState, useEffect, useRef } from 'react'
import Landing from './Landing'
import Dashboard from './Dashboard'

function App() {
  const [activeView, setActiveView] = useState('landing')
  const [motionPending, setMotionPending] = useState(true)
  const videoRef = useRef(null)

  useEffect(() => {
    // Entrance motion fallback
    const timer = setTimeout(() => setMotionPending(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log('Autoplay prevented by browser:', e))
    }
  }, [])

  return (
    <>
      <video 
        ref={videoRef} 
        className="background" 
        autoPlay 
        muted 
        defaultMuted
        loop 
        playsInline 
        disablePictureInPicture 
        aria-hidden="true"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4" type="video/mp4" />
      </video>
      <div className={`viewport ${motionPending ? 'motion-pending' : ''}`}>
        <div className={`view-transition ${activeView === 'landing' ? 'view-active' : 'view-hidden'}`}>
          <Landing onEnter={() => setActiveView('dashboard')} />
        </div>
        <div className={`view-transition ${activeView === 'dashboard' ? 'view-active' : 'view-hidden'}`}>
          <Dashboard onBack={() => setActiveView('landing')} />
        </div>
      </div>
    </>
  )
}

export default App
