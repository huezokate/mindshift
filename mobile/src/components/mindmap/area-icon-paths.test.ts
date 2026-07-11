import { describe, expect, it } from 'vitest';

import { AREA_LABELS, AREA_PATHS, type AreaId } from './area-icon-paths';

const IDS: AreaId[] = ['career', 'health', 'relationship', 'personal', 'finance'];

describe('AREA_PATHS', () => {
  it('has a non-empty SVG path and a label for every AreaId', () => {
    expect(Object.keys(AREA_PATHS).sort()).toEqual([...IDS].sort());
    for (const id of IDS) {
      expect(AREA_PATHS[id]).toMatch(/^M[\d.]/);
      expect(AREA_PATHS[id].length).toBeGreaterThan(100);
      expect(AREA_LABELS[id]).toBeTruthy();
    }
  });
});
