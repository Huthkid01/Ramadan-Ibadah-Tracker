import { useEffect, useState } from 'react'
import { QiblaCompassModal } from './QiblaCompassModal'

function toRadians(deg) {
  return (deg * Math.PI) / 180
}

function toDegrees(rad) {
  return (rad * 180) / Math.PI
}

function computeQiblaBearing(lat, lng) {
  const kaabaLat = toRadians(21.4225)
  const kaabaLng = toRadians(39.8262)
  const userLat = toRadians(lat)
  const userLng = toRadians(lng)

  const dLng = kaabaLng - userLng

  const y = Math.sin(dLng)
  const x =
    Math.cos(userLat) * Math.tan(kaabaLat) -
    Math.sin(userLat) * Math.cos(dLng)

  const bearing = toDegrees(Math.atan2(y, x))
  const normalized = (bearing + 360) % 360
  return normalized
}

function getDirectionLabel(degrees) {
  const directions = [
    'N',
    'NE',
    'E',
    'SE',
    'S',
    'SW',
    'W',
    'NW',
    'N',
  ]
  const index = Math.round(degrees / 45)
  return directions[index]
}

export function QiblaDirectionWidget() {
  const [bearing, setBearing] = useState(null)
  const [error, setError] = useState(null)
  const [locLabel, setLocLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Function to actually request/get position
  const getPosition = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Location is not available in this browser.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const angle = computeQiblaBearing(latitude, longitude)
        setBearing(angle)
        setLocLabel(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`)
        setLoading(false)
      },
      (err) => {
        // Don't show error immediately if it's just an initial check
        console.warn('Location access error:', err)
        setLoading(false)
        if (err.code === 1) { // PERMISSION_DENIED
           setError('Please enable location access to find Qibla.')
        } else {
           setError('Unable to retrieve location.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    )
  }

  // Initial check for permissions and location
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          getPosition()
        } else if (result.state === 'prompt') {
           // We can optionally try to get it, but usually best to wait for user action
           // But user said "as long as user already allow... it should use it"
           // "already allow" implies state is 'granted'.
        }
      })
    } else {
      // Fallback for browsers without permissions API (e.g. Safari)
      // We can try to get position silently? 
      // If we call getCurrentPosition and it's denied, it might prompt.
      // We should probably wait for user interaction unless we know we have it.
      // But let's try a "soft" check if we can? No, getCurrentPosition prompts.
    }
  }, [])

  const handleUseLocation = () => {
    getPosition()
  }

  const hasResult = typeof bearing === 'number'
  const directionLabel = hasResult ? getDirectionLabel(bearing) : null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z"/>
          </svg>
        </div>
        
        <div>
          <h3 className="font-heading font-semibold text-lg text-slate-800 dark:text-slate-100">
            Qibla Finder
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Find the Kaaba direction
          </p>
        </div>

        {error ? (
          <div className="text-sm text-red-500 bg-transparent dark:bg-red-900/10 p-3 rounded-lg w-full border border-red-200 dark:border-red-900/30">
            {error}
            <button 
              onClick={handleUseLocation}
              className="block w-full mt-3 py-2 px-3 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : hasResult ? (
          <div className="w-full space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
               <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                 {bearing.toFixed(0)}°
               </div>
               <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                 {directionLabel}
               </div>
               {locLabel && (
                 <div className="text-xs text-slate-400 mt-1">
                   {locLabel}
                 </div>
               )}
            </div>
            
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
              </svg>
              Enable Compass
            </button>
          </div>
        ) : (
          <button
            onClick={handleUseLocation}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Locating...' : 'Use My Location'}
          </button>
        )}
      </div>

      <QiblaCompassModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        qiblaBearing={bearing || 0}
        locationName={locLabel}
      />
    </div>
  )
}
