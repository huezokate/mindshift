// Static validator for the SQL migration file set under
// V200/supabase/migrations/. Catches an obviously-broken set — bad filenames,
// duplicate version prefixes, or gaps in the sequence — BEFORE it reaches prod.
//
// This is deliberately static: it never touches the database. It enforces the
// `NNN_name.sql` convention and that versions run contiguously from 001. Live
// parity (files vs applied schema) is a documented MCP/CLI step, not this guard
// — see docs/knowledge/migration-process.md.
//
// Zero dependencies (node built-ins only) so CI can run it with just `node`.
// `validateMigrations` is pure and exported for unit testing; the CLI runner at
// the bottom only executes when this file is invoked directly.

import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// A valid migration filename: three-digit version prefix, snake_case body,
// `.sql` extension. Lowercase only — keeps the set sortable and unambiguous.
export const MIGRATION_NAME_RE = /^\d{3}_[a-z0-9_]+\.sql$/;

/**
 * Validate a set of migration filenames (basenames, any order).
 * Pure: no filesystem access, no process exit.
 *
 * @param {string[]} filenames
 * @returns {{ ok: boolean, count: number, errors: string[] }}
 */
export function validateMigrations(filenames) {
  const errors = [];

  if (!filenames || filenames.length === 0) {
    return { ok: false, count: 0, errors: ['no migration files found'] };
  }

  // Rule: every file matches the NNN_name.sql convention.
  const wellFormed = [];
  for (const name of filenames) {
    if (!MIGRATION_NAME_RE.test(name)) {
      errors.push(`bad-name: "${name}" must match NNN_snake_name.sql (lowercase)`);
    } else {
      wellFormed.push(name);
    }
  }

  // Rule: no two files share a version prefix.
  const byVersion = new Map();
  for (const name of wellFormed) {
    const version = Number(name.slice(0, 3));
    if (byVersion.has(version)) {
      errors.push(
        `duplicate-version: ${String(version).padStart(3, '0')} used by ` +
          `"${byVersion.get(version)}" and "${name}"`,
      );
    } else {
      byVersion.set(version, name);
    }
  }

  // Rule: versions are contiguous starting at 001 (no gaps). A gap almost always
  // means a lost or misnamed migration. Only checked once names/dupes are clean,
  // so the message isn't drowned out by upstream noise.
  if (errors.length === 0) {
    const versions = [...byVersion.keys()].sort((a, b) => a - b);
    for (let i = 0; i < versions.length; i++) {
      const expected = i + 1;
      if (versions[i] !== expected) {
        errors.push(
          `non-contiguous: expected ${String(expected).padStart(3, '0')} but ` +
            `found ${String(versions[i]).padStart(3, '0')} — a version is ` +
            `missing or out of order`,
        );
        break;
      }
    }
  }

  return { ok: errors.length === 0, count: filenames.length, errors };
}

// --- CLI runner (only when invoked directly, e.g. `node check-migrations.mjs`) ---
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const migrationsDir = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../supabase/migrations',
  );

  let files;
  try {
    files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
  } catch (err) {
    console.error(`✗ cannot read migrations dir: ${migrationsDir}`);
    console.error(`  ${err.message}`);
    process.exit(1);
  }

  const { ok, count, errors } = validateMigrations(files);

  if (ok) {
    const last = String(count).padStart(3, '0');
    console.log(`✓ ${count} migrations, 001..${last} contiguous`);
    process.exit(0);
  }

  console.error(`✗ migration set is invalid (${errors.length} problem(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
