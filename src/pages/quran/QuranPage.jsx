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

    async function loadSurah() {
      try {
        const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.asad,ar.alafasy`
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) {
          throw new Error('Unable to load Quran at the moment.')
        }
        const json = await res.json()
        if (!json || !json.data || !Array.isArray(json.data) || json.data.length < 3) {
          throw new Error('Unexpected Quran response.')
        }
        const [arabicEdition, englishEdition, audioEdition] = json.data
        const combined = arabicEdition.ayahs.map((ayah, index) => ({
          numberInSurah: ayah.numberInSurah,
          arabic: ayah.text,
          translation: englishEdition.ayahs[index]?.text ?? '',
          audioUrl: audioEdition.ayahs[index]?.audio ?? '',
        }))

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
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('rit-quran-surah', String(next))
      window.localStorage.removeItem('rit-quran-ayah')
    }
    setSurahNumber(next)
  }

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
      <header className="quran-header">
        <h1 className="quran-title">Quran</h1>
        <p className="quran-subtitle">
          Continue your recitation and gently track where you left off.
        </p>
      </header>

      <section className="quran-grid">
        <Card>
          <CardHeader>
            <CardTitle>
              {meta.englishName ? `Surah ${meta.englishName}` : 'Current reading'}
            </CardTitle>
            <CardDescription>
              {meta.name
                ? `${meta.name} · ${meta.revelationType} · ${meta.ayahs} ayahs`
                : 'Read the Quran with Arabic and English translation.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="quran-reader-header">
              <div className="quran-reader-info">
                <select
                  className="quran-surah-select"
                  value={surahNumber}
                  onChange={handleSelectSurah}
                  disabled={!surahList.length}
                >
                  {surahList.length ? (
                    surahList.map((surah) => (
                      <option key={surah.number} value={surah.number}>
                        {surah.number} · {surah.englishName}
                      </option>
                    ))
                  ) : (
                    <option value={1}>1 · Al-Fatiha</option>
                  )}
                </select>
              </div>
              <div className="quran-reader-controls">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleToggleSurahAudio}
                >
                  {isPlaying ? 'Pause recitation' : 'Play Surah audio'}
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="quran-reader-loading">
                <div className="quran-reader-spinner" />
              </div>
            ) : error ? (
              <p className="quran-reader-error">
                Unable to load Quran right now. Please check your connection and try again.
              </p>
            ) : (
              <div className="quran-verses">
                {verses.map((verse, index) => (
                  <div
                    key={verse.numberInSurah}
                    className={`quran-verse${
                      currentAyahIndex === index ? ' quran-verse-active' : ''
                    }`}
                    ref={(el) => {
                      verseRefs.current[index] = el
                    }}
                  >
                    <div className="quran-verse-meta">
                      <span className="quran-verse-number">{verse.numberInSurah}</span>
                    </div>
                    <div className="quran-verse-text">
                      <p className="quran-verse-ar">{verse.arabic}</p>
                      <p className="quran-verse-en">{verse.translation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s goal</CardTitle>
            <CardDescription>Set an intention for today&apos;s reading.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="quran-goal-text">
              Use the daily tracker page to log how many pages you read each day.
            </p>
            <Button
              type="button"
              className="quran-goal-button"
              onClick={() => {
                window.location.href = '/tracker'
              }}
            >
              Open daily tracker
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
