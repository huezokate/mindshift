import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { cyberpunkVars } from './css-vars.cyberpunk';
import { kawaiiVars } from './css-vars.kawaii';
import { notepadVars } from './css-vars.notepad';

/**
 * The drift gate (design.md D3): the TS var maps must mirror the real web CSS
 * declaration-for-declaration, both directions. A token edit on either
 * platform fails here until mirrored on the other.
 */

function readCssVars(relPath: string): Record<string, string> {
  const path = fileURLToPath(new URL(relPath, import.meta.url));
  const css = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const vars: Record<string, string> = {};
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars[m[1]] = m[2].replace(/\s+/g, ' ').trim();
  }
  return vars;
}

const FILES = {
  cyberpunk: '../../../V200/src/styles/tokens.css',
  kawaii: '../../../V200/src/styles/tokens-kawaii.css',
  notepad: '../../../V200/src/styles/tokens-notepad.css',
} as const;

const MAPS = { cyberpunk: cyberpunkVars, kawaii: kawaiiVars, notepad: notepadVars } as const;

describe.each(Object.keys(FILES) as (keyof typeof FILES)[])('%s tokens', (skin) => {
  const cssVars = readCssVars(FILES[skin]);
  const map: Record<string, string> = MAPS[skin];

  it('declares the exact same set of custom properties as the CSS', () => {
    expect(Object.keys(map).sort()).toEqual(Object.keys(cssVars).sort());
  });

  it('carries every value verbatim (whitespace-normalized)', () => {
    for (const [name, value] of Object.entries(cssVars)) {
      expect(map[name], name).toBe(value);
    }
  });
});
