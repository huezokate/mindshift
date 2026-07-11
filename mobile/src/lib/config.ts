/**
 * Single access point for environment config. Screens and libs import from
 * here — never process.env directly.
 *
 * Values come from EXPO_PUBLIC_* vars (.env.local in dev, EAS env in builds).
 * See .env.example for the full list.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing env var ${name}. Copy mobile/.env.example to mobile/.env.local and fill it in.`,
    );
  }
  return value;
}

/** Base URL of the existing Next.js backend (no trailing slash). */
export const API_URL = required(
  'EXPO_PUBLIC_API_URL',
  process.env.EXPO_PUBLIC_API_URL,
).replace(/\/$/, '');

/** Clerk publishable key — same Clerk instance as the web app. */
export const CLERK_PUBLISHABLE_KEY = required(
  'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY',
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
);
