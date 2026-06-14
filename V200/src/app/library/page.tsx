// Component Library — dev reference page, not linked from main nav
// View at http://localhost:3000/library

type ThemeVars = { [key: string]: string }

// ─── Theme token maps ────────────────────────────────────────────────────────

const CYBERPUNK: ThemeVars = {
  '--bg':                 '#080810',
  '--card-bg-raw':        '#0d0d1a',
  '--cyan':               '#00F5FF',
  '--green':              '#39FF14',
  '--pink':               '#FF2D78',
  '--violet':             '#B04CFF',
  '--amber':              '#FFB800',
  '--text-body':          '#E0F7FF',
  '--text-sub':           '#7ECFDF',
  '--text-h1':            '#E0F7FF',
  '--text-meta':          '#3697B8',
  '--text-muted':         'rgba(224,247,255,0.45)',
  '--font-display':       "'Alumni Sans SC', 'Courier New', sans-serif",
  '--font-body':          "'Courier New', 'Lucida Console', monospace",
  '--font-btn':           "'Alumni Sans SC', 'Courier New', sans-serif",
  '--card-bg':            '#0d0d1a',
  '--card-bt':            '4px solid #00F5FF',
  '--card-bl':            '4px solid #00F5FF',
  '--card-br':            '1px solid #00F5FF',
  '--card-bb':            '1px solid #00F5FF',
  '--card-radius':        '4px',
  '--card-shadow':        'none',
  '--card-filter':        'none',
  '--hcard-bg':           '#0d0d1a',
  '--hcard-bt':           '1px solid #FF2D78',
  '--hcard-bl':           '4px solid #FF2D78',
  '--hcard-br':           '4px solid #FF2D78',
  '--hcard-bb':           '2px solid #FF2D78',
  '--hcard-radius':       '4px',
  '--hcard-padding':      '16px 24px',
  '--input-bg':           'rgba(13,13,26,0.8)',
  '--input-bt':           '4px solid #00F5FF',
  '--input-bl':           '4px solid #00F5FF',
  '--input-br':           '1px solid #00F5FF',
  '--input-bb':           '1px solid #00F5FF',
  '--input-radius':       '4px',
  '--input-divider':      '#00F5FF',
  '--input-shadow':       'none',
  '--input-header-bg':    'rgba(0,245,255,0.06)',
  '--input-header-shadow':'none',
  '--btn-bg':             'transparent',
  '--btn-color':          '#39FF14',
  '--btn-bt':             '1px solid #39FF14',
  '--btn-bl':             '4px solid #39FF14',
  '--btn-br':             '1px solid #39FF14',
  '--btn-bb':             '4px solid #39FF14',
  '--btn-radius':         '2px',
  '--btn-shadow':         '0 0 12px rgba(57,255,20,0.2)',
  '--btn-filter':         'none',
  '--btn-letter-spacing': '3px',
  '--btn-dis-color':      'rgba(255,255,255,0.2)',
  '--btn-dis-border':     'rgba(255,255,255,0.1)',
  '--btn-secondary-bg':    'transparent',
  '--btn-secondary-shadow':'none',
  '--btn-secondary-color': '#FF2D78',
  '--btn-secondary-bt':    '1px solid #FF2D78',
  '--btn-secondary-bl':    '1px solid #FF2D78',
  '--btn-secondary-br':    '2px solid #FF2D78',
  '--btn-secondary-bb':    '2px solid #FF2D78',
  '--btn-secondary-radius':'2px',
  '--btn-secondary2-bg':   'transparent',
  '--btn-secondary2-shadow':'none',
  '--btn-secondary2-color':'#00F5FF',
  '--btn-secondary2-bt':   '1px solid #00F5FF',
  '--btn-secondary2-bl':   '1px solid #00F5FF',
  '--btn-secondary2-br':   '2px solid #00F5FF',
  '--btn-secondary2-bb':   '2px solid #00F5FF',
  '--btn-secondary2-radius':'2px',
  '--lens-header-bg':     'rgba(0,245,255,0.04)',
  '--lens-quote-color':   '#00F5FF',
  '--fig-bg':             '#0d0d1c',
  '--fig-border':         '1px solid #B04CFF',
  '--fig-radius':         '2px',
  '--fig-area-bg':        '#0d0d1a',
  '--fig-initial':        'rgba(176,76,255,0.4)',
  '--fig-name-unsel':     '#EEFFEA',
  '--fig-desc':           '#EEFFEA',
  '--fig-avatar-border':  '2px solid #39FF14',
  '--fig-avatar-shadow':  '0 0 12px rgba(57,255,20,0.3)',
  '--fig-avatar-grad':    'linear-gradient(135deg, rgba(0,245,255,0.1) 0%, rgba(176,76,255,0.1) 100%)',
}

const KAWAII: ThemeVars = {
  '--bg':                 '#ffafd6',
  '--cyan':               '#ff50c5',
  '--green':              '#49dbc8',
  '--pink':               '#ff50c5',
  '--violet':             '#ff50c5',
  '--amber':              '#ffe2ac',
  '--text-body':          '#270007',
  '--text-sub':           'rgba(39,0,7,0.5)',
  '--text-h1':            '#270007',
  '--text-meta':          'rgba(39,0,7,0.35)',
  '--text-muted':         'rgba(39,0,7,0.25)',
  '--font-display':       "'Nunito Sans', sans-serif",
  '--font-body':          "'Nunito Sans', sans-serif",
  '--font-btn':           "'Fredoka', sans-serif",
  '--card-bg':            '#ffffff',
  '--card-bt':            '1px solid #400b14',
  '--card-bl':            '2px solid #400b14',
  '--card-br':            '4px solid #400b14',
  '--card-bb':            '1px solid #400b14',
  '--card-radius':        '32px',
  '--card-shadow':        'inset 4px 0 0 0 rgba(64,11,20,0.5)',
  '--card-filter':        'none',
  '--hcard-bg':           '#ffffff',
  '--hcard-bt':           '1px solid #400b14',
  '--hcard-bl':           '2px solid #400b14',
  '--hcard-br':           '4px solid #400b14',
  '--hcard-bb':           '1px solid #400b14',
  '--hcard-radius':       '32px',
  '--hcard-padding':      '20px 24px',
  '--input-bg':           '#ffffff',
  '--input-bt':           '1px solid #270007',
  '--input-bl':           '2px solid #270007',
  '--input-br':           '4px solid #270007',
  '--input-bb':           '1px solid #270007',
  '--input-radius':       '32px',
  '--input-divider':      'rgba(39,0,7,0.15)',
  '--input-shadow':       'inset 4px 0 0 0 #49dbc8',
  '--input-header-bg':    '#e5fcfa',
  '--input-header-shadow':'inset 4px 0 0 0 #49dbc8',
  '--btn-bg':             '#ffe2ac',
  '--btn-color':          '#270007',
  '--btn-bt':             '1px solid #400b14',
  '--btn-bl':             '2px solid #400b14',
  '--btn-br':             '4px solid #400b14',
  '--btn-bb':             '1px solid #400b14',
  '--btn-radius':         '32px',
  '--btn-shadow':         'none',
  '--btn-filter':         'none',
  '--btn-letter-spacing': '2px',
  '--btn-dis-color':      'rgba(39,0,7,0.3)',
  '--btn-dis-border':     'rgba(64,11,20,0.2)',
  '--btn-secondary-bg':    '#e5fcfa',
  '--btn-secondary-shadow':'inset 4px 0 0 0 #49dbc8',
  '--btn-secondary-color': '#270007',
  '--btn-secondary-bt':    '1px solid #400b14',
  '--btn-secondary-bl':    '2px solid #400b14',
  '--btn-secondary-br':    '4px solid #400b14',
  '--btn-secondary-bb':    '1px solid #400b14',
  '--btn-secondary-radius':'32px',
  '--btn-secondary2-bg':   '#ffe1ff',
  '--btn-secondary2-shadow':'inset 4px 0 0 0 #ff50c5',
  '--btn-secondary2-color':'#270007',
  '--btn-secondary2-bt':   '1px solid #400b14',
  '--btn-secondary2-bl':   '2px solid #400b14',
  '--btn-secondary2-br':   '4px solid #400b14',
  '--btn-secondary2-bb':   '1px solid #400b14',
  '--btn-secondary2-radius':'32px',
  '--lens-header-bg':     '#ffe1ff',
  '--lens-quote-color':   '#cf006f',
  '--fig-bg':             '#ffffff',
  '--fig-border':         '2px solid #400b14',
  '--fig-radius':         '32px',
  '--fig-area-bg':        '#e5fcfa',
  '--fig-initial':        'rgba(64,11,20,0.3)',
  '--fig-name-unsel':     '#7e2091',
  '--fig-desc':           '#9490b8',
  '--fig-avatar-border':  '2px solid #ff50c5',
  '--fig-avatar-shadow':  '0px 2px 8px 0px rgba(130,100,240,0.13)',
  '--fig-avatar-grad':    'linear-gradient(135deg, #c8dcf9 0%, #d9c8f9 100%)',
}

const NOTEPAD: ThemeVars = {
  '--bg':                 '#faf7f2',
  '--cyan':               '#3a6fa8',
  '--green':              '#7d9e7d',
  '--pink':               '#c0605a',
  '--violet':             '#3a6fa8',
  '--amber':              '#7d9e7d',
  '--text-body':          '#1e1e40',
  '--text-sub':           'rgba(30,30,64,0.55)',
  '--text-h1':            '#1e1e40',
  '--text-meta':          'rgba(30,30,64,0.45)',
  '--text-muted':         'rgba(30,30,64,0.3)',
  '--font-display':       'Georgia, serif',
  '--font-body':          "'Inter', sans-serif",
  '--font-btn':           "'Inter', sans-serif",
  '--card-bg':            '#ffffff',
  '--card-bt':            '1.5px solid #c0605a',
  '--card-bl':            '4px solid #c0605a',
  '--card-br':            '1.5px solid #c0605a',
  '--card-bb':            '1.5px solid #c0605a',
  '--card-radius':        '8px',
  '--card-shadow':        'none',
  '--card-filter':        'drop-shadow(3px 4px 0px #d4cbbf)',
  '--hcard-bg':           '#ffffff',
  '--hcard-bt':           '1.5px solid #c0605a',
  '--hcard-bl':           '4px solid #c0605a',
  '--hcard-br':           '1.5px solid #c0605a',
  '--hcard-bb':           '1.5px solid #c0605a',
  '--hcard-radius':       '8px',
  '--hcard-padding':      '16px 24px',
  '--input-bg':           '#ffffff',
  '--input-bt':           '1.5px solid #3a6fa8',
  '--input-bl':           '4px solid #3a6fa8',
  '--input-br':           '1.5px solid #3a6fa8',
  '--input-bb':           '1.5px solid #3a6fa8',
  '--input-radius':       '8px',
  '--input-divider':      'rgba(58,111,168,0.2)',
  '--input-shadow':       'none',
  '--input-header-bg':    '#f0efe9',
  '--input-header-shadow':'none',
  '--btn-bg':             '#ffffff',
  '--btn-color':          '#1e1e40',
  '--btn-bt':             '1.5px solid #1e1e40',
  '--btn-bl':             '4px solid #1e1e40',
  '--btn-br':             '1.5px solid #1e1e40',
  '--btn-bb':             '1.5px solid #1e1e40',
  '--btn-radius':         '8px',
  '--btn-shadow':         'none',
  '--btn-filter':         'drop-shadow(2px 3px 0px #1e1e40)',
  '--btn-letter-spacing': '-1px',
  '--btn-dis-color':      'rgba(30,30,64,0.3)',
  '--btn-dis-border':     'rgba(30,30,64,0.2)',
  '--btn-secondary-bg':    'transparent',
  '--btn-secondary-shadow':'none',
  '--btn-secondary-color': '#7d9e7d',
  '--btn-secondary-bt':    '1px solid #7d9e7d',
  '--btn-secondary-bl':    'none',
  '--btn-secondary-br':    'none',
  '--btn-secondary-bb':    '1px solid #7d9e7d',
  '--btn-secondary-radius':'0',
  '--btn-secondary2-bg':   'transparent',
  '--btn-secondary2-shadow':'none',
  '--btn-secondary2-color':'#c0605a',
  '--btn-secondary2-bt':   '1px solid #c0605a',
  '--btn-secondary2-bl':   'none',
  '--btn-secondary2-br':   'none',
  '--btn-secondary2-bb':   '1px solid #c0605a',
  '--btn-secondary2-radius':'0',
  '--lens-header-bg':     '#fef5f5',
  '--lens-quote-color':   '#3a6fa8',
  '--fig-bg':             '#faf7f2',
  '--fig-border':         '1px solid rgba(30,30,64,0.15)',
  '--fig-radius':         '8px',
  '--fig-area-bg':        '#f0efe9',
  '--fig-initial':        'rgba(30,30,64,0.3)',
  '--fig-name-unsel':     '#1e1e40',
  '--fig-desc':           'rgba(30,30,64,0.6)',
  '--fig-avatar-border':  '1.5px solid #3a6fa8',
  '--fig-avatar-shadow':  'none',
  '--fig-avatar-grad':    'linear-gradient(135deg, #e8eef5 0%, #eee8f5 100%)',
}

const THEMES = [
  { key: 'cyberpunk', label: 'Cyberpunk', accent: '#00F5FF', vars: CYBERPUNK },
  { key: 'kawaii',    label: 'Kawaii',    accent: '#ff50c5', vars: KAWAII },
  { key: 'notepad',  label: 'Notepad',   accent: '#3a6fa8', vars: NOTEPAD },
]

// ─── Share icon ───────────────────────────────────────────────────────────────

function ShareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
      <path d="M12 2.5L7.5 7H11v9h2V7h3.5L12 2.5z"/>
      <path d="M3 13.5V20c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5V13.5h-2V20H5v-6.5H3z"/>
    </svg>
  )
}

// ─── Session Card (per-theme preview) ─────────────────────────────────────────

function SessionCardPreview({ themeKey }: { themeKey: string }) {
  const titleDisplay = 'LOREM IPSUM DOLOR SIT...'
  const ventText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

  const avatarColors: Record<string, string> = {
    cyberpunk: '1px solid #39FF14',
    kawaii: '1px solid #ff50c5',
    notepad: '2px solid #c0605a',
  }
  const avatarBorder = avatarColors[themeKey] ?? avatarColors.cyberpunk

  if (themeKey === 'cyberpunk') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: 'var(--card-bg)',
          borderTop: '4px solid var(--cyan)',
          borderLeft: '4px solid var(--cyan)',
          borderRight: '1px solid var(--cyan)',
          borderBottom: '1px solid var(--cyan)',
          borderRadius: 'var(--card-radius)',
          height: 164,
          marginBottom: -4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ borderBottom: '1px solid var(--cyan)', padding: '8px 16px 2px', flexShrink: 0 }}>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: '1.32px', lineHeight: '14px', color: 'var(--cyan)', textTransform: 'uppercase', textAlign: 'center' }}>
              {titleDisplay}
            </p>
          </div>
          <div style={{ padding: '4px 16px', flex: 1, overflow: 'hidden' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.52px', color: 'var(--text-body)' }}>
              {ventText}
            </p>
          </div>
        </div>
        <div style={{ background: 'var(--card-bg)', borderTop: '1px solid var(--violet)', borderLeft: '1px solid var(--violet)', borderRight: '4px solid var(--violet)', borderBottom: '4px solid var(--violet)', borderRadius: 'var(--card-radius)', padding: '8px 8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--cyan)' }}>
          <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShareIcon /></div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 48, height: 48, borderRadius: '50%', border: avatarBorder, background: 'var(--fig-avatar-grad)', flexShrink: 0, marginRight: i < 2 ? -4 : 0, position: 'relative', zIndex: i + 1 }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (themeKey === 'kawaii') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: -4 }}>
          <div style={{ background: 'var(--input-header-bg)', boxShadow: 'inset 4px 0 0 0 var(--green)', borderTop: 'var(--input-bt)', borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)', borderBottom: '1px solid var(--input-divider)', borderRadius: '32px 32px 0 0', padding: '8px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: '0.52px', lineHeight: '14px', color: 'var(--text-body)', textTransform: 'uppercase' }}>
              {titleDisplay}
            </p>
          </div>
          <div style={{ background: 'var(--card-bg)', boxShadow: 'inset 4px 0 0 0 var(--green)', borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)', borderBottom: 'var(--input-bb)', borderRadius: '0 0 32px 32px', height: 140, overflow: 'hidden', padding: '4px 8px 4px 16px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.52px', color: 'var(--text-body)' }}>
              {ventText}
            </p>
          </div>
        </div>
        <div style={{ background: 'var(--lens-header-bg)', boxShadow: 'inset 4px 0 0 0 var(--violet)', borderTop: 'var(--input-bt)', borderLeft: 'var(--input-bl)', borderRight: 'var(--input-br)', borderBottom: 'var(--input-bb)', borderRadius: '32px', overflow: 'hidden', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--pink)' }}>
          <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShareIcon /></div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 48, height: 48, borderRadius: '50%', border: avatarBorder, boxShadow: '0px 2px 8px 0px rgba(130,100,240,0.13)', background: 'var(--fig-avatar-grad)', flexShrink: 0, marginRight: i < 2 ? -4 : 0, position: 'relative', zIndex: i + 1 }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // notepad
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ filter: 'var(--card-filter)', marginBottom: -4 }}>
        <div style={{ background: 'var(--card-bg)', borderTop: '1.5px solid var(--cyan)', borderLeft: '4px solid var(--cyan)', borderRight: '1.5px solid var(--cyan)', borderBottom: '1.5px solid var(--cyan)', borderRadius: '8px 8px 0 0', padding: '8px 16px 2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, letterSpacing: '0.55px', lineHeight: '14px', color: 'var(--cyan)', textTransform: 'uppercase', textAlign: 'center' }}>
            {titleDisplay}
          </p>
        </div>
        <div style={{ background: 'var(--card-bg)', borderLeft: '4px solid var(--cyan)', borderRight: '1.5px solid var(--cyan)', borderBottom: '1.5px solid var(--cyan)', borderRadius: '0 0 8px 8px', height: 140, overflow: 'hidden', padding: '4px 16px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', letterSpacing: '0.18px', color: 'var(--text-body)' }}>
            {ventText}
          </p>
        </div>
      </div>
      <div style={{ filter: 'var(--card-filter)', background: 'var(--card-bg)', borderTop: '1.5px solid var(--green)', borderLeft: '4px solid var(--green)', borderRight: '1.5px solid var(--green)', borderBottom: '1.5px solid var(--green)', borderRadius: '8px', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-body)' }}>
        <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShareIcon /></div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 48, height: 48, borderRadius: '50%', border: avatarBorder, background: 'var(--fig-avatar-grad)', flexShrink: 0, marginRight: i < 2 ? -4 : 0, position: 'relative', zIndex: i + 1 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Lens Response Card (per-theme preview) ───────────────────────────────────

function LensResponseCardPreview({ themeKey }: { themeKey: string }) {
  const quote = 'You may not control all the events that happen to you, but you can decide not to be reduced by them.'
  const responseText = 'Every uncertainty you feel about your path is an invitation to grow deeper into who you are. The questioning itself is the compass.'

  if (themeKey === 'cyberpunk') {
    return (
      <div style={{
        background: 'var(--card-bg)',
        borderTop: '1px solid var(--violet)',
        borderLeft: '1px solid var(--violet)',
        borderRight: '4px solid var(--violet)',
        borderBottom: '4px solid var(--violet)',
        borderRadius: 'var(--card-radius)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '4px 16px',
          borderBottom: '1px solid var(--violet)',
        }}>
          <div style={{
            width: 24, height: 24,
            borderRadius: 16,
            border: '1px solid var(--pink)',
            background: 'var(--fig-avatar-grad)',
            flexShrink: 0,
          }} />
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '1.32px',
            lineHeight: '14px',
            color: 'var(--green)',
            textTransform: 'uppercase',
          }}>
            Maya Angelou
          </p>
        </div>
        <div style={{ padding: 16 }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '0.52px',
            color: 'var(--cyan)',
          }}>
            {responseText}
          </p>
        </div>
      </div>
    )
  }

  if (themeKey === 'kawaii') {
    return (
      <div>
        <div style={{
          background: 'var(--lens-header-bg)',
          boxShadow: 'inset 4px 0 0 0 var(--cyan)',
          borderTop: 'var(--input-bt)',
          borderLeft: 'var(--input-bl)',
          borderRight: 'var(--input-br)',
          borderBottom: '1px solid var(--input-divider)',
          borderRadius: 'var(--input-radius) var(--input-radius) 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
        }}>
          <div style={{
            width: 24, height: 24,
            borderRadius: '50%',
            border: 'var(--fig-avatar-border)',
            boxShadow: 'var(--fig-avatar-shadow)',
            background: 'var(--fig-avatar-grad)',
            flexShrink: 0,
          }} />
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.52px',
            lineHeight: '14px',
            color: 'var(--text-body)',
            textTransform: 'uppercase',
          }}>
            Maya Angelou
          </p>
        </div>
        <div style={{
          background: 'var(--card-bg)',
          boxShadow: 'inset 4px 0 0 0 var(--cyan)',
          borderLeft: 'var(--input-bl)',
          borderRight: 'var(--input-br)',
          borderBottom: 'var(--input-bb)',
          borderRadius: '0 0 var(--input-radius) var(--input-radius)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '0.52px',
            color: 'var(--lens-quote-color)',
            textAlign: 'center',
          }}>
            &ldquo;{quote}&rdquo;
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '0.52px',
            color: 'var(--text-body)',
          }}>
            {responseText}
          </p>
        </div>
      </div>
    )
  }

  // notepad
  return (
    <div style={{ filter: 'var(--card-filter)' }}>
      <div style={{
        background: 'var(--card-bg)',
        borderTop: '1.5px solid var(--green)',
        borderLeft: '4px solid var(--green)',
        borderRight: '1.5px solid var(--green)',
        borderRadius: 'var(--card-radius) var(--card-radius) 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '4px 22px',
      }}>
        <div style={{
          width: 24, height: 24,
          borderRadius: 16,
          border: '1px solid var(--pink)',
          background: 'var(--fig-avatar-grad)',
          flexShrink: 0,
        }} />
        <p style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.55px',
          lineHeight: '14px',
          color: 'var(--green)',
          textTransform: 'uppercase',
        }}>
          Maya Angelou
        </p>
      </div>
      <div style={{
        background: 'var(--card-bg)',
        borderLeft: '4px solid var(--green)',
        borderRight: '1.5px solid var(--green)',
        borderBottom: '1.5px solid var(--green)',
        borderRadius: '0 0 var(--card-radius) var(--card-radius)',
        padding: 16,
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          lineHeight: '20px',
          letterSpacing: '0.18px',
          color: 'var(--text-body)',
        }}>
          {responseText}
        </p>
      </div>
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'monospace',
      fontSize: 9,
      letterSpacing: '0.12em',
      color: '#555',
      textTransform: 'uppercase',
      marginTop: 28,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottom: '1px solid #222',
    }}>
      {children}
    </p>
  )
}

// ─── Components (all use var(--*) — theme resolved by parent div) ─────────────

function AllComponents({ themeKey }: { themeKey: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Color palette ─────────────────────────────────── */}
      <SectionLabel>Color Palette</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[
          ['--bg',       'bg'],
          ['--cyan',     'cyan'],
          ['--green',    'green'],
          ['--pink',     'pink'],
          ['--violet',   'violet'],
          ['--amber',    'amber'],
          ['--card-bg',  'card-bg'],
          ['--text-body','text-body'],
          ['--text-sub', 'text-sub'],
        ].map(([v, label]) => (
          <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 40,
              height: 40,
              background: `var(${v})`,
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.08)',
            }} />
            <span style={{ fontFamily: 'monospace', fontSize: 8, color: '#555' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Typography ────────────────────────────────────── */}
      <SectionLabel>Typography</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1 }}>
          Heading H1
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-h1)', textTransform: 'uppercase', letterSpacing: 1.44, lineHeight: '20px' }}>
          Heading H2
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: 1, lineHeight: '14px' }}>
          Subheader / Label
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-body)', letterSpacing: 0.52, lineHeight: '20px' }}>
          Body text — Regular 14px. Let it all out, then see it through the eyes of someone who lived through years of history.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-sub)', letterSpacing: 0.4, lineHeight: '18px' }}>
          Subtext — 13px secondary color
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, lineHeight: '12px' }}>
          Tooltip / Meta — 10px uppercase
        </p>
        <p style={{ fontFamily: 'var(--font-btn)', fontSize: 14, fontWeight: 600, color: 'var(--btn-color)', textTransform: 'uppercase', letterSpacing: 'var(--btn-letter-spacing)', lineHeight: '16px' }}>
          Button Text
        </p>
      </div>

      {/* ── Heading Card (hcard) ──────────────────────────── */}
      <SectionLabel>Heading Card</SectionLabel>
      <div style={{
        background: 'var(--hcard-bg)',
        borderTop: 'var(--hcard-bt)',
        borderLeft: 'var(--hcard-bl)',
        borderRight: 'var(--hcard-br)',
        borderBottom: 'var(--hcard-bb)',
        borderRadius: 'var(--hcard-radius)',
        padding: 'var(--hcard-padding)',
      }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--cyan)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1 }}>
          Journal
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-sub)', textAlign: 'center', marginTop: 6, letterSpacing: 0.4 }}>
          Your saved perspectives
        </p>
      </div>

      {/* ── Content Card ─────────────────────────────────── */}
      <SectionLabel>Content Card</SectionLabel>
      <div style={{
        background: 'var(--card-bg)',
        borderTop: 'var(--card-bt)',
        borderLeft: 'var(--card-bl)',
        borderRight: 'var(--card-br)',
        borderBottom: 'var(--card-bb)',
        borderRadius: 'var(--card-radius)',
        padding: '20px 24px',
        boxShadow: 'var(--card-shadow)',
        filter: 'var(--card-filter)',
      }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 1.44, lineHeight: '20px', marginBottom: 8 }}>
          Mind-mapping tool
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-body)', letterSpacing: 0.52, lineHeight: '20px', marginBottom: 8 }}>
          Reflect, plan and achieve new horizons with step by step guidance
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, lineHeight: '12px' }}>
          career · health & wellness · creativity · relationships
        </p>
      </div>

      {/* ── Input Field Card ─────────────────────────────── */}
      <SectionLabel>Input Field Card</SectionLabel>
      <div style={{
        borderTop: 'var(--input-bt)',
        borderLeft: 'var(--input-bl)',
        borderRight: 'var(--input-br)',
        borderBottom: 'var(--input-bb)',
        borderRadius: 'var(--input-radius)',
        overflow: 'hidden',
        boxShadow: 'var(--input-shadow)',
      }}>
        <div style={{
          background: 'var(--input-header-bg)',
          boxShadow: 'var(--input-header-shadow)',
          padding: '8px 16px',
          borderBottom: '1px solid var(--input-divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, letterSpacing: 1, color: 'var(--text-body)', textTransform: 'uppercase' }}>
            Dump it all here:
          </p>
        </div>
        <div style={{ background: 'var(--input-bg)', padding: '12px 16px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: '20px', color: 'var(--text-body)', letterSpacing: 0.52 }}>
            I keep second-guessing my career choice. Everyone around me seems so sure about what they're doing, but I'm constantly wondering if I chose the right path.
          </p>
        </div>
        <div style={{ background: 'var(--input-bg)', borderTop: '1px solid var(--input-divider)', padding: '4px 12px', display: 'flex', justifyContent: 'flex-end' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-sub)', letterSpacing: 1, textTransform: 'uppercase' }}>
            215/800 characters
          </p>
        </div>
      </div>

      {/* ── Buttons ──────────────────────────────────────── */}
      <SectionLabel>Buttons</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Primary */}
        <div style={{
          fontFamily: 'var(--font-btn)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--btn-color)',
          background: 'var(--btn-bg)',
          borderTop: 'var(--btn-bt)',
          borderLeft: 'var(--btn-bl)',
          borderRight: 'var(--btn-br)',
          borderBottom: 'var(--btn-bb)',
          borderRadius: 'var(--btn-radius)',
          padding: '16px 12px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 'var(--btn-letter-spacing)',
          boxShadow: 'var(--btn-shadow)',
          filter: 'var(--btn-filter)',
        }}>
          Primary — Select the Lens
        </div>
        {/* Secondary 1 */}
        <div style={{
          fontFamily: 'var(--font-btn)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--btn-secondary-color)',
          background: 'var(--btn-secondary-bg)',
          borderTop: 'var(--btn-secondary-bt)',
          borderLeft: 'var(--btn-secondary-bl)',
          borderRight: 'var(--btn-secondary-br)',
          borderBottom: 'var(--btn-secondary-bb)',
          borderRadius: 'var(--btn-secondary-radius)',
          padding: '10px 20px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 'var(--btn-letter-spacing)',
          boxShadow: 'var(--btn-secondary-shadow)',
        }}>
          Secondary 1 — Sign Up
        </div>
        {/* Secondary 2 */}
        <div style={{
          fontFamily: 'var(--font-btn)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--btn-secondary2-color)',
          background: 'var(--btn-secondary2-bg)',
          borderTop: 'var(--btn-secondary2-bt)',
          borderLeft: 'var(--btn-secondary2-bl)',
          borderRight: 'var(--btn-secondary2-br)',
          borderBottom: 'var(--btn-secondary2-bb)',
          borderRadius: 'var(--btn-secondary2-radius)',
          padding: '10px 20px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 'var(--btn-letter-spacing)',
          boxShadow: 'var(--btn-secondary2-shadow)',
        }}>
          Secondary 2 — Confirm
        </div>
        {/* Disabled */}
        <div style={{
          fontFamily: 'var(--font-btn)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--btn-dis-color)',
          background: 'transparent',
          border: '1px solid var(--btn-dis-border)',
          borderRadius: 'var(--btn-radius)',
          padding: '16px 12px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 'var(--btn-letter-spacing)',
        }}>
          Disabled State
        </div>
      </div>

      {/* ── Session Card ─────────────────────────────────── */}
      <SectionLabel>Session Card (Journal Entry)</SectionLabel>
      <SessionCardPreview themeKey={themeKey} />

      {/* ── Lens Response Card ───────────────────────────── */}
      <SectionLabel>Lens Response Card</SectionLabel>
      <LensResponseCardPreview themeKey={themeKey} />

      {/* ── Figure Selector Card ─────────────────────────── */}
      <SectionLabel>Figure Selector Card</SectionLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        {/* Unselected */}
        <div style={{
          background: 'var(--fig-bg)',
          border: 'var(--fig-border)',
          borderRadius: 'var(--fig-radius)',
          padding: 12,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: '100%',
            background: 'var(--fig-area-bg)',
            borderRadius: 'calc(var(--fig-radius) / 2)',
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fig-initial)' }}>S</p>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, color: 'var(--fig-name-unsel)', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
            Socrates
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fig-desc)', textAlign: 'center', lineHeight: '13px' }}>
            Question everything
          </p>
        </div>
        {/* Selected */}
        <div style={{
          background: 'var(--fig-bg)',
          border: 'var(--fig-avatar-border)',
          borderRadius: 'var(--fig-radius)',
          boxShadow: 'inset 2px 0 0 0 var(--cyan)',
          padding: 12,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: '100%',
            background: 'var(--fig-area-bg)',
            borderRadius: 'calc(var(--fig-radius) / 2)',
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--cyan)' }}>M</p>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 11, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
            Maya Angelou ✓
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fig-desc)', textAlign: 'center', lineHeight: '13px' }}>
            Voice & expression
          </p>
        </div>
      </div>

      {/* Bottom spacer */}
      <div style={{ height: 40 }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100dvh', padding: '28px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          MindShift Component Library
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', letterSpacing: '0.08em' }}>
          All components across 3 design systems — scroll right to compare
        </p>
      </div>

      {/* Theme columns */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 40 }}>
        {THEMES.map(theme => (
          <div
            key={theme.key}
            style={{
              minWidth: 380,
              maxWidth: 440,
              flexShrink: 0,
              ...theme.vars,
            }}
          >
            {/* Theme label bar */}
            <div style={{
              background: theme.accent,
              padding: '8px 16px',
              marginBottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#000', letterSpacing: '0.1em' }}>
                {theme.label.toUpperCase()}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(0,0,0,0.6)' }}>
                {theme.key}
              </span>
            </div>

            {/* Theme background wrapper */}
            <div style={{ background: 'var(--bg)', padding: '8px 16px 0' }}>
              <AllComponents themeKey={theme.key} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
