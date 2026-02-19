import { useEffect, useState } from 'react'

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
  const [heading, setHeading] = useState(null)
  const [compassActive, setCompassActive] = useState(false)

  function requestDirection() {
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
      () => {
        setError('Unable to access your location. Please allow location access.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    )
  }

  const hasResult = typeof bearing === 'number'
  const directionLabel = hasResult ? getDirectionLabel(bearing) : null
  const arrowRotation =
    hasResult && typeof heading === 'number' ? bearing - heading : bearing ?? 0

  useEffect(() => {
    if (!compassActive) return undefined

    function handleOrientation(event) {
      const alpha = event.alpha
      if (typeof alpha !== 'number') return
      const normalized = (360 - alpha + 360) % 360
      setHeading(normalized)
    }

    const hasPermissionApi =
      typeof window !== 'undefined' &&
      window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function'

    if (hasPermissionApi) {
      window.DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
          }
        })
        .catch((e) => {
          console.error(e)
          setCompassActive(false)
        })
    } else if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation)
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [compassActive])

  return (
    <div className="qibla-widget">
      <p className="qibla-text">
        Find the direction of the Qibla from your current location.
      </p>
      <button
        type="button"
        onClick={requestDirection}
        className="btn btn-primary qibla-button"
        disabled={loading}
      >
        {loading ? 'Finding direction...' : 'Use my location'}
      </button>

      {hasResult ? (
        <button
          type="button"
          className="qibla-compass-button"
          onClick={() => setCompassActive((prev) => !prev)}
        >
          {compassActive ? 'Disable compass' : 'Enable compass'}
        </button>
      ) : null}

      {hasResult ? (
        <div className="qibla-result">
          <div className="qibla-compass">
            <div className="qibla-compass-label qibla-compass-label-n">N</div>
            <div className="qibla-compass-label qibla-compass-label-e">E</div>
            <div className="qibla-compass-label qibla-compass-label-s">S</div>
            <div className="qibla-compass-label qibla-compass-label-w">W</div>
            <div
              className="qibla-arrow"
              style={{ transform: `rotate(${arrowRotation}deg)` }}
            />
          </div>
          <div className="qibla-details">
            <div className="qibla-angle">
              Qibla: <strong>{bearing.toFixed(0)}°</strong> from North ({directionLabel})
            </div>
            {locLabel ? (
              <div className="qibla-location">Based on your location: {locLabel}</div>
            ) : null}
            <div className="qibla-note">
              Stand straight, hold your phone flat, and face the arrow&apos;s direction.
            </div>
          </div>
        </div>
      ) : (
        <p className="qibla-hint">
          Location is only used in your browser to calculate the direction, and is not stored.
        </p>
      )}

      {error ? <p className="qibla-error">{error}</p> : null}
    </div>
  )
}
