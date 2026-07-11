import type { TokenVar } from './types';

/**
 * Notepad override map — a 1:1 mirror of the declarations in
 * `V200/src/styles/tokens-notepad.css`. Overrides only, exactly like the CSS
 * cascade: any token absent here falls through to the cyberpunk base.
 * Guarded by css-fidelity.test.ts.
 */
export const notepadVars = {
  '--bg': '#faf7f2',
  '--cyan': '#3a6fa8',
  '--green': '#7d9e7d',
  '--pink': '#c0605a',
  '--violet': '#3a6fa8',
  '--amber': '#7d9e7d',

  '--text-body': '#1e1e40',
  '--text-sub': 'rgba(30,30,64,0.55)',
  '--text-h1': '#1e1e40',
  '--text-meta': 'rgba(30,30,64,0.45)',
  '--text-muted': 'rgba(30,30,64,0.3)',

  '--glow-cyan': 'none',
  '--glow-green': 'none',

  '--font-display': "'Georgia', serif",
  '--font-body': "'Inter', sans-serif",
  '--font-btn': "'Inter', sans-serif",
  '--font-mono': "'Inter', sans-serif",
  '--font-alumni': "'Georgia', serif",

  '--card-bg': '#ffffff',
  '--card-bt': '1.5px solid #c0605a',
  '--card-bl': '4px solid #c0605a',
  '--card-br': '1.5px solid #c0605a',
  '--card-bb': '1.5px solid #c0605a',
  '--card-radius': '8px',
  '--card-shadow': 'none',
  '--card-filter': 'drop-shadow(3px 4px 0px #d4cbbf)',

  '--hcard-bg': '#ffffff',
  '--hcard-bt': '1.5px solid #c0605a',
  '--hcard-bl': '4px solid #c0605a',
  '--hcard-br': '1.5px solid #c0605a',
  '--hcard-bb': '1.5px solid #c0605a',
  '--hcard-radius': '8px',
  '--hcard-padding': '16px 24px',

  '--fig-bg': '#faf7f2',
  '--fig-bg-sel': '#ffffff',
  '--fig-border': '1px solid rgba(30,30,64,0.15)',
  '--fig-border-sel': '1.5px solid #3a6fa8',
  '--fig-radius': '8px',
  '--fig-shadow-sel': 'none',
  '--fig-area-bg': '#f0efe9',
  '--fig-initial': 'rgba(30,30,64,0.3)',
  '--fig-initial-sel': '#3a6fa8',
  '--fig-name-unsel': '#1e1e40',
  '--fig-name-sel': '#3a6fa8',
  '--fig-desc': 'rgba(30,30,64,0.5)',

  '--input-bg': '#ffffff',
  '--input-bt': '1.5px solid #3a6fa8',
  '--input-bl': '4px solid #3a6fa8',
  '--input-br': '1.5px solid #3a6fa8',
  '--input-bb': '1.5px solid #3a6fa8',
  '--input-radius': '8px',
  '--input-divider': 'rgba(58,111,168,0.2)',
  '--input-shadow': 'none',
  '--input-header-bg': '#f0efe9',
  '--input-header-shadow': 'none',

  '--btn-secondary-bg': 'var(--bg)',
  '--btn-secondary-shadow': 'none',
  '--btn-secondary-color': '#3a6fa8',
  '--btn-secondary-bt': '1px solid #3a6fa8',
  '--btn-secondary-bl': 'none',
  '--btn-secondary-br': 'none',
  '--btn-secondary-bb': '1px solid #3a6fa8',
  '--btn-secondary-radius': 'var(--btn-radius)',

  '--btn-secondary2-bg': 'var(--bg)',
  '--btn-secondary2-shadow': 'none',
  '--btn-secondary2-color': '#c0605a',
  '--btn-secondary2-bt': '1px solid #c0605a',
  '--btn-secondary2-bl': 'none',
  '--btn-secondary2-br': 'none',
  '--btn-secondary2-bb': '1px solid #c0605a',
  '--btn-secondary2-radius': 'var(--btn-radius)',

  '--fig-avatar-border': '1.5px solid #3a6fa8',
  '--fig-avatar-shadow': 'none',
  '--fig-avatar-grad': 'linear-gradient(135deg, #e8eef5 0%, #eee8f5 100%)',

  '--btn-bg': '#ffffff',
  '--btn-color': '#1e1e40',
  '--btn-bt': '1.5px solid #1e1e40',
  '--btn-bl': '1.5px solid #1e1e40',
  '--btn-br': '1.5px solid #1e1e40',
  '--btn-bb': '1.5px solid #1e1e40',
  '--btn-radius': '8px',
  '--cta-solid-bg': '#ffffff',
  '--cta-solid-bg-disabled': '#ece8e0',
  '--btn-shadow': 'none',
  '--btn-filter': 'drop-shadow(2px 3px 0px #1e1e40)',
  '--btn-letter-spacing': '-1px',
  '--btn-subtext-tracking': '0.2px',

  '--logo-ring': '#3a6fa8',
  '--logo-mark': '#c0605a',
  '--logo-text': '#3a6fa8',
  '--logo-font': 'var(--font-display)',
  '--logo-tracking': '1.2px',

  '--chat-user-accent': '#3a6fa8',
  '--chat-lens-accent': '#c0605a',

  '--fcard-bg': '#ffffff',
  '--fcard-bt': '1px solid #c0605a',
  '--fcard-br': '4px solid #c0605a',
  '--fcard-bb': '2px solid #c0605a',
  '--fcard-bl': '4px solid #c0605a',
  '--fcard-radius': '8px',
  '--fcard-filter': 'drop-shadow(3px 4px 0px #d4cbbf)',
  '--fcard-inset': 'none',
  '--focus-ring': '2px solid #1e1e40',
  '--mm-card-bg-selected': '#eef3ec',
  '--btn-dis-color': 'rgba(30,30,64,0.3)',
  '--btn-dis-border': 'rgba(30,30,64,0.2)',

  '--lens-header-bg': '#fef5f5',
  '--lens-quote-color': 'var(--cyan)',

  '--preview-body': 'var(--text-body)',

  '--preview-glyph': 'var(--cyan)',

  '--share-accent': '#b07d3a',

  '--portrait-filter': 'grayscale(0.55) sepia(0.35) contrast(0.95) brightness(1.02)',

  '--sw-bg': 'transparent',
  '--sw-radius': '0',
  '--sw-btn-radius': '4px',
  '--sw-btn-w': '88px',
  '--sw-btn-h': '36px',
  '--sw-cyberpunk-bg': '#3a6fa8',
  '--sw-kawaii-bg': '#c0605a',
  '--sw-notepad-bg': '#faf7f2',
  '--sw-text': '#ffffff',
  '--sw-notepad-text': '#1e1e40',
  '--sw-border': '1.5px solid #1e1e40',
  '--sw-shadow': '2px 2px 0 rgba(30,30,64,0.6)',
} as const satisfies Partial<Record<TokenVar, string>>;
