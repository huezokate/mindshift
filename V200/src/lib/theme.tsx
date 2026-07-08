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
  // State MUST start at DEFAULT to match what the server rendered. Reading
  // data-theme in the initializer (the old approach) made the first client
  // render already equal the saved theme, so nothing ever re-rendered — and
  // React does not patch attribute mismatches on hydration, which left the
  // server's default-theme <img src> (cyberpunk portraits) permanently in the
  // DOM on notepad/kawaii devices. CSS never flashes either way (the inline
  // script in layout.tsx sets data-theme before first paint); only JS theme
  // branches swap once after mount, which is the correct trade.
  const [theme, setThemeState] = useState<Theme>(DEFAULT)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    const attr = document.documentElement.getAttribute('data-theme') as Theme | null
    const active = saved ?? (attr && THEMES.includes(attr) ? attr : null)
    if (active && active !== theme) apply(active)
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
