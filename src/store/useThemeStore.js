import { create } from 'zustand'

const storageKey = 'rit-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(storageKey)
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function applyThemeClass(mode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(mode)
}

export const useThemeStore = create((set, get) => {
  const initialMode = getInitialTheme()
  applyThemeClass(initialMode)

  return {
    mode: initialMode,
    toggle: () => {
      const next = get().mode === 'dark' ? 'light' : 'dark'
      applyThemeClass(next)
      window.localStorage.setItem(storageKey, next)
      set({ mode: next })
    },
    setMode: (mode) => {
      const normalized = mode === 'dark' ? 'dark' : 'light'
      applyThemeClass(normalized)
      window.localStorage.setItem(storageKey, normalized)
      set({ mode: normalized })
    },
  }
})

