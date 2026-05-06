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
  const [theme, setThemeState] = useState<Theme>(DEFAULT)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved) apply(saved)
  }, [])

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
