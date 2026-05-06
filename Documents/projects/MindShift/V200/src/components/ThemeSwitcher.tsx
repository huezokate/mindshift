'use client'
import { useTheme, THEMES, type Theme } from '@/lib/theme'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="ms-switcher">
      {THEMES.map(t => (
        <button
          key={t}
          data-id={t}
          data-active={String(t === theme)}
          onClick={() => setTheme(t as Theme)}
          className="ms-switcher-btn"
        >
          {t.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
