const AYAH_API =
  import.meta.env.VITE_QURAN_API_URL ||
  'https://api.alquran.cloud/v1/ayah/random'

const HADITH_API = import.meta.env.VITE_HADITH_API_URL || null
const HADITH_DATASET_URL =
  'https://raw.githubusercontent.com/thisismodou/Random-Hadith-Generator/master/ahadith.json'

const LOCAL_HADITHS = [
  {
    text: 'Actions are judged by intentions, so each man will have what he intended.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'The most beloved deeds to Allah are those done consistently, even if small.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'Make things easy and do not make them difficult; give glad tidings and do not make people run away.',
    reference: 'Sahih al-Bukhari',
  },
]

export async function fetchDailyAyah() {
  const res = await fetch(AYAH_API)
  if (!res.ok) {
    throw new Error('Failed to load ayah')
  }
  const json = await res.json()

  if (!json || !json.data) {
    throw new Error('Unexpected ayah response')
  }

  const base = json.data

  let translation = ''
  try {
    const enRes = await fetch(`https://api.alquran.cloud/v1/ayah/${base.number}/en.asad`)
    if (enRes.ok) {
      const enJson = await enRes.json()
      translation = enJson?.data?.text ?? ''
    }
  } catch (error) {
    console.error(error)
  }

  return {
    text: base.text,
    translation: translation || null,
    reference: `${base.surah.englishName} • ${base.numberInSurah}`,
  }
}

export async function fetchDailyHadith() {
  try {
    const res = await fetch(HADITH_DATASET_URL)
    if (res.ok) {
      const json = await res.json()
      let list = []
      if (Array.isArray(json)) {
        list = json
      } else if (json && Array.isArray(json.ahadith)) {
        list = json.ahadith
      } else if (json && typeof json === 'object') {
        list = Object.values(json)
      }
      if (list.length > 0) {
        const raw = list[Math.floor(Math.random() * list.length)]
        if (raw) {
          const text =
            (typeof raw === 'string' && raw) ||
            raw.text ||
            raw.hadith ||
            raw.hadith_text ||
            raw.content ||
            null
          const reference =
            raw.reference ||
            raw.source ||
            [raw.book, raw.chapter, raw.hadithNumber].filter(Boolean).join(' • ') ||
            'Hadith'
          if (text && typeof text === 'string') {
            return {
              text,
              reference,
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Random Hadith dataset fetch failed:', error)
  }

  if (HADITH_API) {
    try {
      const res = await fetch(HADITH_API)
      if (res.ok) {
        const json = await res.json()
        const candidate =
          json?.data?.hadith ||
          json?.data?.text ||
          json?.hadith ||
          json?.text ||
          null
        if (candidate && typeof candidate === 'string') {
          const reference =
            json?.data?.reference ||
            json?.reference ||
            'Hadith'
          return {
            text: candidate,
            reference,
          }
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const index = Math.floor(Math.random() * LOCAL_HADITHS.length)
  return LOCAL_HADITHS[index]
}
