'use client'
import { useTheme, THEMES, type Theme } from '@/lib/theme'

function playSwoosh() {
  try {
    const ctx = new AudioContext()
    const gain = ctx.createGain()
    gain.connect(ctx.destination)

    // Noise burst for texture
    const bufferSize = ctx.sampleRate * 0.35
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    // Bandpass sweep: high → low frequency
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2400, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.32)
    filter.Q.value = 1.8

    noise.connect(filter)
    filter.connect(gain)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32)

    noise.start(ctx.currentTime)
    noise.stop(ctx.currentTime + 0.35)
  } catch {
    // AudioContext not available (SSR / user gesture not yet received)
  }
}

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="ms-switcher">
      {THEMES.map(t => (
        <button
          key={t}
          data-id={t}
          data-active={String(t === theme)}
          onClick={() => { playSwoosh(); setTheme(t as Theme) }}
          className="ms-switcher-btn"
        >
          {t.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
