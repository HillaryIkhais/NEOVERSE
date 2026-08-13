import { useState, useEffect, useRef } from 'react'
import Landing from './Landing'
import Dashboard from './Dashboard'

function App() {
  const [activeView, setActiveView] = useState('landing')
  const [motionPending, setMotionPending] = useState(true)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // Entrance motion fallback
    const timer = setTimeout(() => setMotionPending(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    let animationFrameId
    const ctx = canvas.getContext('2d')

    // Force play the hidden video
    video.play().catch(e => console.log('Autoplay prevented:', e))

    const renderFrame = () => {
      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      }
      animationFrameId = requestAnimationFrame(renderFrame)
    }

    renderFrame()
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <>
      {/* 
        The video is shrunk to 1x1 and hidden to completely prevent Safari/Chrome from 
        rendering native controls, PiP buttons, or pause buttons over the background. 
      */}
      <video 
        ref={videoRef} 
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4" 
        autoPlay muted defaultMuted loop playsInline disablePictureInPicture aria-hidden="true"
        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none', zIndex: -999 }}
      />
      <canvas ref={canvasRef} className="background" aria-hidden="true" />
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
