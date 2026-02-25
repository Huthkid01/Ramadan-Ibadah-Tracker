import React, { useState } from 'react'
import './DigitalTasbeeh.css'

export function DigitalTasbeeh({ count, onIncrement, onReset, target }) {
  const [isPressed, setIsPressed] = useState(false)

  const handlePress = () => {
    setIsPressed(true)
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try {
        window.navigator.vibrate(15) // Slightly stronger vibration for the "mechanical" feel
      } catch {
        // ignore
      }
    }
    onIncrement?.()
    setTimeout(() => setIsPressed(false), 100)
  }

  // Format count to 6 digits (e.g., 000012)
  const formattedCount = count.toString().padStart(6, '0')

  return (
    <div className="digital-tasbeeh-container">
      {/* The Physical Device Body */}
      <div className="digital-tasbeeh-device">
        {/* Texture/Grip effect on sides */}
        <div className="digital-tasbeeh-texture texture-left"></div>
        <div className="digital-tasbeeh-texture texture-right"></div>

        {/* Device Header/Branding */}
        <div className="digital-tasbeeh-header">
          <div className="flex flex-col">
            <span className="digital-tasbeeh-brand">Tasbeeh</span>
            <span className="digital-tasbeeh-model">Digital Counter</span>
          </div>
          {/* Pulsing light simulated with inline style or CSS animation if added */}
          <div className="w-2 h-2 rounded-full bg-blue-400 opacity-50"></div>
        </div>

        {/* LCD Screen Area */}
        <div className="digital-tasbeeh-screen-container">
           {/* Screen Bezel Inner - handled by container padding/bg in CSS */}
           <div className="digital-tasbeeh-screen">
              {/* Target Indicator (Small) */}
              <div className="screen-target">
                 <span className="screen-label">Count</span>
                 {target > 0 && (
                   <span style={{ fontFamily: 'monospace', color: '#60a5fa' }}>Goal: {target}</span>
                 )}
              </div>

              {/* Main Digits */}
              <div className="screen-count">
                {formattedCount}
              </div>
           </div>
        </div>

        {/* Controls Area */}
        <div className="digital-tasbeeh-controls">
          
          {/* Reset Button (Small - Top Right of button area) */}
          <div className="reset-btn-wrapper">
            <button
              onClick={onReset}
              className="reset-btn"
              aria-label="Reset Count"
              title="Reset"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="reset-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
          </div>

          {/* LED / Status Light (Top Left) */}
           <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '4px' }}>
              <div className={`led-indicator ${count > 0 && count % 33 === 0 ? 'led-on' : ''}`}></div>
              <div className={`led-indicator ${count >= target && target > 0 ? 'led-on' : ''}`}></div>
           </div>


          {/* The Big Button Container - mimics the curved housing */}
          <button
            onClick={handlePress}
            className={`main-btn ${isPressed ? 'pressed' : ''}`}
            aria-label="Count"
          >
            <div className="main-btn-inner"></div>
          </button>
          
        </div>

        {/* Branding Footer */}
        <div className="device-footer">
           RIT Series
        </div>
      </div>
    </div>
  )
}
