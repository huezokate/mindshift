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
  // State MUST start at DEFAULT to match what the server rendered (same fix as
  // main, PR #10): reading data-theme in the initializer made the first client
  // render already equal the saved theme, so nothing re-rendered — and React
  // does not patch attribute mismatches on hydration, which left the server's
  // default-theme <img src> (cyberpunk portraits) permanently in the DOM on
  // notepad/kawaii devices. CSS never flashes either way (the inline script in
  // layout.tsx sets data-theme before first paint).
  const [theme, setThemeState] = useState<Theme>(DEFAULT)

  useEffect(() => {
    // Attribute first: in the app the pre-paint inline script already set
    // data-theme FROM localStorage, so they agree — but in Storybook (and any
    // host that pins the attribute directly) the attribute is the live truth
    // while localStorage may hold a stale previous pick.
    const attr = document.documentElement.getAttribute('data-theme') as Theme | null
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    const active = (attr && THEMES.includes(attr) ? attr : null) ?? saved
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
