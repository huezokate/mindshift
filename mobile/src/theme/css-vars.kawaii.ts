import type { TokenVar } from './types';

/**
 * Kawaii override map — a 1:1 mirror of the declarations in
 * `V200/src/styles/tokens-kawaii.css`. Overrides only, exactly like the CSS
 * cascade: any token absent here falls through to the cyberpunk base.
 * Guarded by css-fidelity.test.ts.
 */
export const kawaiiVars = {
  '--bg': '#ffafd6',
  '--cyan': '#ff50c5',
  '--green': '#49dbc8',
  '--pink': '#ff50c5',
  '--violet': '#ff50c5',
  '--amber': '#ffe2ac',

  '--text-body': '#270007',
  '--text-sub': 'rgba(39,0,7,0.5)',
  '--text-h1': '#270007',
  '--text-meta': 'rgba(39,0,7,0.35)',
  '--text-muted': 'rgba(39,0,7,0.25)',

  '--glow-cyan': 'none',
  '--glow-green': 'none',

  '--font-display': "'Nunito Sans', sans-serif",
  '--font-body': "'Nunito Sans', sans-serif",
  '--font-btn': "'Fredoka', sans-serif",
  '--font-mono': "'Nunito Sans', sans-serif",
  '--font-alumni': "'Nunito Sans', sans-serif",

  '--card-bg': '#ffffff',
  '--card-bt': '1px solid #400b14',
  '--card-bl': '2px solid #400b14',
  '--card-br': '4px solid #400b14',
  '--card-bb': '1px solid #400b14',
  '--card-radius': '32px',
  '--card-shadow': 'inset 4px 0 0 0 rgba(64,11,20,0.5)',
  '--card-filter': 'none',

  '--hcard-bg': '#ffffff',
  '--hcard-bt': '1px solid #400b14',
  '--hcard-bl': '2px solid #400b14',
  '--hcard-br': '4px solid #400b14',
  '--hcard-bb': '1px solid #400b14',
  '--hcard-radius': '32px',
  '--hcard-padding': '20px 24px',

  '--fig-bg': '#ffffff',
  '--fig-bg-sel': '#fff0f8',
  '--fig-border': '2px solid #400b14',
  '--fig-border-sel': '2px solid #ff50c5',
  '--fig-radius': '32px',
  '--fig-shadow-sel': 'inset 2px 0 0 0 #ff50c5',
  '--fig-area-bg': '#e5fcfa',
  '--fig-initial': 'rgba(64,11,20,0.3)',
  '--fig-initial-sel': '#ff50c5',
  '--fig-name-unsel': '#7e2091',
  '--fig-name-sel': '#ff50c5',
  '--fig-desc': '#9490b8',
  '--fig-avatar-border': '2px solid #ff50c5',
  '--fig-avatar-shadow': '0px 2px 8px 0px rgba(130,100,240,0.13)',
  '--fig-avatar-grad': 'linear-gradient(135deg, #c8dcf9 0%, #d9c8f9 100%)',

  '--input-bg': '#ffffff',
  '--input-bt': '1px solid #270007',
  '--input-bl': '2px solid #270007',
  '--input-br': '4px solid #270007',
  '--input-bb': '1px solid #270007',
  '--input-radius': '32px',
  '--input-divider': 'rgba(39,0,7,0.15)',
  '--input-shadow': 'inset 4px 0 0 0 #49dbc8',

  '--input-header-bg': '#e5fcfa',
  '--input-header-shadow': 'inset 4px 0 0 0 #49dbc8',

  '--btn-secondary-bg': '#e5fcfa',
  '--btn-secondary-shadow': 'inset 4px 0 0 0 #49dbc8',
  '--btn-secondary-color': '#270007',
  '--btn-secondary-bt': '1px solid #400b14',
  '--btn-secondary-bl': '2px solid #400b14',
  '--btn-secondary-br': '4px solid #400b14',
  '--btn-secondary-bb': '1px solid #400b14',
  '--btn-secondary-radius': 'var(--btn-radius)',

  '--btn-secondary2-bg': '#ffe1ff',
  '--btn-secondary2-shadow': 'inset 4px 0 0 0 #ff50c5',
  '--btn-secondary2-color': '#270007',
  '--btn-secondary2-bt': '1px solid #400b14',
  '--btn-secondary2-bl': '2px solid #400b14',
  '--btn-secondary2-br': '4px solid #400b14',
  '--btn-secondary2-bb': '1px solid #400b14',
  '--btn-secondary2-radius': 'var(--btn-radius)',

  '--btn-bg': '#ffe2ac',
  '--btn-color': '#270007',
  '--btn-bt': '1px solid #400b14',
  '--btn-bl': '2px solid #400b14',
  '--btn-br': '4px solid #400b14',
  '--btn-bb': '1px solid #400b14',
  '--btn-radius': '32px',
  '--cta-solid-bg': '#ffe2ac',
  '--cta-solid-bg-disabled': '#e8e4dc',
  '--btn-shadow': 'none',
  '--btn-filter': 'none',
  '--btn-letter-spacing': '2px',
  '--btn-subtext-tracking': '0.6px',

  '--logo-ring': '#ffe2ac',
  '--logo-mark': '#c0605a',
  '--logo-text': '#ffe2ac',
  '--logo-font': 'var(--font-body)',
  '--logo-tracking': '0px',

  '--chat-user-accent': '#49dbc8',
  '--chat-lens-accent': '#ff50c5',

  '--fcard-bg': '#ffffff',
  '--fcard-bt': '1px solid #400b14',
  '--fcard-br': '4px solid #400b14',
  '--fcard-bb': '2px solid #400b14',
  '--fcard-bl': '4px solid #400b14',
  '--fcard-radius': '32px',
  '--fcard-filter': 'none',
  '--fcard-inset': 'inset 4px 0 0 0 rgba(64,11,20,0.5)',
  '--focus-ring': '3px solid rgba(255,80,197,0.7)',
  '--mm-card-bg-selected': '#eafaf0',
  '--btn-dis-color': 'rgba(39,0,7,0.3)',
  '--btn-dis-border': 'rgba(64,11,20,0.2)',

  '--preview-body': 'var(--text-body)',

  '--preview-glyph': '#7e2091',

  '--lens-header-bg': '#ffe1ff',
  '--lens-quote-color': '#cf006f',

  '--share-accent': '#c98a1a',

  '--portrait-filter': 'none',

  '--sw-bg': 'rgba(255,255,255,0.4)',
  '--sw-radius': '40px',
  '--sw-btn-radius': '32px',
  '--sw-btn-w': '94px',
  '--sw-btn-h': '40px',
  '--sw-cyberpunk-bg': '#49dbc8',
  '--sw-kawaii-bg': '#ff50c5',
  '--sw-notepad-bg': '#ffffff',
  '--sw-text': '#270007',
  '--sw-notepad-text': '#270007',
  '--sw-border': 'none',
  '--sw-shadow': 'none',
} as const satisfies Partial<Record<TokenVar, string>>;
