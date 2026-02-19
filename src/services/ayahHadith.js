const AYAH_API =
  import.meta.env.VITE_QURAN_API_URL ||
  'https://api.alquran.cloud/v1/ayah/random'

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
  const index = Math.floor(Math.random() * LOCAL_HADITHS.length)
  return LOCAL_HADITHS[index]
}
