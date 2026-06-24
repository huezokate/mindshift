'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'cyberpunk' | 'kawaii' | 'notepad'
const STORAGE_KEY = 'ms_theme'
const DEFAULT: Theme = 'cyberpunk'

const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: DEFAULT,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The inline script in layout.tsx already set data-theme from localStorage
  // before first paint. Read it back here so React state matches the DOM on the
  // first client render — otherwise JS theme branches (theme === 'cyberpunk' ? …)
  // render the default skin first and visibly flip after the effect runs.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme')
      if (attr === 'cyberpunk' || attr === 'kawaii' || attr === 'notepad') return attr
    }
    return DEFAULT
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved && saved !== theme) apply(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep <html data-theme> locked to React state so the DOM never drifts from
  // the selected theme. (The marketing landing now scopes its notepad pin to its
  // own wrapper's data-theme rather than mutating <html>, so this no longer
  // fights the landing the way it did before — see 2df220f.)
  useEffect(() => {
    if (document.documentElement.getAttribute('data-theme') !== theme) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  function apply(t: Theme) {
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem(STORAGE_KEY, t)
    setThemeState(t)
  }

  return (
    <ThemeCtx.Provider value={{ theme, setTheme: apply }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeCtx)
}

export const THEMES: Theme[] = ['cyberpunk', 'kawaii', 'notepad']
