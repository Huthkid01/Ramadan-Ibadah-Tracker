const AYAH_API =
  import.meta.env.VITE_QURAN_API_URL ||
  'https://api.alquran.cloud/v1/ayah/random'

const HADITH_API = import.meta.env.VITE_HADITH_API_URL || null
const HADITH_DATASET_URL =
  'https://thisismodou.github.io/Random-Hadith-Generator/ahadith.json'

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
  {
    text: 'None of you will have faith till he wishes for his (Muslim) brother what he likes for himself.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'He who believes in Allah and the Last Day must either speak good or remain silent.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'A good word is a form of charity.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'Do not get angry.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'The strong man is not the one who can overpower others. Rather, the strong man is the one who controls himself when angry.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'Save yourself from Hell-fire even by giving half a date-fruit in charity.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'Every religion has a distinct characteristic, and the distinct characteristic of Islam is modesty.',
    reference: 'Sunan Ibn Majah',
  },
  {
    text: 'Richness is not having many appearances, but richness is being content with oneself.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'The best of you are those who learn the Quran and teach it.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'Cleanliness is half of faith.',
    reference: 'Sahih Muslim',
  },
  {
    text: 'The best among you are those who have the best manners and character.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'He who does not show mercy to our young ones or recognize the rights of our elders is not one of us.',
    reference: 'Sunan Abu Dawood',
  },
  {
    text: 'Modesty brings nothing but good.',
    reference: 'Sahih al-Bukhari',
  },
  {
    text: 'Allah is Beautiful and He loves beauty.',
    reference: 'Sahih Muslim',
  },
  {
    text: 'When you see a person who has been given more than you in money and beauty, look to those who have been given less.',
    reference: 'Sahih Muslim',
  },
  {
    text: 'Exchange gifts, as that will lead to increasing your love for one another.',
    reference: 'Al-Adab Al-Mufrad',
  },
  {
    text: 'Smiling in the face of your brother is an act of charity.',
    reference: 'Jami` at-Tirmidhi',
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

  // Fallback to local dataset
  const index = Math.floor(Math.random() * LOCAL_HADITHS.length)
  return LOCAL_HADITHS[index]
}
