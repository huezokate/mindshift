import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// Themed background surfaces (review aid). Each theme gets its world's signature
// texture at very low contrast: notepad = ruled note sheet (no red margin line
// in-app), cyberpunk = CRT scanlines, kawaii = polka-dot grid. The swatches below
// MIRROR the body rules in tokens*.css — if a pattern changes there, update here.
// KawaiiCandidates holds the alternates considered, so the pick is documented.

const SURFACES = {
  notepad: {
    label: 'Notepad — ruled note sheet (in-app: no red margin line)',
    bg: {
      backgroundColor: '#faf7f2',
      backgroundImage:
        'repeating-linear-gradient(to bottom, transparent, transparent 37px, rgba(58,111,168,0.22) 37px, rgba(58,111,168,0.22) 38px)',
    },
    dark: false,
  },
  cyberpunk: {
    label: 'Cyberpunk — CRT scanlines',
    bg: {
      backgroundColor: '#080810',
      backgroundImage:
        'repeating-linear-gradient(to bottom, rgba(140,246,255,0.03) 0px, rgba(140,246,255,0.03) 1px, transparent 1px, transparent 4px)',
    },
    dark: true,
  },
  kawaii: {
    label: 'Kawaii — polka-dot grid (shipped default)',
    bg: {
      backgroundColor: '#ffafd6',
      backgroundImage:
        'radial-gradient(rgba(255,255,255,0.30) 1.6px, transparent 1.7px), radial-gradient(rgba(255,255,255,0.16) 1.6px, transparent 1.7px)',
      backgroundSize: '26px 26px',
      backgroundPosition: '0 0, 13px 13px',
    },
    dark: false,
  },
} as const

const KAWAII_ALTS = {
  dots: { label: 'A — Polka-dot grid (default)', bg: SURFACES.kawaii.bg },
  stripes: {
    label: 'B — Candy stripes (diagonal)',
    bg: {
      backgroundColor: '#ffafd6',
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 16px, transparent 16px, transparent 32px)',
    },
  },
  scallops: {
    label: 'C — Scallop rows (cloud/lace)',
    bg: {
      backgroundColor: '#ffafd6',
      backgroundImage:
        'radial-gradient(circle at 50% 130%, transparent 15px, rgba(255,255,255,0.18) 15px, rgba(255,255,255,0.18) 17px, transparent 17px)',
      backgroundSize: '30px 24px',
    },
  },
} as const

// A stand-in content card so "does the texture distract?" is judged against
// real-ish foreground, not an empty field.
function SampleCard({ dark }: { dark?: boolean }) {
  return (
    <div
      style={{
        maxWidth: 300,
        background: dark ? '#0d0d1a' : '#ffffff',
        border: dark ? '1px solid rgba(0,245,255,0.5)' : '1.5px solid #1e1e40',
        borderRadius: dark ? 2 : 12,
        padding: '16px 18px',
        boxShadow: dark ? '0 0 12px rgba(0,245,255,0.15)' : '2px 3px 0 rgba(30,30,64,0.25)',
      }}
    >
      <p style={{ margin: 0, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: dark ? '#00F5FF' : '#c0605a', fontWeight: 700 }}>
        Sample lens
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5, color: dark ? '#e8e8f2' : '#1e1e40' }}>
        The texture should sit behind this card like a room, not a rival. If your eye keeps leaving this sentence, it&apos;s too loud.
      </p>
    </div>
  )
}

function Swatch({ label, bg, dark }: { label: string; bg: React.CSSProperties; dark?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#444' }}>{label}</p>
      <div style={{ ...bg, height: 340, borderRadius: 8, border: '1px solid #d9d9e3', display: 'grid', placeItems: 'center' }}>
        <SampleCard dark={dark} />
      </div>
    </div>
  )
}

const meta: Meta = { title: 'Themes/Backgrounds' }
export default meta
type Story = StoryObj

// The three shipped surfaces side by side.
export const AllThreeSurfaces: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, padding: 8 }}>
      {Object.values(SURFACES).map(s => (
        <Swatch key={s.label} label={s.label} bg={s.bg as React.CSSProperties} dark={s.dark} />
      ))}
    </div>
  ),
}

// Kawaii texture candidates — pick one; the winner lives in tokens-kawaii.css.
export const KawaiiCandidates: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, padding: 8 }}>
      {Object.values(KAWAII_ALTS).map(s => (
        <Swatch key={s.label} label={s.label} bg={s.bg as React.CSSProperties} />
      ))}
    </div>
  ),
}
