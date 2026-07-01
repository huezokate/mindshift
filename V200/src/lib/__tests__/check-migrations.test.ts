import { describe, expect, it } from 'vitest';

// The validator is a zero-dep .mjs so CI can run it under bare `node`. Vitest
// imports the ESM module directly; validateMigrations is pure (no fs).
import {
  MIGRATION_NAME_RE,
  validateMigrations,
} from '../../../scripts/check-migrations.mjs';

describe('validateMigrations', () => {
  it('accepts a contiguous, well-formed set', () => {
    const result = validateMigrations([
      '001_a.sql',
      '002_b.sql',
      '003_c.sql',
    ]);
    expect(result.ok).toBe(true);
    expect(result.count).toBe(3);
    expect(result.errors).toEqual([]);
  });

  it('accepts the real 001..007 migration set (order-independent)', () => {
    const result = validateMigrations([
      '007_lens_chat.sql',
      '001_journal.sql',
      '004_entry_titles.sql',
      '002_journal_v2.sql',
      '006_comp_users.sql',
      '003_waitlist.sql',
      '005_mindmap.sql',
    ]);
    expect(result.ok).toBe(true);
    expect(result.count).toBe(7);
  });

  it('rejects a filename that breaks the NNN_name.sql convention', () => {
    const result = validateMigrations(['001_a.sql', '2_b.sql']);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('2_b.sql'))).toBe(true);
  });

  it('rejects uppercase / non-snake filenames', () => {
    const result = validateMigrations(['001_A.sql']);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain('bad-name');
  });

  it('rejects a duplicate version prefix', () => {
    const result = validateMigrations(['001_a.sql', '001_b.sql']);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('duplicate-version'))).toBe(
      true,
    );
  });

  it('rejects a gap in the sequence', () => {
    const result = validateMigrations(['001_a.sql', '003_c.sql']);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('non-contiguous'))).toBe(true);
  });

  it('rejects an empty set', () => {
    const result = validateMigrations([]);
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(['no migration files found']);
  });

  it('exports a name regex anchored to the full string', () => {
    expect(MIGRATION_NAME_RE.test('001_journal.sql')).toBe(true);
    expect(MIGRATION_NAME_RE.test('x001_journal.sql')).toBe(false);
    expect(MIGRATION_NAME_RE.test('001_journal.sql.bak')).toBe(false);
  });
});
