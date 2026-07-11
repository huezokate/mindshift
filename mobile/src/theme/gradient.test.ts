import { describe, expect, it } from 'vitest';

import { themes } from './build';
import { parseLinearGradient } from './gradient';

describe('parseLinearGradient', () => {
  it('parses all three skins’ real --fig-avatar-grad strings', () => {
    const cyber = parseLinearGradient(themes.cyberpunk.fig.avatar.gradientCss);
    expect(cyber).toEqual({
      colors: ['rgba(0,245,255,0.1)', 'rgba(176,76,255,0.1)'],
      locations: [0, 1],
      start: { x: expect.closeTo(0, 5), y: expect.closeTo(0, 5) },
      end: { x: expect.closeTo(1, 5), y: expect.closeTo(1, 5) },
    });

    expect(parseLinearGradient(themes.kawaii.fig.avatar.gradientCss)?.colors).toEqual([
      '#c8dcf9',
      '#d9c8f9',
    ]);
    expect(parseLinearGradient(themes.notepad.fig.avatar.gradientCss)?.colors).toEqual([
      '#e8eef5',
      '#eee8f5',
    ]);
  });

  it('maps common angles onto start/end points', () => {
    const right = parseLinearGradient('linear-gradient(90deg, #000 0%, #fff 100%)');
    expect(right?.start).toEqual({ x: expect.closeTo(0, 5), y: expect.closeTo(0.5, 5) });
    expect(right?.end).toEqual({ x: expect.closeTo(1, 5), y: expect.closeTo(0.5, 5) });

    const down = parseLinearGradient('linear-gradient(180deg, #000 0%, #fff 100%)');
    expect(down?.start.y).toBeCloseTo(0, 5);
    expect(down?.end.y).toBeCloseTo(1, 5);
  });

  it('handles stops without explicit positions', () => {
    const g = parseLinearGradient('linear-gradient(135deg, #111, #222)');
    expect(g?.colors).toEqual(['#111', '#222']);
    expect(g?.locations).toBeUndefined();
  });

  it('returns null on unsupported grammar', () => {
    expect(parseLinearGradient('radial-gradient(#000, #fff)')).toBeNull();
    expect(parseLinearGradient('linear-gradient(to right, #000, #fff)')).toBeNull();
    expect(parseLinearGradient('#00F5FF')).toBeNull();
  });
});
