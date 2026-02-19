# Ramadan Ibadah Tracker

A focused web app to help Muslims track their Ramadan worship day by day — Salah, Qur'an, dhikr, sadaqah, reflections, and fasting — with a calm dashboard, daily tracker, and calendar view.

Built with **React + Vite** on the frontend and **Supabase** as the backend (auth + database).

## Features

- Daily tracker for:
  - Obligatory prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) and Taraweeh
  - Qur'an pages
  - Dhikr count
  - Sadaqah and amount
  - Daily reflection note
- Dashboard with:
  - Today / per-day completion percentage
  - Total Salah count
  - Qur'an progress towards 30 Juz
  - Fasting days
  - Current Salah/Qur'an streak
  - Weekly Salah completion chart
- Ramadan calendar:
  - 30-day overview with completion intensity
  - Mark days as fasted directly on the calendar
- Location-based widgets:
  - Prayer times based on the user’s location (geolocation + Aladhan API)
  - Qibla direction with a compass-style widget

## Tech stack

- React + Vite
- Supabase (auth + Postgres)
- Recharts (weekly Salah chart)
- Tailwind-style utility classes via custom CSS

## Environment variables

Create a `.env` file in the project root (not committed to git) with:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

VITE_RAMADAN_START_DATE=2026-02-18
VITE_QURAN_TOTAL_PAGES=604

VITE_ALADHAN_API_URL=https://api.aladhan.com/v1
VITE_QURAN_API_URL=https://api.alquran.cloud/v1/ayah/random
VITE_HADITH_API_URL=https://random-hadith-generator.vercel.app/bukhari
```

## Running locally

```bash
npm install
npm run dev
```

Then open the printed `localhost` URL in your browser.

To check linting:

```bash
npm run lint
```

## Deployment (Vercel)

1. Push this repo to GitHub.
2. In Vercel, import the repository.
3. Set the same environment variables in the Vercel project settings.
4. Build command: `npm run build`
5. Output directory: `dist`

Vercel will build and host the app over HTTPS so geolocation-based prayer times and Qibla direction work correctly for users.
