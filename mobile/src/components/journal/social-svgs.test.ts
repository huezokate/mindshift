import { describe, expect, it } from 'vitest';

import { brandFor, SOCIAL_SVG, type Brand } from './social-svgs';

const MODES = ['cyberpunk', 'kawaii', 'notepad'] as const;
const BRANDS: Brand[] = ['facebook', 'instagram', 'sms', 'tiktok'];

describe('SOCIAL_SVG', () => {
  it('carries a well-formed SVG for all 12 theme×brand pairs', () => {
    for (const mode of MODES) {
      expect(Object.keys(SOCIAL_SVG[mode]).sort()).toEqual([...BRANDS].sort());
      for (const brand of BRANDS) {
        const xml = SOCIAL_SVG[mode][brand];
        expect(xml.startsWith('<svg')).toBe(true);
        expect(xml.trimEnd().endsWith('</svg>')).toBe(true);
        // The Figma export bug this pipeline sanitizes: no bogus stroke-width=25.
        expect(xml).not.toContain('stroke-width="25"');
      }
    }
  });

  it('aliases link/native/download onto the sms artwork', () => {
    expect(brandFor('link')).toBe('sms');
    expect(brandFor('native')).toBe('sms');
    expect(brandFor('download')).toBe('sms');
    expect(brandFor('instagram')).toBe('instagram');
    expect(brandFor('tiktok')).toBe('tiktok');
    expect(brandFor('facebook')).toBe('facebook');
  });
});
