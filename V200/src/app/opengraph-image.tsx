import { ImageResponse } from 'next/og'

export const alt = 'MindShift — AI journaling that shifts your perspective'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Branded social-share card, generated at the edge (no design asset needed).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#faf7f2',
          padding: '80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#c0605a',
            fontWeight: 700,
          }}
        >
          MindShift
        </div>
        <div
          style={{
            fontSize: 78,
            lineHeight: 1.05,
            color: '#1f2937',
            fontWeight: 700,
            marginTop: 24,
            maxWidth: 980,
          }}
        >
          Vent it. Reframe it. Shift your perspective.
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#5b6573',
            marginTop: 28,
            maxWidth: 940,
            lineHeight: 1.3,
          }}
        >
          AI journaling through history’s greatest minds — plus mind mapping for clearer thinking.
        </div>
        <div style={{ display: 'flex', marginTop: 48, gap: 14 }}>
          {['Journaling', 'Perspective shift', 'Mind mapping'].map(t => (
            <div
              key={t}
              style={{
                fontSize: 24,
                color: '#3a6fa8',
                border: '2px solid #3a6fa8',
                borderRadius: 999,
                padding: '8px 22px',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
