import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

function getInitialSurahNumber() {
  if (typeof window === 'undefined') return 1
  const stored = window.localStorage.getItem('rit-quran-surah')
  const value = Number(stored)
  if (!Number.isFinite(value)) return 1
  if (value < 1 || value > 114) return 1
  return value
}

export function QuranPage() {
  const [surahList, setSurahList] = useState([])
  const [surahNumber, setSurahNumber] = useState(getInitialSurahNumber)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verses, setVerses] = useState([])
  const [currentAudio, setCurrentAudio] = useState(null)
  const [currentAyahIndex, setCurrentAyahIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [meta, setMeta] = useState({
    name: '',
    englishName: '',
    revelationType: '',
    ayahs: 0,
  })

  const verseRefs = useRef([])
  const resumeAyahRef = useRef(null)
  const [shouldResumeFromGlobal, setShouldResumeFromGlobal] = useState(false)

  const playAyahAt = useCallback(
    (index) => {
      if (!verses[index] || !verses[index].audioUrl) {
        return
      }
      if (typeof window !== 'undefined' && window.ritQuranAudio) {
        try {
          window.ritQuranAudio.pause()
        } catch (err) {
          void err
        }
      }
      if (currentAudio) {
        currentAudio.pause()
      }
      const audio = new Audio(verses[index].audioUrl)
      audio.addEventListener('ended', () => {
        const nextIndex = index + 1
        if (nextIndex >= verses.length) {
          setIsPlaying(false)
          setCurrentAudio(null)
          setCurrentAyahIndex(null)
          return
        }
        setCurrentAyahIndex(nextIndex)
        playAyahAt(nextIndex)
      })
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch((err) => {
          if (err?.name === 'AbortError') return
          setError(err)
        })
      }
      setCurrentAudio(audio)
      if (typeof window !== 'undefined') {
        window.ritQuranAudio = audio
      }
      setCurrentAyahIndex(index)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('rit-quran-ayah', String(index))
      }
      setIsPlaying(true)
    },
    [currentAudio, setError, setIsPlaying, verses]
  )

  useEffect(() => {
    async function getSurahList() {
      try {
        const res = await fetch('https://api.alquran.cloud/v1/surah')
        const json = await res.json()
        if (json.data) {
          setSurahList(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch surah list:', err)
      }
    }
    getSurahList()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const globalAudio = window.ritQuranAudio
    const storedSurah = Number(window.localStorage.getItem('rit-quran-surah'))
    const storedAyah = Number(window.localStorage.getItem('rit-quran-ayah'))
    if (
      globalAudio &&
      !globalAudio.paused &&
      storedSurah === surahNumber &&
      Number.isFinite(storedAyah)
    ) {
      try {
        globalAudio.pause()
      } catch (err) {
        void err
      }
      window.ritQuranAudio = null
      resumeAyahRef.current = storedAyah
      setShouldResumeFromGlobal(true)
    }
  }, [surahNumber])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    const controller = new AbortController()

    async function loadSurah(retryCount = 0) {
      const CACHE_KEY = `rit-quran-fallback-${surahNumber}`
      function saveFallback(data, meta) {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data, meta, ts: Date.now() }))
        } catch {
          // ignore
        }
      }
      function loadFallback() {
        try {
          const raw = localStorage.getItem(CACHE_KEY)
          if (!raw) return null
          const parsed = JSON.parse(raw)
          if (Date.now() - parsed.ts > 86400000) return null // stale
          return { data: parsed.data, meta: parsed.meta }
        } catch {
          return null
        }
      }

      try {
        // 1) Surah metadata (name, revelationType, numberOfAyahs)
        const metaRes = await fetch(
          `https://quranapi.pages.dev/api/surah/${surahNumber}.json`,
          { signal: controller.signal }
        )
        if (!metaRes.ok) throw new Error('Unable to load surah metadata.')
        const metaJson = await metaRes.json()
        const { name, revelationType, numberOfAyahs } = metaJson

        // 2) Ayahs (arabic + translation + audio)
        const ayahRes = await fetch(
          `https://quranapi.pages.dev/api/surah/${surahNumber}/ayahs.json`,
          { signal: controller.signal }
        )
        if (!ayahRes.ok) throw new Error('Unable to load ayahs.')
        const ayahJson = await ayahRes.json()

        // Build combined array
        const combined = ayahJson.map((ayah) => ({
          numberInSurah: ayah.numberInSurah,
          arabic: ayah.arabic,
          translation: ayah.translation || '',
          audioUrl: ayah.audio || '',
        }))

        if (combined.length === 0) {
          throw new Error('Empty ayahs')
        }

        saveFallback(combined, {
          name,
          englishName: metaJson.englishName || `Surah ${surahNumber}`,
          revelationType,
          ayahs: numberOfAyahs,
        })

        if (!isMounted) return

        const nextMeta = {
          name: metaJson.name,
          englishName: metaJson.englishName || `Surah ${surahNumber}`,
          revelationType: metaJson.revelationType,
          ayahs: metaJson.numberOfAyahs,
        }

        setMeta(nextMeta)
        setVerses(combined)
        if (typeof window !== 'undefined') {
          const storedSurah = Number(window.localStorage.getItem('rit-quran-surah'))
          const storedAyah = Number(window.localStorage.getItem('rit-quran-ayah'))
          if (
            storedSurah === surahNumber &&
            Number.isFinite(storedAyah) &&
            storedAyah >= 0 &&
            storedAyah < combined.length
          ) {
            setCurrentAyahIndex(storedAyah)
          } else {
            setCurrentAyahIndex(null)
          }
        } else {
          setCurrentAyahIndex(null)
        }
      } catch (err) {
        if (!isMounted || err.name === 'AbortError') return
        if (retryCount < 3) {
          setLoading(true)
          setTimeout(() => loadSurah(retryCount + 1), 1000 * (retryCount + 1))
          return
        }

        const cached = loadFallback()
        if (cached) {
          if (!isMounted) return
          setVerses(cached.data)
          setMeta(cached.meta)
          setCurrentAyahIndex(null)
          setLoading(false)
          return
        }

        setError(err)
        setVerses([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadSurah()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [surahNumber])

  useEffect(() => {
    if (!shouldResumeFromGlobal) return
    if (!verses.length) return
    const index = resumeAyahRef.current
    if (!Number.isFinite(index) || index < 0 || index >= verses.length) {
      setShouldResumeFromGlobal(false)
      return
    }
    playAyahAt(index)
    setShouldResumeFromGlobal(false)
  }, [shouldResumeFromGlobal, verses, playAyahAt])

  function handleSelectSurah(event) {
    const next = Number(event.target.value)
    if (!Number.isFinite(next) || next === surahNumber) return
    if (next < 1 || next > 114) return

    if (typeof window !== 'undefined' && window.ritQuranAudio) {
      try {
        window.ritQuranAudio.pause()
      } catch {
        // ignore
      }
      window.ritQuranAudio = null
    }

    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
    }

    setCurrentAyahIndex(null)
    setIsPlaying(false)
    setSurahNumber(next)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('rit-quran-surah', String(next))
      window.localStorage.removeItem('rit-quran-ayah')
    }
  }

  function handleToggleSurahAudio() {
    if (currentAudio) {
      if (currentAudio.paused) {
        const playPromise = currentAudio.play()
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch((err) => {
            if (err?.name === 'AbortError') return
            setError(err)
          })
        }
        setIsPlaying(true)
        return
      }
      currentAudio.pause()
      setIsPlaying(false)
      return
    }
    if (!verses.length) return
    playAyahAt(0)
  }

  useEffect(() => {
    if (currentAyahIndex === null) return
    const el = verseRefs.current[currentAyahIndex]
    if (!el) return
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [currentAyahIndex])

  return (
    <div className="quran-page">
      <div className="maintenance-banner" style={{background:'#ff9800',color:'#fff',padding:'8px 12px',textAlign:'center',fontSize:'14px'}}>
        🛠️ Maintenance in progress – audio may be intermittent. Thank you for your patience.
      </div>
      <header className="quran-header">
        <h1 className="quran-title">Quran</h1>
        <div className="quran-meta">
          <p>
            {meta.name} ({meta.englishName})
          </p>
          <p>
            {meta.revelationType} • {meta.ayahs} ayahs
          </p>
        </div>
        <div className="quran-controls">
          <select
            value={surahNumber}
            onChange={handleSelectSurah}
            className="surah-select"
            disabled={loading}
          >
            {surahList.map((surah) => (
              <option key={surah.number} value={surah.number}>
                {surah.number}. {surah.englishName} ({surah.name})
              </option>
            ))}
          </select>
          <Button onClick={handleToggleSurahAudio} disabled={loading || error}>
            {isPlaying ? 'Pause' : 'Play Surah'}
          </Button>
        </div>
      </header>
      <CardContent>
        {loading && <p>Loading...</p>}
        {error && (
          <p className="error-message">
            Unable to load Quran right now. Please check your connection and try again.
          </p>
        )}
        {!loading && !error && (
          <div className="quran-verses">
            {verses.map((verse, index) => (
              <div
                key={verse.numberInSurah}
                ref={(el) => (verseRefs.current[index] = el)}
                className={`quran-verse ${currentAyahIndex === index ? 'is-playing' : ''}`}
                onClick={() => playAyahAt(index)}
              >
                <p className="verse-arabic">{verse.arabic}</p>
                <p className="verse-translation">{verse.translation}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  )
}