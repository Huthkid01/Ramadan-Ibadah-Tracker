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
  const [loadError, setLoadError] = useState(null)
  const [audioError, setAudioError] = useState(null)
  const [verses, setVerses] = useState([])
  const [currentAudio, setCurrentAudio] = useState(null)
  const [currentAyahIndex, setCurrentAyahIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
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
      audio.preload = 'auto'
      setIsBuffering(true)
      setIsPlaying(false)
      const handleCanPlay = () => {
        const playPromise = audio.play()
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch((err) => {
            if (err?.name === 'AbortError') return
            setAudioError(err)
          })
        }
        setIsPlaying(true)
        setIsBuffering(false)
        audio.removeEventListener('canplay', handleCanPlay)
      }
      audio.addEventListener('canplay', handleCanPlay)
      audio.addEventListener('error', () => {
        setIsBuffering(false)
        setIsPlaying(false)
      })
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
          setAudioError(err)
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
    },
    [currentAudio, setIsPlaying, setAudioError, verses]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('rit-quran-surah', String(surahNumber))
  }, [surahNumber])

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
    setLoadError(null)
    setAudioError(null)

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
        const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.asad,ar.alafasy`
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) {
          throw new Error('Unable to load Quran at the moment.')
        }
        const json = await res.json()
        const editions = json?.data
        if (!Array.isArray(editions) || editions.length === 0) {
          throw new Error('Unexpected Quran response.')
        }

        const arabicEdition =
          editions.find((e) => e.edition?.identifier === 'quran-uthmani' || e.identifier === 'quran-uthmani') ??
          editions[0]

        const englishEdition =
          editions.find((e) => e.edition?.identifier === 'en.asad' || e.identifier === 'en.asad') ??
          editions.find((e) => e.edition?.language === 'en' || e.language === 'en')

        const audioEdition =
          editions.find((e) => e.edition?.identifier === 'ar.alafasy' || e.identifier === 'ar.alafasy') ??
          editions.find((e) => e.ayahs && e.ayahs[0] && e.ayahs[0].audio)

        if (!arabicEdition || !Array.isArray(arabicEdition.ayahs) || arabicEdition.ayahs.length === 0) {
          throw new Error('Unexpected Quran response.')
        }

        const combined = arabicEdition.ayahs.map((ayah, index) => ({
          numberInSurah: ayah.numberInSurah,
          arabic: ayah.text,
          translation: englishEdition?.ayahs?.[index]?.text ?? '',
          audioUrl: audioEdition?.ayahs?.[index]?.audio ?? '',
        }))

        if (combined.length === 0) {
          throw new Error('Empty ayahs')
        }

        saveFallback(combined, {
          name: arabicEdition.name,
          englishName: arabicEdition.englishName,
          revelationType: arabicEdition.revelationType,
          ayahs: arabicEdition.numberOfAyahs,
        })

        if (!isMounted) return

        const nextMeta = {
          name: arabicEdition.name,
          englishName: arabicEdition.englishName,
          revelationType: arabicEdition.revelationType,
          ayahs: arabicEdition.numberOfAyahs,
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
        try {
          const altArRes = await fetch(
            `https://alquran-api.pages.dev/api/quran/surah/${surahNumber}?lang=ar`,
            { signal: controller.signal }
          )
          const altEnRes = await fetch(
            `https://alquran-api.pages.dev/api/quran/surah/${surahNumber}?lang=en`,
            { signal: controller.signal }
          )
          if (altArRes.ok && altEnRes.ok) {
            const altAr = await altArRes.json()
            const altEn = await altEnRes.json()
            const arVerses = Array.isArray(altAr?.verses) ? altAr.verses : []
            const enVerses = Array.isArray(altEn?.verses) ? altEn.verses : []
            if (arVerses.length > 0) {
              const combinedAlt = arVerses.map((v, index) => ({
                numberInSurah: index + 1,
                arabic: v.text ?? '',
                translation: enVerses[index]?.translation ?? '',
                audioUrl: v.audio ?? enVerses[index]?.audio ?? '',
              }))
              const metaAlt = {
                name: altAr.transliteration ?? `Surah ${surahNumber}`,
                englishName: altEn.translation ?? altAr.translation ?? `Surah ${surahNumber}`,
                revelationType: altAr.revelationType ?? '',
                ayahs: combinedAlt.length,
              }
              if (!isMounted) return
              setMeta(metaAlt)
              setVerses(combinedAlt)
              setCurrentAyahIndex(null)
              setLoading(false)
              return
            }
          }
        } catch (altErr) {
          console.error('Alternate Quran API failed', altErr)
        }

        setLoadError(err)
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
            setAudioError(err)
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
    const startIndex =
      currentAyahIndex !== null && currentAyahIndex >= 0 && currentAyahIndex < verses.length
        ? currentAyahIndex
        : 0
    playAyahAt(startIndex)
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
      <header className="quran-header">
        <h1 className="quran-title">Quran</h1>
        {meta.name && (
          <div className="quran-meta">
            <p>
              {meta.name} ({meta.englishName})
            </p>
            <p>
              {meta.revelationType} • {meta.ayahs} ayahs
            </p>
          </div>
        )}
        <div className="quran-controls">
          <select
            value={surahNumber}
            onChange={handleSelectSurah}
            className="quran-surah-select"
            disabled={loading}
          >
            {surahList.map((surah) => (
              <option key={surah.number} value={surah.number}>
                {surah.number}. {surah.englishName} ({surah.name})
              </option>
            ))}
          </select>
          <Button onClick={handleToggleSurahAudio} disabled={loading || loadError || isBuffering}>
            {isBuffering ? 'Buffering…' : isPlaying ? 'Pause' : 'Play Surah'}
          </Button>
        </div>
      </header>
      <CardContent>
        {loading && <p>Loading...</p>}
        {loadError && (
          <p className="error-message">
            Unable to load this surah right now from any source on this connection. Please try
            again in a few minutes or switch networks.
          </p>
        )}
        {audioError && !loadError && (
          <p className="error-message">
            There was a problem starting audio playback on this device. Please tap play again or
            try a different network.
          </p>
        )}
        {!loading && !loadError && (
          <div className="quran-verses">
            {verses.map((verse, index) => (
              <div
                key={verse.numberInSurah}
                ref={(el) => (verseRefs.current[index] = el)}
                className={`quran-verse ${currentAyahIndex === index ? 'quran-verse-active' : ''}`}
                onClick={() => playAyahAt(index)}
              >
                <div className="quran-verse-text">
                  <p className="quran-verse-ar">{verse.arabic}</p>
                  <p className="quran-verse-en">{verse.translation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  )
}
