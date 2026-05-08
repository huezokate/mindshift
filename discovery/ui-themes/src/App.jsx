import './themes.css';
import './screens/screens.css';
import { Screen1Landing }  from './screens/Screen1Landing';
import { Screen2Wizard }   from './screens/Screen2Wizard';
import { Screen3Canvas }   from './screens/Screen3Canvas';
import { Screen4Lens }     from './screens/Screen4Lens';
import { Screen5Persona }  from './screens/Screen5Persona';

const THEMES = [
  { id: 'dark',   label: 'Cyberpunk Dark', bg: '#080810', labelColor: '#3a5a65' },
  { id: 'bright', label: 'Y2K Kawaii',     bg: '#f0e8ff', labelColor: '#b89fc7' },
  { id: 'paper',  label: 'Paper Journal',  bg: '#faf7f2', labelColor: '#a09890' },
];

const SCREENS = [
  { label: 'Screen 1 — Landing',      Component: Screen1Landing  },
  { label: 'Screen 2 — Wizard',       Component: Screen2Wizard   },
  { label: 'Screen 3 — Canvas',       Component: Screen3Canvas   },
  { label: 'Screen 4 — Choose Lens',  Component: Screen4Lens     },
  { label: 'Screen 5 — Persona View', Component: Screen5Persona  },
];

export default function App() {
  return (
    <div style={{ background: '#111', minHeight: '100vh' }}>
      {THEMES.map(theme => (
        <div key={theme.id} data-theme={theme.id}>
          {/* Theme header */}
          <div style={{
            background: theme.bg,
            padding: '16px 40px 8px',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: theme.labelColor }}>
              {theme.label}
            </span>
          </div>

          {/* Screens row */}
          <div style={{
            display: 'flex',
            gap: 0,
            background: theme.bg,
            paddingBottom: 40,
            overflowX: 'auto',
          }}>
            {SCREENS.map(({ label, Component }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="ms-screen-label">{label}</span>
                <Component />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
