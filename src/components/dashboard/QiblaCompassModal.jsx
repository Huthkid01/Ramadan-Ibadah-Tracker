import React, { useEffect, useState } from 'react'
import './QiblaCompassModal.css'

export function QiblaCompassModal({ isOpen, onClose, qiblaBearing, locationName }) {
  const [heading, setHeading] = useState(0)
  const [error, setError] = useState(null)
  
  // Initialize permission state based on device type
  // iOS 13+ requires explicit permission via button click
  // Others typically grant it implicitly or via browser prompt
  const [permissionGranted, setPermissionGranted] = useState(() => {
    if (typeof window === 'undefined') return false
    const isIOS =
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    return !isIOS
  })

  // Request permission for iOS 13+
  const requestAccess = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission()
        if (permissionState === 'granted') {
          setPermissionGranted(true)
        } else {
          setError('Permission to access device orientation was denied')
        }
      } catch (e) {
        setError('Error requesting device orientation permission')
        console.error(e)
      }
    } else {
      setPermissionGranted(true)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const handleOrientation = (e) => {
      let compass = 0
      
      if (e.webkitCompassHeading) {
        // iOS
        compass = e.webkitCompassHeading
      } else if (e.alpha !== null) {
         // Android / Non-iOS standard
         // alpha is 0 at North, increases counter-clockwise (Z-axis rotation)
         // So 360 - alpha should be compass heading?
         // This varies by device/browser implementation unfortunately.
         // Common standard: alpha=0 at North.
         compass = 360 - e.alpha
      }
      
      // Normalize to 0-360
      compass = (compass + 360) % 360
      setHeading(compass)
    }

    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation, true)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [isOpen, permissionGranted])

  if (!isOpen) return null

  // Calculate rotation for the dial
  // If phone points North (0deg), Dial should show N at top.
  // If phone points East (90deg), Dial should rotate -90deg so N is at Left (-90).
  const dialRotation = -heading

  return (
    <div className="qibla-modal-overlay">
      <div className="qibla-modal-content">
        <button className="qibla-modal-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="qibla-info">
          <h2>Qibla Finder</h2>
          <p>{locationName || 'Current Location'}</p>
          <p style={{ color: '#fbbf24', fontWeight: 'bold', marginTop: '0.5rem' }}>
             Qibla: {Math.round(qiblaBearing)}°
          </p>
        </div>

        {!permissionGranted && (
          <div className="text-center">
            <p className="mb-4">Compass access is required to show direction.</p>
            <button className="permission-btn" onClick={requestAccess}>
              Enable Compass
            </button>
          </div>
        )}

        {permissionGranted && (
          <div className="compass-container">
            <div className="compass-indicator-top"></div>
            
            <div 
              className="compass-dial"
              style={{ transform: `rotate(${dialRotation}deg)` }}
            >
              {/* Cardinal Directions */}
              <div className="compass-direction dir-n">N</div>
              <div className="compass-direction dir-e">E</div>
              <div className="compass-direction dir-s">S</div>
              <div className="compass-direction dir-w">W</div>

              {/* Ticks/Marks */}
              {[...Array(72)].map((_, i) => (
                 <div 
                   key={i} 
                   className={`compass-mark ${i % 9 === 0 ? 'major' : ''}`}
                   style={{ transform: `rotate(${i * 5}deg) translateY(10px)` }}
                 />
              ))}

              {/* Kaaba Icon at Qibla Angle */}
              {/* We rotate the wrapper to the bearing angle. */}
              {/* Then we counter-rotate the content if we want the icon to stay 'upright' relative to the dial center? */}
              {/* Actually, let's just place the icon. */}
              <div 
                className="qibla-icon-wrapper"
                style={{ 
                  height: '100%',
                  top: 0,
                  transform: `rotate(${qiblaBearing}deg)` 
                }}
              >
                 <div 
                   style={{ 
                     position: 'absolute',
                     top: '35px', // Distance from edge
                     left: '50%',
                     transform: 'translateX(-50%) rotate(180deg)', // Point inward
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center'
                   }}
                 > 
                   <div className="qibla-pointer-arrow" style={{ borderBottomColor: '#fbbf24' }}></div>
                   <div className="qibla-icon"></div>
                 </div>
              </div>

            </div>

            <div className="compass-center"></div>
            
            <div className="calibration-msg">
              Tilt phone to calibrate
            </div>
          </div>
        )}

        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      </div>
    </div>
  )
}
